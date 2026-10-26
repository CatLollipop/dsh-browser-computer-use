import assert from 'node:assert/strict'
import test from 'node:test'
import { assertSafeUrl, classifyAction, normalizeEndpoint } from '../cdp.js'
import { normalizePolicy } from '../policy.js'

test('endpoint normalization accepts bare host:port and rejects non-http', () => {
  assert.equal(normalizeEndpoint('127.0.0.1:9222'), 'http://127.0.0.1:9222')
  assert.equal(normalizeEndpoint('http://localhost:9333/'), 'http://localhost:9333')
  assert.equal(normalizeEndpoint('http://127.0.0.1'), 'http://127.0.0.1:9222')
  assert.throws(() => normalizeEndpoint('file:///tmp/x'), /调试地址/)
  assert.throws(() => normalizeEndpoint(''), /不能为空/)
})

test('url guard blocks local schemes, credentials, and hosts outside the allowlist', () => {
  assert.equal(assertSafeUrl('https://example.com/a'), 'https://example.com/a')
  assert.throws(() => assertSafeUrl('file:///etc/passwd'), /拒绝访问/)
  assert.throws(() => assertSafeUrl('javascript:alert(1)'), /不是合法 URL|拒绝访问/)
  assert.throws(() => assertSafeUrl('https://user:pass@example.com/'), /账号密码/)
  assert.throws(() => assertSafeUrl('https://evil.test/', { allowHosts: [{ host: 'evil.test', mode: 'block' }] }), /禁止访问/)
  assert.equal(assertSafeUrl('https://docs.example.com/x', { allowHosts: [{ host: 'example.com', mode: 'ask' }] }), 'https://docs.example.com/x')
})

test('action classification separates read-only from mutating actions', () => {
  assert.equal(classifyAction('read'), 'L1')
  assert.equal(classifyAction('screenshot'), 'L1')
  assert.equal(classifyAction('navigate'), 'L2')
  assert.equal(classifyAction('click'), 'L2')
  assert.equal(classifyAction('deleteEverything'), 'L4')
})

test('policy normalization keeps safety defaults', () => {
  const policy = normalizePolicy(null)
  assert.equal(policy.enabled, false)
  assert.deepEqual(policy.sites, [])
  assert.equal(policy.allowRemoteEndpoint, false)
  assert.equal(policy.endpoint, 'http://127.0.0.1:9222')

  const custom = normalizePolicy({ enabled: true, sites: [{ host: ' Example.com ', mode: 'auto' }, { host: 'example.com', mode: 'block' }, { host: '' }], endpoint: '127.0.0.1:9333' })
  assert.equal(custom.enabled, true)
  assert.deepEqual(custom.sites, [{ host: 'example.com', mode: 'auto' }])
  assert.equal(custom.endpoint, '127.0.0.1:9333')

  const legacy = normalizePolicy({ allowHosts: ['legacy.test'] })
  assert.deepEqual(legacy.sites, [{ host: 'legacy.test', mode: 'auto' }])
  assert.equal(policy.defaultMode, 'ask')
  assert.equal(normalizePolicy({ defaultMode: 'block' }).defaultMode, 'block')
  assert.equal(normalizePolicy({ defaultMode: 'nope' }).defaultMode, 'ask')
})
