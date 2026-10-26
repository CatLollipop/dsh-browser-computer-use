import { spawn } from 'node:child_process'
import { access, mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import { profileDir } from './policy.js'

const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
]

const PLAYWRIGHT_ROOT = path.join(process.env.HOME || '', 'Library', 'Caches', 'ms-playwright')

async function exists(target) {
  try { await access(target); return true } catch { return false }
}

async function playwrightChromium() {
  let entries
  try { entries = await readdir(PLAYWRIGHT_ROOT) } catch { return [] }
  const versions = entries.filter((name) => /^chromium-\d+$/.test(name)).sort().reverse()
  const found = []
  for (const name of versions) {
    const base = path.join(PLAYWRIGHT_ROOT, name)
    for (const layout of ['chrome-mac-arm64', 'chrome-mac', 'chrome-mac-x64']) {
      const exe = path.join(base, layout, 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing')
      if (await exists(exe)) found.push(exe)
    }
  }
  return found
}

export async function findBrowserExecutable() {
  const override = process.env.DSH_BROWSER_EXECUTABLE?.trim()
  if (override && await exists(override)) return override
  for (const candidate of CHROME_CANDIDATES) {
    if (await exists(candidate)) return candidate
  }
  const playwright = await playwrightChromium()
  return playwright[0] || ''
}

export async function launchBrowser({ endpoint = 'http://127.0.0.1:9222', onLog = () => {} } = {}) {
  const port = new URL(endpoint).port || '9222'
  const executable = await findBrowserExecutable()
  if (!executable) {
    const error = new Error('没有找到可用的 Chromium 内核浏览器。请安装 Chrome、Edge，或设置 DSH_BROWSER_EXECUTABLE。')
    error.code = 'BROWSER_NOT_FOUND'
    throw error
  }
  const userDataDir = profileDir()
  await mkdir(userDataDir, { recursive: true })
  const args = [
    `--remote-debugging-port=${port}`,
    '--remote-debugging-address=127.0.0.1',
    '--remote-allow-origins=*',
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-features=Translate',
    'about:blank',
  ]
  onLog({ phase: 'spawn', executable, port })
  const child = spawn(executable, args, { detached: true, stdio: 'ignore' })
  child.unref()
  const deadline = Date.now() + 20000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${endpoint.replace(/\/$/, '')}/json/version`, { signal: AbortSignal.timeout(1500) })
      if (response.ok) {
        const body = await response.json().catch(() => null)
        return { launched: true, pid: child.pid, executable, endpoint, browser: body?.Browser || 'unknown', profileDir: userDataDir }
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 400))
  }
  return { launched: true, pid: child.pid, executable, endpoint, browser: 'unknown', profileDir: userDataDir, warning: '浏览器已启动，但调试端口在 20 秒内没有响应。' }
}

export async function browserAvailability() {
  const executable = await findBrowserExecutable()
  return { executable, found: Boolean(executable) }
}
