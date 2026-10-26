window.__ModuleLoader__.load({
  id: '@local/dsh-browser-computer-use',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const zh = {
      title: '浏览器',
      intro: '为 Agent 提供真实 Chromium 浏览器的控制能力：读取页面、点击、输入、截图。默认关闭，需要在这里手动开启。',
      privacy: '写操作默认逐次请求你的批准；密码框、cookie、文件协议与私有接口都被拒绝。',
      usage: '开启后，Agent 通过 browser-use 技能与 browser 工具工作：先看状态，再读页面，写操作前请求批准。',
      name: 'CDP 浏览器控制',
      sub: 'Chrome DevTools Protocol · 本机独立配置目录',
      enable: '启用',
      on: '已连接', off: '未启用', wait: '未连接调试端口',
      offSub: '打开右侧开关后，插件会连接调试端口；如果还没有浏览器，点「启动浏览器」以独立配置启动一个。',
      waitSub: '已启用，但还没有连上调试端口。请启动浏览器或检查地址。',
      onSub: '浏览器已就绪，Agent 可以读取页面并在你批准后执行写操作。',
      tabsUnit: '个标签页',
      retest: '重新检测', launch: '启动浏览器', clear: '清空记录', working: '正在处理…',
      connected: '连接成功。', launched: '浏览器已启动。', revoked: '已清空操作记录。', failed: '操作失败。',
      endpoint: '调试地址', saveEndpoint: '保存地址',
      permissions: '浏览器权限',
      historyLabel: '历史记录', historyHint: 'Agent 读取你自己的浏览历史前必须先询问。', alwaysAsk: '始终询问',
      defaultMode: '默认网站权限', defaultModeHint: '没有单独设置的网站使用这个默认权限。',
      sitePerms: '网站权限', sitePermsHint: '设置默认权限，并为特定网站单独配置例外。',
      defaultRow: '默认', addSite: '添加', hostPlaceholder: 'example.com',
      browse: '操作', modeAuto: '自动允许', modeAsk: '需要批准', modeBlock: '禁止',
      remove: '移除', emptySites: '还没有自定义权限的网站。',
      developer: '开发者模式', risk: '风险升级',
      cdpLabel: '启用完整 CDP 访问权限',
      cdpHint: '允许 Agent 在已连接的浏览器会话中使用完整的 Chrome DevTools Protocol 检查并控制浏览器内部功能，可能使你的数据面临风险。',
      recent: '最近操作', noRecent: '暂无操作记录。',
      error: '操作失败：', loading: '正在读取配置…', unavailable: '无法连接宿主，请刷新页面后重试。',
      skillsHint: '随插件提供 browser-use 技能：Agent 会按“先观察、再动作、逐步批准”的流程使用浏览器。',
      statusLabel: '连接状态', browserLabel: '浏览器', lastCheck: '最后检测', neverChecked: '尚未检测', tabsCount: '标签页', stateOn: '已开启', stateOff: '已关闭',
      connectedTo: '已连接', notConnected: '未连接', disabledState: '未启用',
      noExecutable: '没有找到 Chromium 内核浏览器，请安装 Chrome/Edge，或设置 DSH_BROWSER_EXECUTABLE。',
    }
    const en = {
      title: 'Browser',
      intro: 'Give the agent control of a real Chromium browser: read pages, click, type, and capture screenshots. Off by default; enable it here first.',
      privacy: 'Write actions ask for your approval each time; password fields, cookies, file URLs, and private endpoints are refused.',
      usage: 'Once enabled the agent works through the browser-use skill and the browser tool: check status, read the page, then ask before writing.',
      name: 'CDP browser control',
      sub: 'Chrome DevTools Protocol · isolated local profile',
      enable: 'Enable',
      on: 'Connected', off: 'Disabled', wait: 'Debug port not reachable',
      offSub: 'Turn the switch on to connect to the debug port; if no browser is running, press Launch browser to start one with an isolated profile.',
      waitSub: 'Enabled, but the debug port is not reachable yet. Launch a browser or check the address.',
      onSub: 'Browser is ready; the agent can read pages and, with your approval, act.',
      tabsUnit: 'tabs',
      retest: 'Re-check', launch: 'Launch browser', clear: 'Clear log', working: 'Working…',
      connected: 'Connected.', launched: 'Browser launched.', revoked: 'Action log cleared.', failed: 'Something went wrong.',
      endpoint: 'Debug endpoint', saveEndpoint: 'Save endpoint',
      permissions: 'Browser permissions',
      historyLabel: 'Browsing history', historyHint: 'The agent must ask before reading your browsing history.', alwaysAsk: 'Always ask',
      defaultMode: 'Default site permission', defaultModeHint: 'Sites without an override use this permission.',
      sitePerms: 'Site permissions', sitePermsHint: 'Set a default and configure per-site exceptions.',
      defaultRow: 'Default', addSite: 'Add', hostPlaceholder: 'example.com',
      browse: 'Actions', modeAuto: 'Auto allow', modeAsk: 'Needs approval', modeBlock: 'Block',
      remove: 'Remove', emptySites: 'No custom site permissions yet.',
      developer: 'Developer mode', risk: 'Elevated risk',
      cdpLabel: 'Enable full CDP access',
      cdpHint: 'Let the agent use the full Chrome DevTools Protocol inside a connected browser session to inspect and control sensitive internals; this may put your data at risk.',
      recent: 'Recent actions', noRecent: 'No actions yet.',
      error: 'Something went wrong: ', loading: 'Loading configuration…', unavailable: 'Cannot reach the host. Refresh the page and try again.',
      skillsHint: 'The bundle ships a browser-use skill so the agent follows observe → act → ask → verify.',
      statusLabel: 'Connection', browserLabel: 'Browser', lastCheck: 'Last check', neverChecked: 'Not checked yet', tabsCount: 'Tabs', stateOn: 'On', stateOff: 'Off',
      connectedTo: 'Connected', notConnected: 'Not connected', disabledState: 'Disabled',
      noExecutable: 'No Chromium browser found. Install Chrome/Edge or set DSH_BROWSER_EXECUTABLE.',
    }

    const CSS = `
.bw-page { box-sizing: border-box; max-width: 680px; margin: 0 auto; padding: 8px 4px 24px; color: var(--dsw-alias-label-primary); font: inherit; }
.bw-page * { box-sizing: border-box; }
.bw-head h1 { margin: 0 0 8px; font-size: 20px; font-weight: 600; line-height: 1.3; }
.bw-head p, .bw-help, .bw-muted { margin: 0; color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 1.5; }
.bw-head p + p { margin-top: 4px; }
.bw-card { margin-top: 16px; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.bw-card-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
.bw-card h2 { margin: 0; font-size: 17px; font-weight: 600; letter-spacing: 0.1px; }
.bw-card-head .bw-muted { margin-top: 4px; }
.bw-switch-row { display: flex; align-items: center; gap: 10px; flex: none; font-size: 12px; color: var(--dsw-alias-label-secondary); }
.bw-switch { width: 42px; height: 24px; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); padding: 0; position: relative; cursor: pointer; transition: background-color .16s ease, border-color .16s ease; }
.bw-switch[aria-checked="true"] { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); }
.bw-thumb { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: var(--dsw-alias-bg-base); box-shadow: 0 1px 2px rgba(0,0,0,.18); transition: left .16s ease; }
.bw-switch[aria-checked="true"] .bw-thumb { left: 20px; }
.bw-switch:disabled { cursor: default; opacity: .6; }
.bw-hero { display: flex; gap: 12px; align-items: flex-start; padding: 14px 16px; border-radius: 12px; background: var(--dsw-alias-bg-layer-2); border: 1px solid var(--dsw-alias-border-l1); }
.bw-dot { flex: none; width: 9px; height: 9px; margin-top: 5px; border-radius: 50%; background: var(--dsw-alias-state-idle-primary); }
.bw-dot[data-tone="on"] { background: var(--dsw-alias-state-success-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-success-primary) 18%, transparent); }
.bw-dot[data-tone="wait"] { background: var(--dsw-alias-state-warn-primary); animation: bw-pulse 1.4s ease-in-out infinite; }
@keyframes bw-pulse { 0%,100% { opacity: 1 } 50% { opacity: .35 } }
.bw-hero-body { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.bw-hero-title { font-size: 14px; font-weight: 600; line-height: 1.4; }
.bw-hero-sub { font-size: 12.5px; line-height: 1.55; color: var(--dsw-alias-label-secondary); }
.bw-hero-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.bw-chip-ok { color: var(--dsw-alias-state-success-primary); border-color: var(--dsw-alias-state-success-primary); }
.bw-chip-warn { color: var(--dsw-alias-state-warn-primary); border-color: var(--dsw-alias-state-warn-primary); }
.bw-hintbox { padding: 12px 14px; border-radius: 10px; border: 1px dashed var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-2); font-size: 12.5px; line-height: 1.65; color: var(--dsw-alias-label-secondary); }
.bw-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.bw-label { font-size: 12.5px; color: var(--dsw-alias-label-secondary); flex: none; }
.bw-input { flex: 1; min-width: 160px; min-height: 32px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; }
.bw-select { min-height: 32px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; }
.bw-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.bw-primary { min-height: 32px; padding: 0 14px; border-radius: 8px; border: 1px solid var(--dsw-alias-brand-primary); background: var(--dsw-alias-brand-primary); color: var(--dsw-alias-bg-base); font: inherit; font-size: 13px; font-weight: 500; cursor: pointer; }
.bw-secondary { min-height: 32px; padding: 0 14px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; cursor: pointer; }
.bw-link { padding: 0; border: 0; background: none; color: var(--dsw-alias-brand-primary); font: inherit; font-size: 12.5px; cursor: pointer; }
.bw-page button:disabled { cursor: default; opacity: .55; }
.bw-page :focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }
.bw-section-title { margin: 0; font-size: 15px; font-weight: 600; }
.bw-split { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; border-top: 1px solid var(--dsw-alias-border-l1); padding-top: 14px; }
.bw-split:first-of-type { border-top: 0; padding-top: 0; }
.bw-split strong { display: block; font-size: 13.5px; font-weight: 600; }
.bw-split .bw-help { margin-top: 3px; }
.bw-table { border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; overflow: hidden; }
.bw-thead, .bw-trow { display: grid; grid-template-columns: minmax(0,1.6fr) minmax(0,1fr) auto; gap: 10px; align-items: center; padding: 10px 14px; }
.bw-thead { background: var(--dsw-alias-bg-layer-2); font-size: 12px; color: var(--dsw-alias-label-secondary); }
.bw-trow { border-top: 1px solid var(--dsw-alias-border-l1); font-size: 13px; }
.bw-trow .bw-host { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bw-risk { border: 1px solid var(--dsw-alias-state-warn-primary); border-radius: 12px; padding: 16px; background: var(--dsw-alias-bg-layer-1); display: flex; flex-direction: column; gap: 10px; }
.bw-risk-head { display: flex; align-items: center; gap: 8px; color: var(--dsw-alias-state-warn-primary); font-size: 12.5px; font-weight: 600; }
.bw-risk-row { display: flex; justify-content: space-between; gap: 14px; align-items: flex-start; }
.bw-risk-row strong { display: block; font-size: 13.5px; font-weight: 600; }
.bw-risk-row .bw-help { margin-top: 4px; }
.bw-ok { margin: 0; color: var(--dsw-alias-state-success-primary); font-size: 12.5px; }
.bw-error, .bw-note { margin: 0; color: var(--dsw-alias-state-error-primary); font-size: 12.5px; line-height: 1.5; }
.bw-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
.bw-chip { display: inline-flex; align-items: center; gap: 6px; padding: 2px 9px; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-secondary); font-size: 11.5px; line-height: 18px; }
`

    function dictOf(ctx) {
      try {
        const active = String(ctx.locale?.getSnapshot?.()?.active || 'en')
        return active.toLowerCase().startsWith('zh') ? zh : en
      } catch { return en }
    }
    const translate = (ctx, key) => dictOf(ctx)[key] ?? key

    async function callHost(ctx, payload) {
      const rpc = ctx.connection?.rpc
      if (!rpc?.call) throw new Error(translate(ctx, 'unavailable'))
      const reply = await rpc.call('/api', 'dsh-browser-computer-use', payload)
      if (reply?.ok === false) {
        const error = new Error(reply.error?.message || translate(ctx, 'failed'))
        error.code = reply.error?.code
        throw error
      }
      return reply && typeof reply === 'object' && 'value' in reply ? reply.value : reply
    }

    function ConfigPage({ ctx }) {
      const t = (key) => translate(ctx, key)
      const [status, setStatus] = React.useState(null)
      const [endpoint, setEndpoint] = React.useState('')
      const [busy, setBusy] = React.useState('')
      const [note, setNote] = React.useState('')
      const [noteOk, setNoteOk] = React.useState(false)
      const [loadError, setLoadError] = React.useState('')
      const [sites, setSites] = React.useState([])
      const [siteHost, setSiteHost] = React.useState('')
      const [lastCheck, setLastCheck] = React.useState('')

      const load = React.useCallback(async () => {
        try {
          const value = await callHost(ctx, { action: 'status' })
          setStatus(value)
          setSites(Array.isArray(value?.sites) ? value.sites : [])
          setEndpoint((current) => current || value?.endpoint || '')
          setLastCheck(new Date().toLocaleTimeString())
          setLoadError('')
        } catch (error) {
          setLoadError(error?.message || t('unavailable'))
        }
      }, [])

      React.useEffect(() => { load() }, [])

      // Keep the connection badge fresh so "connected" is visible without pressing re-check.
      React.useEffect(() => {
        if (!status?.enabled) return undefined
        const timer = setInterval(() => { load() }, 5000)
        return () => clearInterval(timer)
      }, [status?.enabled])

      async function run(key, task, message) {
        setBusy(key); setNote(''); setNoteOk(false)
        try {
          const value = await task()
          await load()
          if (message) { setNote(message); setNoteOk(true) }
          return value
        } catch (error) {
          setNote(error?.message || t('failed')); setNoteOk(false); return null
        } finally { setBusy('') }
      }

      async function saveSites(next) {
        setSites(next)
        await run('site', () => callHost(ctx, { action: 'configure', sites: next }))
      }

      const enabled = Boolean(status?.enabled)
      const reachable = Boolean(status?.reachable)
      const tone = !enabled ? 'idle' : reachable ? 'on' : 'wait'
      const heroTitle = !enabled ? t('off') : reachable ? t('on') : t('wait')
      const heroSub = !enabled
        ? t('offSub')
        : reachable
          ? `${status?.browser || 'Chromium'} · ${status?.tabs || 0} ${t('tabsUnit')} · ${t('onSub')}`
          : t('waitSub')

      function toggle() {
        if (busy) return
        void run('toggle', () => callHost(ctx, { action: 'enable', enabled: !enabled }))
      }

      function addSite() {
        const host = siteHost.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
        if (!host) return
        const next = [...sites.filter((row) => row.host !== host), { host, mode: 'ask' }]
        setSiteHost('')
        void saveSites(next)
      }

      return h('div', { className: 'bw-page' },
        h('style', null, CSS),
        h('header', { className: 'bw-head' },
          h('h1', null, t('title')),
          h('p', null, t('intro')),
          h('p', null, t('privacy')),
          h('p', null, t('usage'))),
        loadError ? h('p', { className: 'bw-error', role: 'alert' }, loadError) : null,
        !status && !loadError ? h('p', { className: 'bw-muted' }, t('loading')) : null,

        status ? h('section', { className: 'bw-card', 'aria-labelledby': 'bw-title' },
          h('div', { className: 'bw-card-head' },
            h('div', null,
              h('h2', { id: 'bw-title' }, t('name')),
              h('p', { className: 'bw-muted' }, t('sub')))),
          h('div', { className: 'bw-hero', role: 'status', 'aria-live': 'polite' },
            h('span', { className: 'bw-dot', 'data-tone': tone }),
            h('div', { className: 'bw-hero-body' },
              h('span', { className: 'bw-hero-title' }, `${t('statusLabel')} · ${heroTitle}`),
              h('span', { className: 'bw-hero-sub' }, heroSub),
              h('div', { className: 'bw-hero-meta' },
                enabled && reachable ? h('span', { className: 'bw-chip' }, `${t('browserLabel')}: ${status?.browser || 'Chromium'}`) : null,
                enabled ? h('span', { className: 'bw-chip' }, `${t('tabsCount')}: ${status?.tabs || 0}`) : null,
                enabled ? h('span', { className: `bw-chip${reachable ? ' bw-chip-ok' : ' bw-chip-warn'}` }, reachable ? t('connectedTo') : t('notConnected')) : h('span', { className: 'bw-chip' }, t('disabledState')),
                h('span', { className: 'bw-chip' }, `${t('lastCheck')}: ${lastCheck || t('neverChecked')}`)))),
          h('div', { className: 'bw-row' },
            h('span', { className: 'bw-label' }, t('endpoint')),
            h('input', { className: 'bw-input', value: endpoint, placeholder: 'http://127.0.0.1:9222', onChange: (event) => setEndpoint(event.target.value), 'aria-label': t('endpoint') }),
            h('button', { type: 'button', className: 'bw-secondary', disabled: Boolean(busy), onClick: () => run('endpoint', () => callHost(ctx, { action: 'configure', endpoint }), t('connected')) }, t('saveEndpoint'))),
          h('div', { className: 'bw-actions' },
            h('button', { type: 'button', className: 'bw-primary', disabled: Boolean(busy), onClick: () => run('launch', () => callHost(ctx, { action: 'launch' }), t('launched')) }, busy === 'launch' ? t('working') : t('launch')),
            h('button', { type: 'button', className: 'bw-secondary', disabled: Boolean(busy) || !enabled, onClick: () => run('test', () => callHost(ctx, { action: 'test' }), t('connected')) }, busy === 'test' ? t('working') : t('retest')),
            h('button', { type: 'button', className: 'bw-link', disabled: Boolean(busy), onClick: () => run('clear', () => callHost(ctx, { action: 'clearHistory' }), t('revoked')) }, t('clear'))),
          h('p', { className: 'bw-help' }, t('skillsHint')),
          status.executableFound === false ? h('p', { className: 'bw-note' }, t('noExecutable')) : null,
          note ? h('p', { className: noteOk ? 'bw-ok' : 'bw-note', role: 'status', 'aria-live': 'polite' }, note) : null) : null,

        status ? h('section', { className: 'bw-card' },
          h('h2', { className: 'bw-section-title' }, t('permissions')),
          h('div', { className: 'bw-split' },
            h('div', null,
              h('strong', null, t('historyLabel')),
              h('p', { className: 'bw-help' }, t('historyHint'))),
            h('span', { className: 'bw-chip' }, t('alwaysAsk'))),
          h('div', { className: 'bw-split' },
            h('div', null,
              h('strong', null, t('defaultMode')),
              h('p', { className: 'bw-help' }, t('defaultModeHint'))),
            h('select', {
              className: 'bw-select', value: status.defaultMode || 'ask',
              'aria-label': t('defaultMode'),
              onChange: (event) => run('default', () => callHost(ctx, { action: 'configure', defaultMode: event.target.value })),
            },
              h('option', { value: 'ask' }, t('modeAsk')),
              h('option', { value: 'auto' }, t('modeAuto')),
              h('option', { value: 'block' }, t('modeBlock'))))) : null,

        status ? h('section', { className: 'bw-card' },
          h('div', { className: 'bw-card-head' },
            h('div', null,
              h('h2', { className: 'bw-section-title' }, t('sitePerms')),
              h('p', { className: 'bw-muted', style: { marginTop: 4 } }, t('sitePermsHint'))),
            h('div', { className: 'bw-row', style: { flex: 'none' } },
              h('input', { className: 'bw-input', style: { minWidth: 140, flex: 'none' }, value: siteHost, placeholder: t('hostPlaceholder'), onChange: (event) => setSiteHost(event.target.value), onKeyDown: (event) => { if (event.key === 'Enter') addSite() }, 'aria-label': t('sitePerms') }),
              h('button', { type: 'button', className: 'bw-secondary', disabled: Boolean(busy) || !siteHost.trim(), onClick: addSite }, `+ ${t('addSite')}`))),
          h('div', { className: 'bw-table' },
            h('div', { className: 'bw-thead' },
              h('span', null, t('sitePerms')),
              h('span', null, t('browse')),
              h('span', null, '')),
            h('div', { className: 'bw-trow' },
              h('span', { className: 'bw-host' }, t('defaultRow')),
              h('span', { className: 'bw-help' }, t('defaultModeHint')),
              h('span', null, '')),
            sites.map((site) => h('div', { className: 'bw-trow', key: site.host },
              h('span', { className: 'bw-host bw-mono' }, site.host),
              h('select', {
                className: 'bw-select', value: site.mode, 'aria-label': `${site.host} ${t('browse')}`,
                onChange: (event) => void saveSites(sites.map((row) => row.host === site.host ? { ...row, mode: event.target.value } : row)),
              },
                h('option', { value: 'ask' }, t('modeAsk')),
                h('option', { value: 'auto' }, t('modeAuto')),
                h('option', { value: 'block' }, t('modeBlock'))),
              h('button', { type: 'button', className: 'bw-link', onClick: () => void saveSites(sites.filter((row) => row.host !== site.host)) }, t('remove'))))),
          sites.length === 0 ? h('p', { className: 'bw-help' }, t('emptySites')) : null) : null,

        status ? h('section', { className: 'bw-risk' },
          h('div', { className: 'bw-risk-head' }, h('span', { 'aria-hidden': 'true' }, '⚠'), t('risk')),
          h('div', { className: 'bw-risk-row' },
            h('div', null,
              h('strong', null, t('cdpLabel')),
              h('p', { className: 'bw-help' }, t('cdpHint'))),
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flex: 'none' } },
              h('span', { className: 'bw-help' }, enabled ? t('stateOn') : t('stateOff')),
              h('button', {
                type: 'button', className: 'bw-switch', role: 'switch',
                'aria-checked': enabled ? 'true' : 'false',
                'aria-label': t('cdpLabel'),
                disabled: Boolean(busy),
                onClick: toggle,
              }, h('span', { className: 'bw-thumb' }))))) : null
      )
    }

    function SummaryLine({ ctx }) {
      return h('span', null, translate(ctx, 'sub'))
    }

    return {
      inject: ['slots', 'connection', 'locale'],
      apply(ctx) {
        ctx.effect(() => {
          const row = ctx.slots.inject('plugins.row.config', () => ctx.slots.register({
            name: 'plugins.row.config',
            key: '@local/dsh-browser-computer-use#dsh-browser-computer-use',
          }, (props) => props?.view === 'summary' ? h(SummaryLine, { ctx }) : h(ConfigPage, { ctx })))
          const bundle = ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
            name: 'plugins.bundle.config',
            key: '@local/dsh-browser-computer-use',
          }, () => h(ConfigPage, { ctx })))
          return () => { try { row?.() } catch {} try { bundle?.() } catch {} }
        })
      },
    }
  },
})
