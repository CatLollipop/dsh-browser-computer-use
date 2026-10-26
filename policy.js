import os from 'node:os'
import path from 'node:path'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'

export const DEFAULT_POLICY = Object.freeze({
  version: 1,
  enabled: false,
  endpoint: 'http://127.0.0.1:9222',
  sites: [],
  allowRemoteEndpoint: false,
  approveReadOnly: false,
  lastTargetId: '',
  historyLimit: 60,
})

export function dshHome() {
  return process.env.DSH_HOME?.trim() || path.join(os.homedir(), '.dsh')
}

export function policyPath() {
  return path.join(dshHome(), 'browser-computer-use', 'policy.json')
}

export function profileDir() {
  return path.join(dshHome(), 'browser-computer-use', 'profile')
}

export function screenshotDir() {
  return path.join(dshHome(), 'browser-computer-use', 'screenshots')
}

export function normalizePolicy(raw) {
  const input = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  const rawSites = Array.isArray(input.sites)
    ? input.sites
    : Array.isArray(input.allowHosts)
      ? input.allowHosts.map((host) => ({ host, mode: 'auto' }))
      : []
  const sites = []
  const seen = new Set()
  for (const entry of rawSites.slice(0, 100)) {
    const host = String(entry?.host || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
    if (!host || seen.has(host)) continue
    seen.add(host)
    const mode = ['auto', 'ask', 'block'].includes(entry?.mode) ? entry.mode : 'ask'
    sites.push({ host, mode })
  }
  return {
    version: 1,
    enabled: input.enabled === true,
    endpoint: String(input.endpoint || DEFAULT_POLICY.endpoint).slice(0, 300),
    sites,
    allowRemoteEndpoint: input.allowRemoteEndpoint === true,
    approveReadOnly: input.approveReadOnly === true,
    lastTargetId: String(input.lastTargetId || '').slice(0, 200),
    historyLimit: 60,
  }
}

export class PolicyStore {
  constructor(file = policyPath()) {
    this.file = file
    this.policy = normalizePolicy(null)
    this.history = []
    this.loaded = false
    this.chain = Promise.resolve()
  }

  async load() {
    if (this.loaded) return this.policy
    this.loaded = true
    try {
      this.policy = normalizePolicy(JSON.parse(await readFile(this.file, 'utf8')))
    } catch {
      this.policy = normalizePolicy(null)
    }
    return this.policy
  }

  async save() {
    const run = async () => {
      await mkdir(path.dirname(this.file), { recursive: true })
      const temp = `${this.file}.${process.pid}.tmp`
      await writeFile(temp, `${JSON.stringify(this.policy, null, 2)}\n`, { mode: 0o600 })
      await rename(temp, this.file)
    }
    this.chain = this.chain.then(run, run)
    await this.chain
    return this.policy
  }

  async update(patch = {}) {
    await this.load()
    this.policy = normalizePolicy({ ...this.policy, ...patch })
    await this.save()
    return this.policy
  }

  record(entry) {
    this.history.push({ id: randomUUID().slice(0, 12), at: new Date().toISOString(), ...entry })
    if (this.history.length > this.policy.historyLimit) this.history.splice(0, this.history.length - this.policy.historyLimit)
    return this.history[this.history.length - 1]
  }

  listHistory(limit = 30) {
    return this.history.slice(-Math.max(1, Math.min(limit, this.policy.historyLimit))).reverse()
  }
}
