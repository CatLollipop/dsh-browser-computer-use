window.__ModuleLoader__.load({
  id: '@local/dsh_browser_computer_use',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useEffect, useMemo, useState } = React
    const copy = {
      title: 'Browser task center', newTask: 'New task', empty: 'No tasks yet', unavailable: 'Provider unavailable', readonly: 'Read-only fallback', approval: 'Approval', pause: 'Pause', resume: 'Resume', cancel: 'Cancel', save: 'Save', remove: 'Delete', risk: 'Risk level', timeline: 'Action timeline', description: 'Description', url: 'URL', search: 'Search', fetch: 'Fetch', permission: 'Permission required', error: 'Something went wrong'
    }
    const statusText = { draft: 'Draft', awaiting_approval: 'Awaiting approval', running: 'Running', paused: 'Paused', completed: 'Completed', cancelled: 'Cancelled', error: 'Error' }
    const css = `
      .dsh-btc{font:inherit;color:var(--dsw-alias-text-primary,#e5e7eb);background:var(--dsw-alias-bg-secondary,#111827);border:1px solid var(--dsw-alias-border,#374151);border-radius:12px;padding:16px;max-width:760px;min-width:320px;box-sizing:border-box}
      .dsh-btc *{box-sizing:border-box}.dsh-btc-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.dsh-btc-title{font-size:16px;font-weight:650}.dsh-btc-sub{font-size:11px;color:var(--dsw-alias-text-secondary,#9ca3af);margin-top:3px}.dsh-btc-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.dsh-btc-field{display:flex;flex-direction:column;gap:5px}.dsh-btc-field.full{grid-column:1/-1}.dsh-btc label{font-size:11px;color:var(--dsw-alias-text-secondary,#9ca3af)}.dsh-btc input,.dsh-btc textarea,.dsh-btc select{font:inherit;color:inherit;background:var(--dsw-alias-bg-primary,#0b1220);border:1px solid var(--dsw-alias-border,#374151);border-radius:7px;padding:8px}.dsh-btc textarea{min-height:58px;resize:vertical}.dsh-btc button{font:inherit;color:inherit;background:var(--dsw-alias-bg-tertiary,#1f2937);border:1px solid var(--dsw-alias-border,#4b5563);border-radius:7px;padding:7px 10px;cursor:pointer}.dsh-btc button:hover{border-color:var(--dsw-alias-accent,#61dafb)}.dsh-btc button.primary{background:var(--dsw-alias-accent,#2563eb);border-color:transparent;color:white}.dsh-btc button.danger{color:#fca5a5}.dsh-btc-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}.dsh-btc-banner{padding:8px 10px;border-radius:7px;background:color-mix(in srgb,#f59e0b 15%,transparent);font-size:12px;margin-bottom:10px}.dsh-btc-error{padding:8px 10px;border-radius:7px;background:color-mix(in srgb,#ef4444 18%,transparent);font-size:12px;margin-bottom:10px}.dsh-btc-empty{padding:20px 10px;text-align:center;color:var(--dsw-alias-text-secondary,#9ca3af);font-size:13px}.dsh-btc-list{display:flex;flex-direction:column;gap:8px;margin-top:12px}.dsh-btc-card{border:1px solid var(--dsw-alias-border,#374151);border-radius:9px;padding:10px}.dsh-btc-card.active{border-color:var(--dsw-alias-accent,#61dafb)}.dsh-btc-row{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.dsh-btc-meta{font-size:11px;color:var(--dsw-alias-text-secondary,#9ca3af);display:flex;gap:8px;flex-wrap:wrap}.dsh-btc-pill{padding:2px 6px;border-radius:999px;background:var(--dsw-alias-bg-tertiary,#1f2937);font-size:10px}.dsh-btc-time{border-left:2px solid var(--dsw-alias-border,#374151);padding:5px 0 5px 9px;margin-top:7px;font-size:11px;color:var(--dsw-alias-text-secondary,#9ca3af)}
      @media(max-width:560px){.dsh-btc-grid{grid-template-columns:1fr}.dsh-btc-field.full{grid-column:auto}}
    `
    function resolveLocale(ctx) { return key => { try { return ctx.locale?.t?.(key) || copy[key] || key } catch { return copy[key] || key } } }
    function TaskCenter({ ctx }) {
      const t = resolveLocale(ctx)
      const [tasks, setTasks] = useState([]), [selected, setSelected] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false)
      const [draft, setDraft] = useState({ title: '', description: '', risk: 'L2' })
      const call = async payload => {
        try {
          const rpc = ctx.connection?.rpc
          const reply = rpc?.call ? await rpc.call('/api', 'dsh_browser_computer_use', payload) : null
          if (!reply) throw new Error('Host connection unavailable')
          if (reply.ok === false) throw new Error(reply.error?.message || 'RPC failed')
          return Object.hasOwn(reply, 'value') ? reply.value : reply
        } catch (e) { throw new Error(String(e?.message || e)) }
      }
      const load = async () => { setBusy(true); setError(''); try { const result = await call({ action: 'list' }); setTasks(result.tasks || []) } catch (e) { setError(e.message); setTasks([]) } finally { setBusy(false) } }
      useEffect(() => { load() }, [])
      const create = async () => { if (!draft.title.trim()) return; setBusy(true); try { const result = await call({ action: 'create', ...draft }); if (result.task) { setTasks(previous => [result.task, ...previous]); setSelected(result.task.id); setDraft({ title: '', description: '', risk: 'L2' }) } } catch (e) { setError(e.message) } finally { setBusy(false) } }
      const act = async (action, id) => { setBusy(true); setError(''); try { const result = await call({ action, id }); if (result.task) setTasks(previous => previous.map(task => task.id === id ? result.task : task)) } catch (e) { setError(e.message) } finally { setBusy(false) } }
      const current = useMemo(() => tasks.find(task => task.id === selected), [tasks, selected])
      return h('section', { className: 'dsh-btc', 'aria-label': t('title') },
        h('style', null, css),
        h('header', { className: 'dsh-btc-head' }, h('div', null, h('div', { className: 'dsh-btc-title' }, t('title')), h('div', { className: 'dsh-btc-sub' }, 'No real browser control · local task orchestration')), h('span', { className: 'dsh-btc-pill' }, t('unavailable'))),
        h('div', { className: 'dsh-btc-banner', role: 'status' }, `${t('unavailable')} · ${t('readonly')}: web.fetch / web.search`),
        error && h('div', { className: 'dsh-btc-error', role: 'alert' }, `${t('error')}: ${error}`),
        h('div', { className: 'dsh-btc-grid' },
          h('div', { className: 'dsh-btc-field' }, h('label', null, 'Title'), h('input', { value: draft.title, onChange: e => setDraft({ ...draft, title: e.target.value }), placeholder: t('newTask') })),
          h('div', { className: 'dsh-btc-field' }, h('label', null, t('risk')), h('select', { value: draft.risk, onChange: e => setDraft({ ...draft, risk: e.target.value }) }, ['L0','L1','L2','L3','L4'].map(level => h('option', { key: level, value: level }, level)))),
          h('div', { className: 'dsh-btc-field full' }, h('label', null, t('description')), h('textarea', { value: draft.description, onChange: e => setDraft({ ...draft, description: e.target.value }) })),
          h('div', { className: 'dsh-btc-field full' }, h('button', { className: 'primary', disabled: busy || !draft.title.trim(), onClick: create }, t('newTask')))
        ),
        tasks.length === 0 ? h('div', { className: 'dsh-btc-empty' }, busy ? 'Loading…' : t('empty')) : h('div', { className: 'dsh-btc-list' }, tasks.map(task => h('article', { key: task.id, className: `dsh-btc-card${current?.id === task.id ? ' active' : ''}`, onClick: () => setSelected(task.id) },
          h('div', { className: 'dsh-btc-row' }, h('strong', null, task.title), h('span', { className: 'dsh-btc-pill' }, statusText[task.state] || task.state)),
          h('div', { className: 'dsh-btc-meta' }, h('span', null, task.risk), h('span', null, task.provider), h('span', null, task.description || 'No description')),
          current?.id === task.id && h('div', { className: 'dsh-btc-actions' },
            (task.state === 'draft' || task.state === 'awaiting_approval') && h('button', { onClick: e => { e.stopPropagation(); act('approve', task.id) } }, t('approval')),
            task.state === 'running' && h('button', { onClick: e => { e.stopPropagation(); act('pause', task.id) } }, t('pause')),
            task.state === 'paused' && h('button', { onClick: e => { e.stopPropagation(); act('resume', task.id) } }, t('resume')),
            !['cancelled', 'completed'].includes(task.state) && h('button', { className: 'danger', onClick: e => { e.stopPropagation(); act('cancel', task.id) } }, t('cancel')),
            h('button', { className: 'danger', onClick: e => { e.stopPropagation(); act('delete', task.id).then(load) } }, t('remove'))
          ),
          current?.id === task.id && h('div', null, h('div', { className: 'dsh-btc-meta', style: { marginTop: 8 } }, t('timeline')), task.timeline.map((entry, index) => h('div', { className: 'dsh-btc-time', key: `${entry.at}-${index}` }, `${entry.at} · ${entry.action} · ${entry.detail}`)))
        )))
      )
    }
    return { inject: ['slots', 'connection', 'locale'], apply(ctx) {
      try {
        ctx.effect(() => ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: 'dsh_browser_computer_use', order: 25, label: () => 'Browser tasks' }, () => h('span', { 'aria-hidden': 'true' }, '◉'))))
        ctx.effect(() => ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'dsh_browser_computer_use' }, () => h(TaskCenter, { ctx }))))
      } catch {}
    } }
  }
})
