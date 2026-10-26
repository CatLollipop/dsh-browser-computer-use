import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { CdpClient, assertSafeUrl, cdpError, classifyAction, normalizeEndpoint, siteModeFor } from './cdp.js'
import { browserAvailability, launchBrowser } from './launcher.js'
import { PolicyStore, screenshotDir } from './policy.js'

export { classifyAction, cdpError }

export function createBrowserController({ policyStore = new PolicyStore() } = {}) {
  let client = null

  function clientFor() {
    if (client) return client
    const policy = policyStore.policy
    client = new CdpClient({ endpoint: policy.endpoint, allowRemoteEndpoint: policy.allowRemoteEndpoint })
    return client
  }

  function resetClient() {
    if (client) {
      client.disconnect()
      client = null
    }
  }

  function assertEnabled() {
    if (!policyStore.policy.enabled) {
      throw cdpError('BROWSER_DISABLED', '浏览器控制尚未启用：请在左侧栏「浏览器」面板打开开关，并确认调试端口地址。')
    }
  }

  async function withClient(targetId) {
    assertEnabled()
    const active = clientFor()
    await active.connect(targetId || policyStore.policy.lastTargetId || undefined)
    if (active.targetId) await policyStore.update({ lastTargetId: active.targetId })
    return active
  }

  return {
    async status() {
      await policyStore.load()
      const policy = policyStore.policy
      const availability = await browserAvailability()
      let reachable = false
      let browser = ''
      let tabs = 0
      if (policy.enabled) {
        try {
          const active = clientFor()
          const version = await active.version()
          browser = version.browser
          tabs = (await active.listTabs()).length
          reachable = true
        } catch {
          reachable = false
        }
      }
      return {
        enabled: policy.enabled,
        endpoint: policy.endpoint,
        sites: policy.sites,
        defaultMode: policy.defaultMode,
        allowRemoteEndpoint: policy.allowRemoteEndpoint,
        browser,
        tabs,
        reachable,
        executable: availability.executable,
        executableFound: availability.found,
      }
    },

    async enable(enabled) {
      await policyStore.load()
      await policyStore.update({ enabled: enabled === true })
      if (!enabled) resetClient()
      return this.status()
    },

    async configure({ endpoint, sites, defaultMode, allowRemoteEndpoint }) {
      await policyStore.load()
      const patch = {}
      if (endpoint !== undefined) patch.endpoint = normalizeEndpoint(endpoint)
      if (sites !== undefined) {
        if (!Array.isArray(sites)) throw cdpError('CONFIG_INVALID', 'sites 必须是数组。')
        patch.sites = sites
      }
      if (defaultMode !== undefined) {
        if (!['auto', 'ask', 'block'].includes(defaultMode)) throw cdpError('CONFIG_INVALID', 'defaultMode 必须是 auto、ask 或 block。')
        patch.defaultMode = defaultMode
      }
      if (allowRemoteEndpoint !== undefined) patch.allowRemoteEndpoint = allowRemoteEndpoint === true
      await policyStore.update(patch)
      resetClient()
      return this.status()
    },

    async setSite({ host, mode }) {
      await policyStore.load()
      const name = String(host || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
      if (!name) throw cdpError('SITE_REQUIRED', '请填写网站域名，例如 example.com。')
      if (!['auto', 'ask', 'block'].includes(mode)) throw cdpError('SITE_MODE_INVALID', '网站权限必须是 auto、ask 或 block。')
      const sites = policyStore.policy.sites.filter((entry) => entry.host !== name)
      sites.push({ host: name, mode })
      await policyStore.update({ sites })
      return this.status()
    },

    async removeSite({ host }) {
      await policyStore.load()
      const name = String(host || '').trim().toLowerCase()
      await policyStore.update({ sites: policyStore.policy.sites.filter((entry) => entry.host !== name) })
      return this.status()
    },

    /** Resolve the per-site permission for one action: auto (skip approval), ask (default), block. */
    modeFor(urlValue) {
      const policy = policyStore.policy
      if (!urlValue) return policy.defaultMode || 'ask'
      return siteModeFor(urlValue, policy.sites, policy.defaultMode)
    },

    async test() {
      assertEnabled()
      const active = clientFor()
      const version = await active.version()
      const tabs = await active.listTabs()
      policyStore.record({ action: 'test', ok: true, detail: version.browser })
      return { browser: version.browser, protocolVersion: version.protocolVersion, tabs: tabs.length }
    },

    async launch() {
      await policyStore.load()
      const result = await launchBrowser({ endpoint: policyStore.policy.endpoint })
      policyStore.record({ action: 'launch', ok: true, detail: result.executable })
      resetClient()
      return result
    },

    async tabs() {
      assertEnabled()
      const list = await clientFor().listTabs()
      return list
    },

    async open({ url, activate = true }) {
      assertEnabled()
      const target = assertSafeUrl(url, { allowHosts: policyStore.policy.sites })
      const active = clientFor()
      const tab = await active.newTab(target)
      if (activate) await active.activate(tab.id)
      policyStore.record({ action: 'open', ok: true, detail: target })
      return tab
    },

    async navigate({ url, targetId }) {
      assertEnabled()
      const target = assertSafeUrl(url, { allowHosts: policyStore.policy.sites })
      const active = await withClient(targetId)
      const info = await active.navigate(target)
      policyStore.record({ action: 'navigate', ok: true, detail: target })
      return info
    },

    async read({ targetId } = {}) {
      assertEnabled()
      const active = await withClient(targetId)
      const page = await active.readPage()
      policyStore.record({ action: 'read', ok: true, detail: page.url })
      return page
    },

    async screenshot({ targetId, fullPage = false } = {}) {
      assertEnabled()
      const active = await withClient(targetId)
      const shot = await active.screenshot({ fullPage })
      const dir = screenshotDir()
      await mkdir(dir, { recursive: true })
      const file = path.join(dir, `${new Date().toISOString().replace(/[:.]/g, '-')}.png`)
      await writeFile(file, Buffer.from(shot.base64, 'base64'))
      const info = await active.pageInfo().catch(() => ({ url: '' }))
      policyStore.record({ action: 'screenshot', ok: true, detail: info.url || file })
      return { file, dataUrl: `data:image/png;base64,${shot.base64}`, page: info }
    },

    async activate({ targetId }) {
      assertEnabled()
      const result = await clientFor().activate(targetId)
      await policyStore.update({ lastTargetId: String(targetId || '') })
      resetClient()
      policyStore.record({ action: 'activate', ok: true, detail: String(targetId || '') })
      return result
    },

    async closeTab({ targetId }) {
      assertEnabled()
      const result = await clientFor().closeTab(targetId)
      resetClient()
      policyStore.record({ action: 'close', ok: true, detail: String(targetId || '') })
      return result
    },

    async click({ targetId, selector, x, y }) {
      assertEnabled()
      const active = await withClient(targetId)
      let result
      if (selector) result = await active.click(selector)
      else if (x !== undefined && y !== undefined) result = await active.clickAt(x, y)
      else throw cdpError('SELECTOR_REQUIRED', 'click 需要 selector，或同时提供 x、y 坐标。')
      policyStore.record({ action: 'click', ok: true, detail: selector || `${result.x},${result.y}` })
      return result
    },

    async type({ targetId, selector, text }) {
      assertEnabled()
      const active = await withClient(targetId)
      const result = await active.type(String(text ?? ''), { selector })
      policyStore.record({ action: 'type', ok: true, detail: selector || '(focused)' })
      return result
    },

    async key({ targetId, key }) {
      assertEnabled()
      const active = await withClient(targetId)
      const result = await active.pressKey(key)
      policyStore.record({ action: 'key', ok: true, detail: String(key) })
      return result
    },

    async scroll({ targetId, deltaY }) {
      assertEnabled()
      const active = await withClient(targetId)
      const result = await active.scroll(deltaY)
      policyStore.record({ action: 'scroll', ok: true, detail: String(result.scrolled) })
      return result
    },

    async currentUrl() {
      assertEnabled()
      try {
        const active = clientFor()
        await active.connect(policyStore.policy.lastTargetId || undefined)
        const info = await active.pageInfo()
        return info.url || ''
      } catch {
        return ''
      }
    },

    async history({ limit } = {}) {
      await policyStore.load()
      return policyStore.listHistory(limit || 30)
    },

    async clearHistory() {
      policyStore.history.length = 0
      return { cleared: true }
    },

    async dispatch(payload = {}) {
      const action = String(payload.action || 'status')
      const handlers = {
        status: () => this.status(),
        enable: () => this.enable(payload.enabled),
        configure: () => this.configure(payload),
        setSite: () => this.setSite(payload),
        removeSite: () => this.removeSite(payload),
        test: () => this.test(),
        launch: () => this.launch(),
        tabs: () => this.tabs(),
        open: () => this.open(payload),
        navigate: () => this.navigate(payload),
        read: () => this.read(payload),
        screenshot: () => this.screenshot(payload),
        activate: () => this.activate(payload),
        closeTab: () => this.closeTab(payload),
        click: () => this.click(payload),
        type: () => this.type(payload),
        key: () => this.key(payload),
        scroll: () => this.scroll(payload),
        history: () => this.history(payload),
        clearHistory: () => this.clearHistory(),
      }
      const handler = handlers[action]
      if (!handler) return { ok: false, error: { code: 'UNKNOWN_ACTION', message: `未知操作：${action}` } }
      try {
        return { ok: true, value: await handler() }
      } catch (error) {
        return { ok: false, error: { code: error?.code || 'BROWSER_FAILED', message: String(error?.message || error) } }
      }
    },
  }
}

export function registerRpcRoute(ctx, controller) {
  const registry = ctx?.connection?.fetch
  if (typeof registry?.register !== 'function') return () => {}
  try {
    return registry.register({
      path: '/api/dsh-browser-computer-use',
      methods: ['POST'],
      requestBody: 'buffered',
      async fetch(request) {
        let message
        try { message = await request.json() } catch {
          return Response.json({ type: 'server-response', rpcId: 'invalid', result: { ok: false, error: { code: 'bad-request', message: 'Request is not JSON.' } } }, { status: 400 })
        }
        const rpcId = typeof message?.rpcId === 'string' ? message.rpcId : 'invalid'
        const payload = message?.payload && typeof message.payload === 'object' ? message.payload : {}
        let result
        try {
          result = await controller.dispatch(payload)
        } catch (error) {
          result = { ok: false, error: { code: 'rpc_error', message: String(error?.message || error) } }
        }
        return Response.json({ type: 'server-response', rpcId, result })
      },
    })
  } catch { return () => {} }
}
