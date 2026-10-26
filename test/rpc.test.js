import assert from 'node:assert/strict'
import test from 'node:test'
import { createReadOnlyWeb, createTaskStore } from '../rpc.js'

test('task CRUD and guarded transitions', () => {
  let tick = 0
  const store = createTaskStore({ now: () => `2026-01-01T00:00:0${tick++}Z`, id: () => 'bt_test' })
  const created = store.create({ title: 'Read page', risk: 'L1' })
  assert.equal(created.risk, 'L1'); assert.equal(created.state, 'draft'); assert.equal(created.provider, 'unavailable')
  assert.equal(store.transition(created.id, 'pause').state, 'draft')
  assert.equal(store.transition(created.id, 'approve').state, 'error')
  assert.equal(store.transition(created.id, 'pause').state, 'error')
  assert.equal(store.transition(created.id, 'cancel').state, 'cancelled')
  assert.equal(store.update(created.id, { title: 'Updated' }).title, 'Updated')
  assert.equal(store.remove(created.id), true)
})

test('readonly fallback reports unavailable provider', async () => {
  const web = createReadOnlyWeb({})
  assert.equal((await web.fetch({ url: 'https://example.com' })).code, 'provider_unavailable')
  assert.equal((await web.search({ query: 'safe' })).code, 'provider_unavailable')
})
