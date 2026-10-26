window.__ModuleLoader__.load({
  id: '@local/dsh-browser-computer-use',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const zh = {
      title: '浏览器',
      subtitle: '通过 Chrome DevTools Protocol 控制一个真实的 Chromium 浏览器。必须先在这里手动开启；所有写操作默认逐次审批。',
      settingsTitle: '浏览器设置',
      settingsDesc: '控制 CDP 开关、调试端口和每个网站的操作权限。设置只影响这台机器上的浏览器控制插件。',
      enabled: '启用 CDP 浏览器控制',
      enabledHint: '关闭后立即断开调试通道，代理无法再操作浏览器。',
      endpoint: '调试地址',
      endpointHint: '默认 http://127.0.0.1:9222。使用「启动浏览器」会以独立配置目录启动并监听该端口。',
      saveEndpoint: '保存地址',
      launch: '启动浏览器',
      test: '重新检测',
      sites: '网站权限',
      sitesHint: 'auto：该网站的点击/输入等操作不再逐次审批；ask：每次操作都询问；block：完全禁止访问。',
      hostPlaceholder: 'example.com',
      addSite: '添加网站',
      modeAuto: '自动允许', modeAsk: '每次询问', modeBlock: '禁止',
      remove: '移除',
      connected: '已连接', disconnected: '未连接', disabled: '未启用',
      browser: '浏览器', tabs: '标签页', noTabs: '没有可控制的标签页。',
      tabsTitle: '标签页', activate: '切换', close: '关闭',
      navigatePlaceholder: 'https://example.com', go: '打开',
      read: '读取页面', screenshot: '截图',
      pageTitle: '页面内容', noPage: '还没有读取页面。',
      preview: '截图预览',
      history: '操作记录', noHistory: '暂无操作记录。', clearHistory: '清空记录',
      loading: '加载中…', saved: '已保存。', launched: '浏览器已启动。',
      error: '操作失败：', unavailable: '无法连接宿主，请刷新页面。',
      executableMissing: '没有找到 Chromium 内核浏览器，请安装 Chrome/Edge 或设置 DSH_BROWSER_EXECUTABLE。',
      approvalNote: '注意：代理在对话中执行写操作时会请求你一次性批准；截图不会自动脱敏，可能包含页面上的敏感信息。',
      stateOn: '已开启', stateOff: '已关闭',
    };
    const en = {
      title: 'Browser',
      subtitle: 'Control a real Chromium browser over the Chrome DevTools Protocol. You must turn it on here first; every write action asks for approval by default.',
      settingsTitle: 'Browser settings',
      settingsDesc: 'Control the CDP switch, debug endpoint, and per-site permissions for this plugin.',
      enabled: 'Enable CDP browser control',
      enabledHint: 'Turning it off disconnects the debug channel immediately, so the agent can no longer act.',
      endpoint: 'Debug endpoint',
      endpointHint: 'Defaults to http://127.0.0.1:9222. Launch starts an isolated browser profile listening on this port.',
      saveEndpoint: 'Save endpoint',
      launch: 'Launch browser',
      test: 'Re-check',
      sites: 'Site permissions',
      sitesHint: 'auto: clicks/typing on this site skip per-action approval; ask: ask every time; block: never allow.',
      hostPlaceholder: 'example.com',
      addSite: 'Add site',
      modeAuto: 'Auto allow', modeAsk: 'Ask each time', modeBlock: 'Block',
      remove: 'Remove',
      connected: 'Connected', disconnected: 'Not connected', disabled: 'Disabled',
      browser: 'Browser', tabs: 'Tabs', noTabs: 'No controllable tabs.',
      tabsTitle: 'Tabs', activate: 'Switch', close: 'Close',
      navigatePlaceholder: 'https://example.com', go: 'Open',
      read: 'Read page', screenshot: 'Screenshot',
      pageTitle: 'Page content', noPage: 'Nothing read yet.',
      preview: 'Screenshot preview',
      history: 'Action log', noHistory: 'No actions yet.', clearHistory: 'Clear log',
      loading: 'Loading…', saved: 'Saved.', launched: 'Browser launched.',
      error: 'Something went wrong: ', unavailable: 'Cannot reach the host. Refresh the page.',
      executableMissing: 'No Chromium browser found. Install Chrome/Edge or set DSH_BROWSER_EXECUTABLE.',
      approvalNote: 'Note: agent write actions in chat ask for one-time approval. Screenshots are not redacted and may contain sensitive page content.',
      stateOn: 'On', stateOff: 'Off',
    };

    function dictOf(ctx) {
      let active = 'en';
      try { active = String(ctx.locale?.getSnapshot?.()?.active || 'en'); } catch {}
      return active.toLowerCase().startsWith('zh') ? { ...en, ...zh } : en;
    }
    const t = (ctx, key) => dictOf(ctx)[key] ?? key;

    const S = {
      page: { color: 'var(--dsw-alias-label-primary)', background: 'var(--dsw-alias-bg-base)', minHeight: '100%', padding: '24px 28px 40px', boxSizing: 'border-box' },
      wrap: { maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 },
      head: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 },
      title: { margin: 0, fontSize: 22, fontWeight: 600, lineHeight: 1.3 },
      sub: { margin: '6px 0 0', fontSize: 13, lineHeight: 1.6, color: 'var(--dsw-alias-label-secondary)', maxWidth: 660 },
      card: { border: '1px solid var(--dsw-alias-border-l1)', background: 'var(--dsw-alias-bg-layer-1)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
      row: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
      label: { fontSize: 12.5, color: 'var(--dsw-alias-label-secondary)' },
      input: { flex: 1, minWidth: 180, boxSizing: 'border-box', borderRadius: 8, padding: '9px 11px', color: 'var(--dsw-alias-label-primary)', background: 'var(--dsw-alias-bg-layer-2)', border: '1px solid var(--dsw-alias-border-l1)', fontSize: 13.5 },
      select: { borderRadius: 8, padding: '8px 10px', color: 'var(--dsw-alias-label-primary)', background: 'var(--dsw-alias-bg-layer-2)', border: '1px solid var(--dsw-alias-border-l1)', fontSize: 13 },
      primary: { border: 0, borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--dsw-alias-bg-base)', background: 'var(--dsw-alias-brand-primary)' },
      ghost: { border: '1px solid var(--dsw-alias-border-l2)', background: 'transparent', color: 'var(--dsw-alias-label-primary)', borderRadius: 8, padding: '7px 12px', fontSize: 13, cursor: 'pointer' },
      danger: { border: '1px solid var(--dsw-alias-border-l2)', background: 'transparent', color: 'var(--dsw-alias-state-error-primary)', borderRadius: 8, padding: '7px 12px', fontSize: 13, cursor: 'pointer' },
      disabled: { opacity: .55, cursor: 'default' },
      pill: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, border: '1px solid var(--dsw-alias-border-l1)', background: 'var(--dsw-alias-bg-layer-2)', fontSize: 11.5, color: 'var(--dsw-alias-label-secondary)', whiteSpace: 'nowrap' },
      ok: { color: 'var(--dsw-alias-state-success-primary)', borderColor: 'var(--dsw-alias-state-success-primary)' },
      bad: { color: 'var(--dsw-alias-state-warn-primary)', borderColor: 'var(--dsw-alias-state-warn-primary)' },
      error: { padding: '10px 12px', borderRadius: 9, border: '1px solid var(--dsw-alias-state-error-primary)', background: 'var(--dsw-alias-bg-layer-2)', color: 'var(--dsw-alias-state-error-primary)', fontSize: 13 },
      empty: { padding: '22px 12px', textAlign: 'center', fontSize: 13, color: 'var(--dsw-alias-label-secondary)', border: '1px dashed var(--dsw-alias-border-l1)', borderRadius: 10 },
      mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12 },
      text: { fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: 320, overflow: 'auto', background: 'var(--dsw-alias-bg-layer-2)', borderRadius: 8, padding: 12 },
      img: { maxWidth: '100%', borderRadius: 10, border: '1px solid var(--dsw-alias-border-l1)' },
    };

    async function callRpc(ctx, payload) {
      const rpc = ctx.connection?.rpc;
      if (!rpc?.call) throw new Error(t(ctx, 'unavailable'));
      const reply = await rpc.call('/api', 'dsh-browser-computer-use', payload);
      if (reply?.ok === false) {
        const error = new Error(reply.error?.message || 'RPC failed');
        error.code = reply.error?.code;
        throw error;
      }
      return reply && typeof reply === 'object' && 'value' in reply ? reply.value : reply;
    }

    function StatusPill({ ctx, status }) {
      if (!status) return h('span', { style: S.pill }, t(ctx, 'loading'));
      const tone = !status.enabled ? {} : status.reachable ? S.ok : S.bad;
      const text = !status.enabled ? t(ctx, 'disabled') : status.reachable ? t(ctx, 'connected') : t(ctx, 'disconnected');
      return h('span', { style: { ...S.pill, ...tone } }, text);
    }

    function SettingsPage({ ctx }) {
      const [status, setStatus] = React.useState(null);
      const [endpoint, setEndpoint] = React.useState('');
      const [siteHost, setSiteHost] = React.useState('');
      const [siteMode, setSiteMode] = React.useState('ask');
      const [busy, setBusy] = React.useState('');
      const [error, setError] = React.useState('');
      const [notice, setNotice] = React.useState('');
      const t0 = (key) => t(ctx, key);

      const load = React.useCallback(async () => {
        try {
          const value = await callRpc(ctx, { action: 'status' });
          setStatus(value);
          setEndpoint((current) => current || value?.endpoint || '');
        } catch (cause) { setError(cause?.message || t0('unavailable')); }
      }, []);

      React.useEffect(() => { load(); }, []);

      async function run(name, task, message) {
        setBusy(name); setError(''); setNotice('');
        try {
          const value = await task();
          if (message) setNotice(message);
          await load();
          return value;
        } catch (cause) { setError(cause?.message || t0('error')); return null; }
        finally { setBusy(''); }
      }

      const disabled = busy !== '';

      const header = h('header', null,
        h('h2', { style: { margin: 0, fontSize: 18, fontWeight: 600 } }, t0('settingsTitle')),
        h('p', { style: { margin: '6px 0 0', fontSize: 13, lineHeight: 1.6, color: 'var(--dsw-alias-label-secondary)' } }, t0('settingsDesc')));

      const toggle = h('div', { style: { ...S.row, justifyContent: 'space-between' } },
        h('div', null,
          h('div', { style: { fontSize: 13.5, fontWeight: 500 } }, t0('enabled')),
          h('div', { style: { ...S.label, marginTop: 4 } }, t0('enabledHint'))),
        h('label', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          h('input', {
            type: 'checkbox', role: 'switch', checked: Boolean(status?.enabled), disabled,
            onChange: (e) => run('toggle', () => callRpc(ctx, { action: 'enable', enabled: e.target.checked })),
          }),
          h('span', { style: S.label }, status?.enabled ? t0('stateOn') : t0('stateOff'))));

      const endpointRow = h('div', { style: S.row },
        h('span', { style: S.label }, t0('endpoint')),
        h('input', { value: endpoint, onChange: (e) => setEndpoint(e.target.value), placeholder: 'http://127.0.0.1:9222', style: S.input, 'aria-label': t0('endpoint') }),
        h('button', { type: 'button', disabled, style: { ...S.ghost, ...(disabled ? S.disabled : {}) }, onClick: () => run('endpoint', () => callRpc(ctx, { action: 'configure', endpoint }), t0('saved')) }, t0('saveEndpoint')));

      const connectionRow = h('div', { style: S.row },
        h('button', { type: 'button', disabled, style: { ...S.primary, ...(disabled ? S.disabled : {}) }, onClick: () => run('launch', () => callRpc(ctx, { action: 'launch' }), t0('launched')) }, busy === 'launch' ? t0('loading') : t0('launch')),
        h('button', { type: 'button', disabled, style: { ...S.ghost, ...(disabled ? S.disabled : {}) }, onClick: () => run('test', () => callRpc(ctx, { action: 'test' })) }, t0('test')),
        h(StatusPill, { ctx, status }),
        status?.browser ? h('span', { style: S.label }, `${t0('browser')}: ${status.browser} · ${t0('tabs')}: ${status.tabs}`) : null);

      const siteRow = (site) => h('div', { key: site.host, style: { ...S.row, justifyContent: 'space-between', border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 8, padding: '8px 10px' } },
        h('span', { style: S.mono }, site.host),
        h('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } },
          h('select', {
            value: site.mode, style: S.select, 'aria-label': `${site.host} ${t0('sites')}`,
            onChange: (e) => run('site', () => callRpc(ctx, { action: 'setSite', host: site.host, mode: e.target.value })),
          },
            h('option', { value: 'auto' }, t0('modeAuto')),
            h('option', { value: 'ask' }, t0('modeAsk')),
            h('option', { value: 'block' }, t0('modeBlock'))),
          h('button', { type: 'button', style: S.danger, onClick: () => run('site', () => callRpc(ctx, { action: 'removeSite', host: site.host })) }, t0('remove'))));

      const addSiteRow = h('div', { style: S.row },
        h('input', { value: siteHost, onChange: (e) => setSiteHost(e.target.value), placeholder: t0('hostPlaceholder'), style: S.input, 'aria-label': t0('sites') }),
        h('select', { value: siteMode, onChange: (e) => setSiteMode(e.target.value), style: S.select, 'aria-label': t0('sites') },
          h('option', { value: 'auto' }, t0('modeAuto')),
          h('option', { value: 'ask' }, t0('modeAsk')),
          h('option', { value: 'block' }, t0('modeBlock'))),
        h('button', {
          type: 'button', disabled: disabled || !siteHost.trim(), style: { ...S.ghost, ...(disabled || !siteHost.trim() ? S.disabled : {}) },
          onClick: () => run('site', async () => { await callRpc(ctx, { action: 'setSite', host: siteHost, mode: siteMode }); setSiteHost(''); }, t0('saved')),
        }, t0('addSite')));

      const sites = status?.sites || [];
      const sitesSection = h('section', { style: S.card },
        h('div', { style: { fontSize: 13.5, fontWeight: 500 } }, t0('sites')),
        h('div', { style: S.label }, t0('sitesHint')),
        addSiteRow,
        sites.length === 0
          ? h('div', { style: S.empty }, t0('sitesHint'))
          : h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } }, sites.map(siteRow)));

      const connectionSection = h('section', { style: S.card },
        toggle,
        endpointRow,
        h('div', { style: S.label }, t0('endpointHint')),
        connectionRow,
        status?.executableFound === false
          ? h('div', { style: { ...S.error, borderColor: 'var(--dsw-alias-state-warn-primary)', color: 'var(--dsw-alias-state-warn-primary)' } }, t0('executableMissing'))
          : null);

      return h(React.Fragment, null,
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 760 } },
        header,
        error ? h('div', { role: 'alert', style: S.error }, error) : null,
        notice ? h('div', { role: 'status', style: { fontSize: 13, color: 'var(--dsw-alias-state-success-primary)' } }, notice) : null,
        connectionSection,
        sitesSection,
        h('p', { style: { margin: 0, fontSize: 12.5, lineHeight: 1.6, color: 'var(--dsw-alias-label-secondary)' } }, t0('approvalNote'))),
        h(Panel, { ctx }));
    }

    function Panel({ ctx }) {
      const [status, setStatus] = React.useState(null);
      const [tabs, setTabs] = React.useState([]);
      const [page, setPage] = React.useState(null);
      const [shot, setShot] = React.useState('');
      const [url, setUrl] = React.useState('');
      const [history, setHistory] = React.useState([]);
      const [busy, setBusy] = React.useState('');
      const [error, setError] = React.useState('');
      const t0 = (key) => t(ctx, key);

      const refresh = React.useCallback(async () => {
        try {
          const value = await callRpc(ctx, { action: 'status' });
          setStatus(value);
          if (value?.enabled) {
            const list = await callRpc(ctx, { action: 'tabs' }).catch(() => []);
            setTabs(Array.isArray(list) ? list : []);
          } else {
            setTabs([]);
          }
          const log = await callRpc(ctx, { action: 'history', limit: 20 }).catch(() => []);
          setHistory(Array.isArray(log) ? log : []);
        } catch (cause) { setError(cause?.message || t0('unavailable')); }
      }, []);

      React.useEffect(() => { refresh(); }, []);

      async function run(name, task) {
        setBusy(name); setError('');
        try { return await task(); }
        catch (cause) { setError(cause?.message || t0('error')); return null; }
        finally { setBusy(''); refresh(); }
      }

      const disabled = busy !== '' || !status?.enabled;

      const header = h('header', { style: S.head },
        h('div', null,
          h('h1', { style: S.title }, t0('title')),
          h('p', { style: S.sub }, t0('subtitle'))),
        h(StatusPill, { ctx, status }));

      const navRow = h('div', { style: S.row },
        h('input', {
          value: url, onChange: (e) => setUrl(e.target.value), placeholder: t0('navigatePlaceholder'), style: S.input,
          onKeyDown: (e) => { if (e.key === 'Enter' && url.trim()) run('navigate', async () => { const info = await callRpc(ctx, { action: 'navigate', url }); setPage(info); }); },
        }),
        h('button', { type: 'button', disabled: disabled || !url.trim(), style: { ...S.primary, ...(disabled || !url.trim() ? S.disabled : {}) }, onClick: () => run('navigate', async () => { const info = await callRpc(ctx, { action: 'navigate', url }); setPage(info); }) }, t0('go')),
        h('button', { type: 'button', disabled, style: { ...S.ghost, ...(disabled ? S.disabled : {}) }, onClick: () => run('read', async () => setPage(await callRpc(ctx, { action: 'read' }))) }, t0('read')),
        h('button', { type: 'button', disabled, style: { ...S.ghost, ...(disabled ? S.disabled : {}) }, onClick: () => run('shot', async () => { const value = await callRpc(ctx, { action: 'screenshot' }); setShot(value?.dataUrl || ''); }) }, t0('screenshot')));

      const tabRow = (tab) => h('div', { key: tab.id, style: { display: 'flex', gap: 8, alignItems: 'center', border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 8, padding: '7px 10px' } },
        h('div', { style: { flex: 1, minWidth: 0 } },
          h('div', { style: { fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, tab.title || tab.url),
          h('div', { style: { ...S.label, ...S.mono, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, tab.url)),
        h('button', { type: 'button', style: S.ghost, onClick: () => run('activate', () => callRpc(ctx, { action: 'activate', targetId: tab.id })) }, t0('activate')),
        h('button', { type: 'button', style: S.danger, onClick: () => run('close', () => callRpc(ctx, { action: 'closeTab', targetId: tab.id })) }, t0('close')));

      const tabsSection = h('div', null,
        h('div', { style: { ...S.label, marginBottom: 6 } }, t0('tabsTitle')),
        tabs.length === 0
          ? h('div', { style: S.empty }, t0('noTabs'))
          : h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } }, tabs.map(tabRow)));

      const pageSection = page
        ? h('div', null,
          h('div', { style: { ...S.label, margin: '4px 0 6px' } }, `${t0('pageTitle')} · ${page.title || ''} · ${page.url || ''}`),
          h('div', { style: S.text }, page.text || ''))
        : h('div', { style: S.empty }, t0('noPage'));

      const shotSection = shot
        ? h('div', null,
          h('div', { style: { ...S.label, margin: '4px 0 6px' } }, t0('preview')),
          h('img', { src: shot, alt: t0('preview'), style: S.img }))
        : null;

      const historySection = h('section', { style: S.card },
        h('div', { style: { ...S.row, justifyContent: 'space-between' } },
          h('div', { style: { fontSize: 13.5, fontWeight: 500 } }, t0('history')),
          h('button', { type: 'button', style: S.ghost, onClick: () => run('clear', () => callRpc(ctx, { action: 'clearHistory' })) }, t0('clearHistory'))),
        history.length === 0
          ? h('div', { style: S.empty }, t0('noHistory'))
          : h('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
            history.map((entry) => h('div', { key: entry.id, style: { ...S.label, ...S.mono } }, `${entry.at} · ${entry.action} · ${entry.ok ? 'ok' : 'fail'} · ${entry.detail || ''}`))));

      return h('div', { style: { ...S.page, padding: '0 0 8px' } },
        h('div', { style: S.wrap },
          header,
          error ? h('div', { role: 'alert', style: S.error }, `${t0('error')}${error}`) : null,
          !status?.enabled
            ? h('div', { style: S.card },
              h('div', { style: { fontSize: 13.5 } }, t0('disabled')),
              h('div', { style: S.label }, t0('enabledHint')))
            : null,
          h('section', { style: S.card }, navRow, tabsSection, pageSection, shotSection),
          historySection));
    }

    return {
      inject: ['slots', 'connection', 'locale'],
      apply(ctx) {
        ctx.effect(() => {
          const section = ctx.slots.inject('settings.section', () => ctx.slots.register(
            { name: 'settings.section', id: 'browser-use', order: 35, label: () => dictOf(ctx).title },
            () => h(SettingsPage, { ctx })));
          return () => { try { section?.(); } catch {} };
        });
      },
    };
  },
});
