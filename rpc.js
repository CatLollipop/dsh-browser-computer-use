const RISKS = new Set(['L0', 'L1', 'L2', 'L3', 'L4'])
const STATES = new Set(['draft', 'awaiting_approval', 'running', 'paused', 'completed', 'cancelled', 'error'])

export function createTaskStore({ now = () => new Date().toISOString(), id = () => `bt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` } = {}) {
  const tasks = new Map()
  const stamp = (task, action, detail) => { task.updatedAt = now(); task.timeline.push({ at: task.updatedAt, action, detail }) }
  const clone = value => JSON.parse(JSON.stringify(value))
  const list = () => [...tasks.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(clone)
  const get = taskId => tasks.has(taskId) ? clone(tasks.get(taskId)) : null
  const create = input => {
    const risk = RISKS.has(input?.risk) ? input.risk : 'L2'
    const task = { id: id(), title: String(input?.title || 'Untitled browser task').slice(0, 160), description: String(input?.description || '').slice(0, 4000), risk, provider: 'unavailable', state: ['L0', 'L1'].includes(risk) ? 'draft' : 'awaiting_approval', timeline: [], createdAt: now(), updatedAt: now() }
    stamp(task, 'created', task.state === 'awaiting_approval' ? 'Task created; approval required before any side effect' : 'Task created; no browser provider attached')
    tasks.set(task.id, task)
    return clone(task)
  }
  const update = (taskId, input = {}) => {
    const task = tasks.get(taskId); if (!task) return null
    if (input.title !== undefined) task.title = String(input.title).slice(0, 160)
    if (input.description !== undefined) task.description = String(input.description).slice(0, 4000)
    if (input.risk !== undefined && RISKS.has(input.risk)) task.risk = input.risk
    stamp(task, 'updated', 'Task metadata updated')
    return clone(task)
  }
  const remove = taskId => tasks.delete(taskId)
  const transition = (taskId, action) => {
    const task = tasks.get(taskId); if (!task) return null
    const next = { approve: 'running', pause: 'paused', resume: 'running', cancel: 'cancelled' }[action]
    if (!next) return clone(task)
    if (action === 'approve' && task.state !== 'draft' && task.state !== 'awaiting_approval') return clone(task)
    if (action === 'approve' && task.provider === 'unavailable') {
      task.state = 'error'
      stamp(task, 'approval_blocked', 'No browser provider is attached; no action was dispatched')
      return clone(task)
    }
    if (action === 'pause' && task.state !== 'running') return clone(task)
    if (action === 'resume' && task.state !== 'paused') return clone(task)
    if (action === 'cancel' && ['completed', 'cancelled'].includes(task.state)) return clone(task)
    task.state = next
    stamp(task, action, `State changed to ${next}`)
    return clone(task)
  }
  return { list, get, create, update, remove, transition, has: id => tasks.has(id), RISKS, STATES }
}

export function createReadOnlyWeb({ web } = {}) {
  return {
    async fetch(input, signal) {
      if (!web?.fetch) return { ok: false, code: 'provider_unavailable', message: 'Read-only web.fetch provider unavailable' }
      try { return { ok: true, mode: 'readonly', result: await web.fetch({ url: String(input?.url || '') }, signal) } }
      catch (error) { return { ok: false, code: 'fetch_failed', message: String(error?.message || error) } }
    },
    async search(input, signal) {
      if (!web?.search) return { ok: false, code: 'provider_unavailable', message: 'Read-only web.search provider unavailable' }
      try { return { ok: true, mode: 'readonly', result: await web.search({ query: String(input?.query || '') }, signal) } }
      catch (error) { return { ok: false, code: 'search_failed', message: String(error?.message || error) } }
    },
  }
}

export function createRpcClient({ endpoint = '/api/dsh-browser-computer-use', transport } = {}) {
  const call = transport || (async (payload) => {
    const response = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
    if (!response.ok) throw new Error(`RPC ${response.status}`)
    return response.json()
  })
  return { call }
}

export function registerRpcRoute(ctx, handler) {
  const rpc = ctx?.connection?.rpc
  if (typeof rpc?.handle !== 'function') return () => {}
  try {
    return rpc.handle('dsh-browser-computer-use', async (_endpoint, payload, signal, peer) => {
      try {
        const value = await handler(payload || {}, signal, peer)
        return { ok: true, value }
      } catch (error) {
        return { ok: false, error: { code: String(error?.code || 'rpc_error'), message: String(error?.message || error), details: {} } }
      }
    })
  } catch { return () => {} }
}
