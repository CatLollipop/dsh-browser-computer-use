import { setTimeout as delay } from 'node:timers/promises'

const DEFAULT_TIMEOUT = 20000
const BLOCKED_SCHEMES = ['file:', 'data:', 'javascript:', 'chrome:', 'devtools:', 'edge:', 'about:', 'view-source:']

export function normalizeEndpoint(input) {
  const raw = String(input || '').trim()
  if (!raw) throw cdpError('ENDPOINT_REQUIRED', 'Chrome 调试地址不能为空。')
  const withScheme = /^[a-z]+:\/\//i.test(raw) ? raw : `http://${raw}`
  let url
  try { url = new URL(withScheme) } catch { throw cdpError('ENDPOINT_INVALID', 'Chrome 调试地址格式不正确。') }
  if (url.protocol !== 'http:') throw cdpError('ENDPOINT_INVALID', '调试地址必须是 http:// 或裸 host:port。')
  if (!url.port) url.port = '9222'
  return url.origin
}

export function assertSafeUrl(value, { allowHosts = [] } = {}) {
  const raw = String(value || '').trim()
  if (!raw) throw cdpError('URL_REQUIRED', '缺少 URL。')
  let url
  try { url = new URL(raw) } catch { throw cdpError('URL_INVALID', `不是合法 URL：${raw.slice(0, 200)}`) }
  if (!['http:', 'https:'].includes(url.protocol)) throw cdpError('URL_BLOCKED', `拒绝访问 ${url.protocol} 页面。`)
  if (BLOCKED_SCHEMES.some((scheme) => raw.toLowerCase().startsWith(scheme))) throw cdpError('URL_BLOCKED', '该协议被禁止访问。')
  if (url.username || url.password) throw cdpError('URL_BLOCKED', 'URL 中不允许携带账号密码。')
  const sites = (allowHosts || []).map((entry) => typeof entry === 'string' ? { host: entry, mode: 'ask' } : entry)
  const host = url.hostname.toLowerCase()
  const matched = sites.find((entry) => {
    const target = String(entry?.host || '').trim().toLowerCase().replace(/^\./, '')
    return target && (host === target || host.endsWith(`.${target}`))
  })
  if (matched && matched.mode === 'block') throw cdpError('HOST_BLOCKED', `该网站被设置为禁止访问：${url.hostname}`)
  return url.toString()
}

export function siteModeFor(urlValue, sites = []) {
  let host
  try { host = new URL(String(urlValue || '')).hostname.toLowerCase() } catch { return 'ask' }
  const matched = (sites || []).find((entry) => {
    const target = String(entry?.host || '').trim().toLowerCase().replace(/^\./, '')
    return target && (host === target || host.endsWith(`.${target}`))
  })
  return matched?.mode || 'ask'
}

export function cdpError(code, message) {
  const error = new Error(message)
  error.code = code
  return error
}

function isLoopback(hostname) {
  return ['127.0.0.1', 'localhost', '::1', '[::1]'].includes(String(hostname).toLowerCase())
}

export class CdpClient {
  constructor({ endpoint, timeoutMs = DEFAULT_TIMEOUT, allowRemoteEndpoint = false } = {}) {
    this.endpoint = normalizeEndpoint(endpoint)
    this.timeoutMs = timeoutMs
    this.allowRemoteEndpoint = allowRemoteEndpoint
    this.ws = null
    this.targetId = null
    this.nextId = 1
    this.pending = new Map()
    this.closed = false
  }

  baseUrl() {
    const url = new URL(this.endpoint)
    if (!this.allowRemoteEndpoint && !isLoopback(url.hostname)) {
      throw cdpError('ENDPOINT_NOT_LOOPBACK', '默认只允许 loopback 调试端口；请显式允许远程端点。')
    }
    return this.endpoint
  }

  async requestJson(path, init) {
    const url = `${this.baseUrl()}${path}`
    let response
    try {
      response = await fetch(url, { ...init, signal: AbortSignal.timeout(this.timeoutMs) })
    } catch (cause) {
      throw cdpError('CDP_UNREACHABLE', `无法连接 Chrome 调试端口（${this.endpoint}）。请确认已用 --remote-debugging-port 启动浏览器。`)
    }
    const text = await response.text()
    let body = null
    try { body = text ? JSON.parse(text) : null } catch { body = null }
    return { ok: response.ok, status: response.status, body, text }
  }

  async version() {
    const { ok, status, body } = await this.requestJson('/json/version')
    if (!ok || !body) throw cdpError('CDP_UNAVAILABLE', `调试端口返回 HTTP ${status}。`)
    return { browser: body.Browser || 'unknown', protocolVersion: body['Protocol-Version'] || '', webSocketDebuggerUrl: body.webSocketDebuggerUrl || '' }
  }

  async listTabs() {
    const { ok, body } = await this.requestJson('/json/list')
    if (!ok || !Array.isArray(body)) throw cdpError('CDP_UNAVAILABLE', '无法读取标签页列表。')
    return body
      .filter((target) => target.type === 'page' && target.webSocketDebuggerUrl)
      .map((target) => ({
        id: target.id,
        title: String(target.title || ''),
        url: String(target.url || ''),
        type: target.type,
      }))
  }

  async newTab(url) {
    const target = assertSafeUrl(url)
    const response = await this.requestJson(`/json/new?${encodeURIComponent(target)}`, { method: 'PUT' })
    if (!response.ok || !response.body?.id) throw cdpError('TAB_CREATE_FAILED', `无法新建标签页（HTTP ${response.status}）。`)
    return { id: response.body.id, title: response.body.title || '', url: response.body.url || target, type: 'page' }
  }

  async closeTab(targetId) {
    const id = String(targetId || '')
    if (!id) throw cdpError('TARGET_REQUIRED', '缺少标签页 id。')
    const { ok } = await this.requestJson(`/json/close/${encodeURIComponent(id)}`)
    if (!ok) throw cdpError('TAB_CLOSE_FAILED', '无法关闭标签页。')
    if (this.targetId === id) this.disconnect()
    return { closed: true, id }
  }

  async activate(targetId) {
    const id = String(targetId || '')
    if (!id) throw cdpError('TARGET_REQUIRED', '缺少标签页 id。')
    const { ok } = await this.requestJson(`/json/activate/${encodeURIComponent(id)}`)
    if (!ok) throw cdpError('TAB_ACTIVATE_FAILED', '无法激活标签页。')
    return { activated: true, id }
  }

  async connect(targetId) {
    const tabs = await this.listTabs()
    if (tabs.length === 0) throw cdpError('NO_TAB', '没有可控制的标签页，请先打开一个网页。')
    const target = targetId ? tabs.find((tab) => tab.id === targetId) : tabs[0]
    if (!target) throw cdpError('TARGET_NOT_FOUND', '找不到目标标签页。')
    const listBody = await this.requestJson('/json/list')
    const raw = (listBody.body || []).find((entry) => entry.id === target.id)
    if (!raw?.webSocketDebuggerUrl) throw cdpError('CDP_UNAVAILABLE', '目标标签页缺少调试 WebSocket 地址。')
    if (this.ws && this.targetId === target.id) return this
    this.disconnect()
    await this.openSocket(raw.webSocketDebuggerUrl)
    this.targetId = target.id
    await this.send('Page.enable')
    await this.send('Runtime.enable')
    return this
  }

  openSocket(wsUrl) {
    return new Promise((resolve, reject) => {
      let settled = false
      const socket = new WebSocket(wsUrl)
      const timer = setTimeout(() => {
        if (settled) return
        settled = true
        try { socket.close() } catch {}
        reject(cdpError('CDP_CONNECT_TIMEOUT', '连接标签页调试通道超时。'))
      }, this.timeoutMs)
      socket.addEventListener('open', () => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        this.ws = socket
        resolve()
      })
      socket.addEventListener('message', (event) => this.onMessage(event.data))
      socket.addEventListener('error', () => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        reject(cdpError('CDP_CONNECT_FAILED', '无法建立 CDP WebSocket 连接。'))
      })
      socket.addEventListener('close', () => {
        this.ws = null
        for (const [, entry] of this.pending) {
          clearTimeout(entry.timer)
          entry.reject(cdpError('CDP_CLOSED', '调试通道已关闭。'))
        }
        this.pending.clear()
      })
    })
  }

  onMessage(raw) {
    let message
    try { message = JSON.parse(String(raw)) } catch { return }
    if (message.id && this.pending.has(message.id)) {
      const entry = this.pending.get(message.id)
      this.pending.delete(message.id)
      clearTimeout(entry.timer)
      if (message.error) entry.reject(cdpError('CDP_COMMAND_FAILED', `${entry.method}: ${message.error.message || '调用失败'}`))
      else entry.resolve(message.result)
    }
  }

  send(method, params = {}) {
    const socket = this.ws
    if (!socket) return Promise.reject(cdpError('CDP_NOT_CONNECTED', '尚未连接调试通道。'))
    const id = this.nextId++
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(cdpError('CDP_COMMAND_TIMEOUT', `${method} 超时。`))
      }, this.timeoutMs)
      this.pending.set(id, { resolve, reject, timer, method })
      try { socket.send(JSON.stringify({ id, method, params })) } catch (cause) {
        clearTimeout(timer)
        this.pending.delete(id)
        reject(cdpError('CDP_SEND_FAILED', `发送 ${method} 失败。`))
      }
    })
  }

  async evaluate(expression, { awaitPromise = true } = {}) {
    const result = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise,
      userGesture: true,
    })
    if (result?.exceptionDetails) {
      throw cdpError('EVAL_FAILED', result.exceptionDetails.text || '页面脚本执行失败。')
    }
    return result?.result?.value
  }

  async pageInfo() {
    const info = await this.evaluate(`(() => ({ url: location.href, title: document.title, readyState: document.readyState }))()`)
    return { ...info, targetId: this.targetId }
  }

  async navigate(url, { waitMs = 1200 } = {}) {
    const target = assertSafeUrl(url)
    await this.connect(this.targetId || undefined)
    await this.send('Page.navigate', { url: target })
    await delay(waitMs)
    return this.pageInfo()
  }

  async click(selector) {
    const ok = await this.evaluate(`(() => {
      const el = document.querySelector(${JSON.stringify(String(selector))});
      if (!el) return null;
      el.scrollIntoView({ block: 'center', inline: 'center' });
      const rect = el.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`)
    if (!ok) throw cdpError('SELECTOR_NOT_FOUND', `找不到元素：${selector}`)
    await this.clickAt(ok.x, ok.y)
    return { clicked: selector, x: ok.x, y: ok.y }
  }

  async clickAt(x, y) {
    const point = { x: Math.round(Number(x)), y: Math.round(Number(y)), button: 'left', clickCount: 1 }
    await this.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point })
    await this.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point })
    return { x: point.x, y: point.y }
  }

  async type(text, { selector } = {}) {
    const value = String(text ?? '')
    if (selector) {
      await this.focus(selector)
      const isPassword = await this.evaluate(`(() => {
        const el = document.activeElement;
        return el ? el.type === 'password' : false;
      })()`)
      if (isPassword) throw cdpError('PASSWORD_FIELD_BLOCKED', '检测到密码输入框，拒绝自动填写；请用户手动输入。')
    }
    await this.send('Input.insertText', { text: value })
    return { typed: value.length, selector: selector || null }
  }

  async focus(selector) {
    const ok = await this.evaluate(`(() => {
      const el = document.querySelector(${JSON.stringify(String(selector))});
      if (!el) return false;
      el.focus();
      return true;
    })()`)
    if (!ok) throw cdpError('SELECTOR_NOT_FOUND', `找不到元素：${selector}`)
    return { focused: selector }
  }

  async pressKey(key) {
    const name = String(key || '')
    const map = {
      Enter: { key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 },
      Tab: { key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 },
      Escape: { key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 },
      Backspace: { key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8, nativeVirtualKeyCode: 8 },
      ArrowUp: { key: 'ArrowUp', code: 'ArrowUp', windowsVirtualKeyCode: 38, nativeVirtualKeyCode: 38 },
      ArrowDown: { key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40, nativeVirtualKeyCode: 40 },
      ArrowLeft: { key: 'ArrowLeft', code: 'ArrowLeft', windowsVirtualKeyCode: 37, nativeVirtualKeyCode: 37 },
      ArrowRight: { key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39, nativeVirtualKeyCode: 39 },
      PageDown: { key: 'PageDown', code: 'PageDown', windowsVirtualKeyCode: 34, nativeVirtualKeyCode: 34 },
      PageUp: { key: 'PageUp', code: 'PageUp', windowsVirtualKeyCode: 33, nativeVirtualKeyCode: 33 },
    }
    const entry = map[name]
    if (!entry) throw cdpError('KEY_UNSUPPORTED', `不支持的按键：${name}`)
    await this.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...entry })
    await this.send('Input.dispatchKeyEvent', { type: 'keyUp', ...entry })
    return { key: name }
  }

  async scroll(deltaY = 600) {
    const amount = Math.max(-4000, Math.min(4000, Math.round(Number(deltaY) || 0)))
    await this.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 10, y: 10, deltaX: 0, deltaY: amount })
    return { scrolled: amount }
  }

  async screenshot({ fullPage = false } = {}) {
    let clip
    if (fullPage) {
      const metrics = await this.send('Page.getLayoutMetrics')
      const size = metrics?.cssContentSize || metrics?.contentSize
      if (size?.width && size?.height) {
        clip = { x: 0, y: 0, width: Math.min(size.width, 4096), height: Math.min(size.height, 12000), scale: 1 }
      }
    }
    const result = await this.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: Boolean(fullPage), ...(clip ? { clip } : {}) })
    const base64 = String(result?.data || '')
    if (!base64) throw cdpError('SCREENSHOT_FAILED', '页面没有返回截图数据。')
    return { base64, mediaType: 'image/png' }
  }

  async readPage() {
    const data = await this.evaluate(`(() => {
      const text = (document.body?.innerText || '').replace(/\\n{3,}/g, '\\n\\n').slice(0, 12000);
      const links = Array.from(document.querySelectorAll('a[href]')).slice(0, 40).map((a) => ({ text: (a.innerText || '').trim().slice(0, 120), href: a.href })).filter((item) => item.href.startsWith('http'));
      return { url: location.href, title: document.title, text, links };
    })()`)
    return data
  }

  disconnect() {
    const socket = this.ws
    this.ws = null
    this.targetId = null
    if (socket) {
      try { socket.close() } catch {}
    }
  }

  async close() {
    this.closed = true
    this.disconnect()
  }
}

export function classifyAction(action) {
  const readonly = new Set(['status', 'version', 'tabs', 'read', 'screenshot'])
  const mutating = new Set(['open', 'navigate', 'click', 'type', 'key', 'scroll', 'activate', 'close'])
  if (readonly.has(action)) return 'L1'
  if (mutating.has(action)) return 'L2'
  return 'L4'
}
