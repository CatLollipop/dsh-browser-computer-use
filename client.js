window.__ModuleLoader__.load({
  id: '@local/dsh-browser-computer-use',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useEffect, useMemo, useState } = React;

    const zh = {
      title: '浏览器任务中心',
      subtitle: '安全的任务编排：L0–L4 风险分级、审批、暂停与动作时间线。当前没有接入真实浏览器，只提供只读网页检索。',
      newTask: '新建任务', empty: '还没有任务。先创建一个，再按风险等级决定是否需要审批。',
      unavailable: '浏览器 Provider 未接入', readonly: '只读兜底：网页搜索与抓取',
      approval: '批准', pause: '暂停', resume: '继续', cancel: '取消', remove: '删除',
      risk: '风险等级', description: '说明', titleLabel: '任务名称', timeline: '动作时间线',
      loading: '加载中…', error: '操作失败：', noDescription: '暂无说明', noTimeline: '暂无动作',
      states: { draft: '草稿', awaiting_approval: '等待审批', running: '运行中', paused: '已暂停', completed: '已完成', cancelled: '已取消', error: '已阻断' },
    };
    const en = {
      title: 'Browser task center',
      subtitle: 'Safe task orchestration: L0–L4 risk levels, approvals, pause, and an action timeline. No real browser is attached; only read-only web lookup is available.',
      newTask: 'New task', empty: 'No tasks yet. Create one and its risk level decides whether approval is required.',
      unavailable: 'Browser provider unavailable', readonly: 'Read-only fallback: web search / fetch',
      approval: 'Approve', pause: 'Pause', resume: 'Resume', cancel: 'Cancel', remove: 'Delete',
      risk: 'Risk level', description: 'Description', titleLabel: 'Task name', timeline: 'Action timeline',
      loading: 'Loading…', error: 'Something went wrong: ', noDescription: 'No description', noTimeline: 'No actions yet',
      states: { draft: 'Draft', awaiting_approval: 'Awaiting approval', running: 'Running', paused: 'Paused', completed: 'Completed', cancelled: 'Cancelled', error: 'Blocked' },
    };

    function dictOf(ctx) {
      let active = 'en';
      try { active = String(ctx.locale?.getSnapshot?.()?.active || 'en'); } catch {}
      return active.toLowerCase().startsWith('zh') ? { ...en, ...zh } : en;
    }
    const t = (ctx, key) => dictOf(ctx)[key] ?? key;

    const css = `
.dsh-btc { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base); min-height: 100%; padding: 24px 28px 40px; box-sizing: border-box; font: inherit; }
.dsh-btc * { box-sizing: border-box; }
.dsh-btc-wrap { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 18px; }
.dsh-btc-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.dsh-btc-title { margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3; }
.dsh-btc-sub { margin: 6px 0 0; font-size: 13px; line-height: 1.6; color: var(--dsw-alias-label-secondary); max-width: 660px; }
.dsh-btc-pill { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-2); font-size: 11.5px; color: var(--dsw-alias-label-secondary); white-space: nowrap; }
.dsh-btc-pill[data-tone="warn"] { color: var(--dsw-alias-state-warn-primary); border-color: var(--dsw-alias-state-warn-primary); }
.dsh-btc-pill[data-tone="run"] { color: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); }
.dsh-btc-pill[data-tone="ok"] { color: var(--dsw-alias-state-success-primary); border-color: var(--dsw-alias-state-success-primary); }
.dsh-btc-pill[data-tone="bad"] { color: var(--dsw-alias-state-error-primary); border-color: var(--dsw-alias-state-error-primary); }
.dsh-btc-banner { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 10px 12px; border-radius: 10px; border: 1px dashed var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-2); font-size: 12.5px; color: var(--dsw-alias-label-secondary); }
.dsh-btc-card { border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-1); border-radius: 12px; padding: 16px; }
.dsh-btc-grid { display: grid; grid-template-columns: minmax(0, 2fr) minmax(120px, 1fr); gap: 10px; }
.dsh-btc-field { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.dsh-btc-field.full { grid-column: 1 / -1; }
.dsh-btc-field label { font-size: 12px; color: var(--dsw-alias-label-secondary); }
.dsh-btc input, .dsh-btc select, .dsh-btc textarea { font: inherit; font-size: 13.5px; color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-2); border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; padding: 9px 11px; outline: none; }
.dsh-btc input:focus-visible, .dsh-btc select:focus-visible, .dsh-btc textarea:focus-visible, .dsh-btc button:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }
.dsh-btc textarea { min-height: 70px; resize: vertical; }
.dsh-btc button { font: inherit; font-size: 13px; color: var(--dsw-alias-label-primary); background: transparent; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; padding: 7px 12px; cursor: pointer; }
.dsh-btc button:hover { border-color: var(--dsw-alias-brand-primary); }
.dsh-btc button.primary { color: var(--dsw-alias-bg-base); background: var(--dsw-alias-brand-primary); border-color: transparent; font-weight: 500; }
.dsh-btc button.danger { color: var(--dsw-alias-state-error-primary); }
.dsh-btc button:disabled { opacity: .55; cursor: default; border-color: var(--dsw-alias-border-l1); }
.dsh-btc-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.dsh-btc-error { padding: 10px 12px; border-radius: 9px; border: 1px solid var(--dsw-alias-state-error-primary); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-state-error-primary); font-size: 13px; }
.dsh-btc-empty { padding: 34px 12px; text-align: center; font-size: 13.5px; color: var(--dsw-alias-label-secondary); border: 1px dashed var(--dsw-alias-border-l1); border-radius: 10px; }
.dsh-btc-list { display: flex; flex-direction: column; gap: 10px; }
.dsh-btc-task { border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-1); border-radius: 10px; padding: 13px 14px; cursor: pointer; }
.dsh-btc-task:hover { border-color: var(--dsw-alias-border-l2); }
.dsh-btc-task.active { border-color: var(--dsw-alias-brand-primary); }
.dsh-btc-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.dsh-btc-name { font-size: 14px; font-weight: 600; }
.dsh-btc-meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 7px; font-size: 12px; color: var(--dsw-alias-label-secondary); }
.dsh-btc-time { margin-top: 6px; font-size: 12px; color: var(--dsw-alias-label-secondary); overflow-wrap: anywhere; }
.dsh-btc-timeline { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--dsw-alias-border-l1); }
@media (max-width: 620px) { .dsh-btc { padding: 18px 16px 28px; } .dsh-btc-grid { grid-template-columns: 1fr; } .dsh-btc-field.full { grid-column: auto; } }
`;

    const TONE = { draft: '', awaiting_approval: 'warn', running: 'run', paused: 'warn', completed: 'ok', cancelled: '', error: 'bad' };

    function TaskCenter({ ctx }) {
      const [tasks, setTasks] = useState([]);
      const [selected, setSelected] = useState(null);
      const [error, setError] = useState('');
      const [busy, setBusy] = useState(false);
      const [draft, setDraft] = useState({ title: '', description: '', risk: 'L2' });

      const call = async (payload) => {
        const rpc = ctx.connection?.rpc;
        if (!rpc?.call) throw new Error(t(ctx, 'unavailable'));
        const reply = await rpc.call('/api', 'dsh-browser-computer-use', payload);
        if (reply?.ok === false) throw new Error(reply.error?.message || 'RPC failed');
        return reply && typeof reply === 'object' && 'value' in reply ? reply.value : reply;
      };

      const load = async () => {
        setBusy(true); setError('');
        try {
          const result = await call({ action: 'list' });
          setTasks(result?.tasks || []);
        } catch (e) {
          setError(String(e?.message || e)); setTasks([]);
        } finally { setBusy(false); }
      };

      useEffect(() => { load(); }, []);

      const create = async () => {
        if (!draft.title.trim()) return;
        setBusy(true); setError('');
        try {
          const result = await call({ action: 'create', ...draft });
          if (result?.task) {
            setTasks((previous) => [result.task, ...previous]);
            setSelected(result.task.id);
            setDraft({ title: '', description: '', risk: 'L2' });
          }
        } catch (e) { setError(String(e?.message || e)); }
        finally { setBusy(false); }
      };

      const act = async (action, id) => {
        setBusy(true); setError('');
        try {
          const result = await call({ action, id });
          if (action === 'delete') { setTasks((previous) => previous.filter((task) => task.id !== id)); setSelected(null); return; }
          if (result?.task) setTasks((previous) => previous.map((task) => task.id === id ? result.task : task));
        } catch (e) { setError(String(e?.message || e)); }
        finally { setBusy(false); }
      };

      const current = useMemo(() => tasks.find((task) => task.id === selected), [tasks, selected]);
      const states = dictOf(ctx).states;

      const editor = h('section', { className: 'dsh-btc-card' },
        h('div', { className: 'dsh-btc-grid' },
          h('div', { className: 'dsh-btc-field' },
            h('label', null, t(ctx, 'titleLabel')),
            h('input', { value: draft.title, placeholder: t(ctx, 'newTask'), onChange: (e) => setDraft({ ...draft, title: e.target.value }) })),
          h('div', { className: 'dsh-btc-field' },
            h('label', null, t(ctx, 'risk')),
            h('select', { value: draft.risk, onChange: (e) => setDraft({ ...draft, risk: e.target.value }) },
              ['L0', 'L1', 'L2', 'L3', 'L4'].map((level) => h('option', { key: level, value: level }, level)))),
          h('div', { className: 'dsh-btc-field full' },
            h('label', null, t(ctx, 'description')),
            h('textarea', { value: draft.description, onChange: (e) => setDraft({ ...draft, description: e.target.value }) })),
          h('div', { className: 'dsh-btc-field full' },
            h('button', { type: 'button', className: 'primary', disabled: busy || !draft.title.trim(), onClick: create }, t(ctx, 'newTask')))));

      const actionsFor = (task) => {
        const actions = [];
        if (task.state === 'draft' || task.state === 'awaiting_approval') actions.push(h('button', { key: 'approve', type: 'button', onClick: (e) => { e.stopPropagation(); act('approve', task.id); } }, t(ctx, 'approval')));
        if (task.state === 'running') actions.push(h('button', { key: 'pause', type: 'button', onClick: (e) => { e.stopPropagation(); act('pause', task.id); } }, t(ctx, 'pause')));
        if (task.state === 'paused') actions.push(h('button', { key: 'resume', type: 'button', onClick: (e) => { e.stopPropagation(); act('resume', task.id); } }, t(ctx, 'resume')));
        if (!['cancelled', 'completed'].includes(task.state)) actions.push(h('button', { key: 'cancel', type: 'button', className: 'danger', onClick: (e) => { e.stopPropagation(); act('cancel', task.id); } }, t(ctx, 'cancel')));
        actions.push(h('button', { key: 'delete', type: 'button', className: 'danger', onClick: (e) => { e.stopPropagation(); act('delete', task.id); } }, t(ctx, 'remove')));
        return h('div', { className: 'dsh-btc-actions' }, ...actions);
      };

      const timelineFor = (task) => h('div', { className: 'dsh-btc-timeline' },
        h('div', { className: 'dsh-btc-meta' }, t(ctx, 'timeline')),
        ...(task.timeline.length === 0
          ? [h('div', { className: 'dsh-btc-time', key: 'empty' }, t(ctx, 'noTimeline'))]
          : task.timeline.map((entry, index) => h('div', { className: 'dsh-btc-time', key: `${entry.at}-${index}` }, `${entry.at} · ${entry.action} · ${entry.detail}`))));

      const taskCard = (task) => {
        const open = current && current.id === task.id;
        return h('article', {
          key: task.id,
          className: `dsh-btc-task${open ? ' active' : ''}`,
          onClick: () => setSelected(task.id),
        },
          h('div', { className: 'dsh-btc-row' },
            h('span', { className: 'dsh-btc-name' }, task.title),
            h('span', { className: 'dsh-btc-pill', 'data-tone': TONE[task.state] || '' }, states[task.state] || task.state)),
          h('div', { className: 'dsh-btc-meta' },
            h('span', null, task.risk),
            h('span', null, task.provider),
            h('span', null, task.description || t(ctx, 'noDescription'))),
          open ? h('div', null, actionsFor(task), timelineFor(task)) : null);
      };

      const body = tasks.length === 0
        ? h('div', { className: 'dsh-btc-empty' }, busy ? t(ctx, 'loading') : t(ctx, 'empty'))
        : h('div', { className: 'dsh-btc-list' }, ...tasks.map(taskCard));

      return h('section', { className: 'dsh-btc', 'aria-label': t(ctx, 'title') },
        h('style', null, css),
        h('div', { className: 'dsh-btc-wrap' },
          h('header', { className: 'dsh-btc-head' },
            h('div', null,
              h('h1', { className: 'dsh-btc-title' }, t(ctx, 'title')),
              h('p', { className: 'dsh-btc-sub' }, t(ctx, 'subtitle'))),
            h('span', { className: 'dsh-btc-pill', 'data-tone': 'warn' }, t(ctx, 'unavailable'))),
          h('div', { className: 'dsh-btc-banner', role: 'status' }, h('strong', null, t(ctx, 'readonly'))),
          error ? h('div', { className: 'dsh-btc-error', role: 'alert' }, `${t(ctx, 'error')}${error}`) : null,
          editor,
          body));
    }

    return {
      inject: ['slots', 'connection', 'locale'],
      apply(ctx) {
        ctx.effect(() => {
          const sidebar = ctx.slots.inject('sidebar.panellist', () => ctx.slots.register(
            { name: 'sidebar.panellist', id: 'dsh-browser-computer-use', order: 26, label: () => dictOf(ctx).title },
            () => h('span', { style: { fontSize: 15, lineHeight: 1 }, 'aria-hidden': 'true' }, '◎')));
          const main = ctx.slots.inject('main', () => ctx.slots.register(
            { name: 'main', key: 'dsh-browser-computer-use' },
            () => h(TaskCenter, { ctx })));
          return () => { try { sidebar?.(); } catch {} try { main?.(); } catch {} };
        });
      },
    };
  },
});
