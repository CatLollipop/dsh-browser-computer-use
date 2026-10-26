import { createReadOnlyWeb, createTaskStore, registerRpcRoute } from './rpc.js'

export const inject = ['tools', 'web']
function toolDefinition(api) {
  return {
    name: 'browser_task_center',
    description: '安全浏览器任务中心：管理任务 CRUD、L0-L4 风险、审批/暂停/继续/取消与时间线。当前不控制真实浏览器；provider 不可用时仅支持只读 web.fetch/search fallback。',
    timeoutMs: 30000,
    parameters: { type: 'object', properties: {
      action: { type: 'string', enum: ['list', 'get', 'create', 'update', 'delete', 'approve', 'pause', 'resume', 'cancel', 'fetch', 'search'] },
      id: { type: 'string' }, title: { type: 'string' }, description: { type: 'string' }, risk: { type: 'string', enum: ['L0', 'L1', 'L2', 'L3', 'L4'] }, url: { type: 'string' }, query: { type: 'string' }
    }, required: ['action'] },
    output: { schema: { type: 'string' }, render(_args, value) { return [{ type: 'text', text: JSON.stringify(value, null, 2) }] } },
    isConcurrencySafe: () => false,
    async execute(args, exec) { return api.dispatch(args || {}, exec?.signal) }
  }
}

export function apply(ctx, config = {}) {
  const store = createTaskStore()
  const readonlyWeb = createReadOnlyWeb({ web: ctx.web })
  const api = {
    provider: 'unavailable',
    list: () => store.list(),
    get: ({ id }) => store.get(id),
    create: input => store.create({ ...input, risk: input?.risk || config.defaultRisk || 'L2' }),
    update: input => store.update(input.id, input),
    delete: input => ({ ok: store.remove(input.id) }),
    transition: input => store.transition(input.id, input.action),
    async dispatch(input, signal) {
      const action = input?.action
      if (action === 'list') return { ok: true, tasks: store.list(), provider: 'unavailable' }
      if (action === 'get') return { ok: true, task: store.get(input.id) }
      if (action === 'create') return { ok: true, task: store.create({ ...input, risk: input.risk || config.defaultRisk || 'L2' }) }
      if (action === 'update') return { ok: true, task: store.update(input.id, input) }
      if (action === 'delete') return { ok: store.remove(input.id) }
      if (['approve', 'pause', 'resume', 'cancel'].includes(action)) return { ok: true, task: store.transition(input.id, action) }
      if (action === 'fetch') return readonlyWeb.fetch(input, signal)
      if (action === 'search') return readonlyWeb.search(input, signal)
      return { ok: false, code: 'unknown_action', message: `Unknown action: ${String(action)}` }
    }
  }
  try { ctx.provide?.('browserTaskCenter', api) } catch {}
  const disposeTool = ctx.tools?.register?.(toolDefinition(api))
  const disposeRoute = registerRpcRoute(ctx, (payload) => api.dispatch(payload))
  ctx.effect?.(() => () => { try { disposeTool?.() } catch {} try { disposeRoute?.() } catch {} })
}
