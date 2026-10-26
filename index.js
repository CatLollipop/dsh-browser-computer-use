import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { classifyAction } from './cdp.js'
import { createBrowserController, registerRpcRoute } from './rpc.js'
import { PolicyStore } from './policy.js'

export const inject = ['connection', 'tools']

const SKILLS_DIR = fileURLToPath(new URL('./skills/', import.meta.url))

function parseFrontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(source)
  if (!match) return { data: {}, body: source }
  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx <= 0) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1)
    data[key] = value
  }
  return { data, body: match[2] }
}

async function loadBrowserSkills() {
  const entries = await readdir(SKILLS_DIR, { withFileTypes: true }).catch(() => [])
  const skills = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    try {
      const source = await readFile(path.join(SKILLS_DIR, entry.name, 'SKILL.md'), 'utf8')
      const { data, body } = parseFrontmatter(source)
      const name = String(data.name || entry.name).trim()
      const description = String(data.description || '').trim()
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || !description) continue
      skills.push({ name, description, content: body.trim() })
    } catch {}
  }
  return skills
}

const MUTATING = new Set(['open', 'navigate', 'click', 'type', 'key', 'scroll', 'activate', 'closeTab'])

const PROMPT = [
  'The browser tool controls a real Chromium browser over CDP, but only after the user enables it in the plugin configuration page: Settings → Plugins → dsh-browser-computer-use (no sidebar icon is added).',
  'Read-only actions (status, tabs, read, screenshot) work once enabled.',
  'Mutating actions (open, navigate, click, type, key, scroll, closeTab) always ask the user for one-time approval; a denied approval must not be retried in a loop.',
  'Never type credentials, cookies, or payment data. Password fields are refused by the browser tool.',
  'If the browser is disabled or unreachable, tell the user to open Settings → 浏览器, check the debug endpoint, and press 启动浏览器 / 重新检测 instead of retrying tools.',
].join(' ')

function safeGet(ctx, name) {
  try { return ctx.get?.(name) } catch { return undefined }
}

async function requestApproval(ctx, exec, action, payload) {
  const approval = safeGet(ctx, 'approval')
  if (!approval?.request) return false
  const target = payload.url || payload.selector || payload.targetId || ''
  try {
    const outcome = await approval.request({
      agent: exec.agent,
      toolName: 'browser',
      callId: exec.callId,
      signal: exec.signal,
      reason: `Browser ${action} ${String(target).slice(0, 200)}`,
      displayReason: {
        en: `Allow the agent to ${action} ${String(target).slice(0, 120) || 'the browser'}?`,
        zh: `允许代理对浏览器执行「${action}」？目标：${String(target).slice(0, 120) || '当前标签页'}`,
      },
    })
    return outcome === 'allowed-once'
  } catch {
    return false
  }
}

function browserTool(controller, ctx) {
  return {
    name: 'browser',
    description: '用 CDP 控制用户已授权的 Chromium 浏览器：status/tabs/read/screenshot 只读；open/navigate/click/type/key/scroll/closeTab 会请求用户一次性审批。浏览器需在设置 → 浏览器中手动启用。',
    timeoutMs: 120000,
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        action: {
          type: 'string',
          enum: ['status', 'launch', 'tabs', 'open', 'navigate', 'read', 'screenshot', 'click', 'type', 'key', 'scroll', 'activate', 'closeTab', 'history'],
        },
        url: { type: 'string', description: 'open / navigate 的目标网址，必须是 http(s)。' },
        selector: { type: 'string', description: 'click / type 使用的 CSS 选择器。' },
        text: { type: 'string', description: 'type 要输入的文字。' },
        key: { type: 'string', description: 'Enter / Tab / Escape / Backspace / ArrowUp / ArrowDown / PageUp / PageDown。' },
        deltaY: { type: 'number', description: 'scroll 的垂直像素，正数向下。' },
        targetId: { type: 'string', description: '目标标签页 id，省略时使用当前标签页。' },
        x: { type: 'number', description: 'click 的视口坐标 x（与 y 同时提供时替代 selector）。' },
        y: { type: 'number', description: 'click 的视口坐标 y。' },
        fullPage: { type: 'boolean', description: 'screenshot 是否截取整页。' },
      },
      required: ['action'],
    },
    output: {
      schema: { type: 'object' },
      render(_args, value) {
        const blocks = []
        const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
        blocks.push({ type: 'text', text: text.length > 12000 ? `${text.slice(0, 12000)}\n…(truncated)` : text })
        if (value && value.image && value.image.attachment) blocks.push({ type: 'image', attachment: value.image.attachment })
        return blocks
      },
    },
    isConcurrencySafe: () => false,
    async execute(args, exec) {
      const payload = { ...(args || {}) }
      const action = String(payload.action || 'status')

      if (MUTATING.has(action) || action === 'launch') {
        const policy = safeGet(ctx, 'approval') ? await controller.status().catch(() => null) : null
        const targetUrl = payload.url || (await controller.currentUrl().catch(() => ''))
        const mode = controller.modeFor(targetUrl)
        if (mode === 'block') {
          return { ok: false, code: 'SITE_BLOCKED', message: `该网站已被设置为禁止访问：${targetUrl || '当前页面'}。不要重试。` }
        }
        if (mode !== 'auto') {
          const granted = await requestApproval(ctx, exec, action, { ...payload, url: targetUrl })
          if (!granted) {
            return { ok: false, requiresApproval: true, code: 'APPROVAL_REQUIRED', message: '用户没有批准这次浏览器操作，不要重复尝试；请说明你会做什么并等待用户再次批准。' }
          }
        }
        void policy
      }

      const result = await controller.dispatch(payload)
      if (!result.ok) return result
      const value = result.value

      if (action === 'screenshot' && value?.file) {
        const attachments = safeGet(ctx, 'attachments')
        let attachment = null
        if (attachments?.saveImage) {
          try {
            const { readFile } = await import('node:fs/promises')
            const data = await readFile(value.file)
            const ref = await attachments.saveImage({ data, mediaType: 'image/png', name: `browser-${Date.now()}.png` })
            attachment = ref
          } catch {}
        }
        return { ok: true, file: value.file, page: value.page, image: attachment ? { attachment } : null }
      }
      if (action === 'read') {
        return { ok: true, url: value.url, title: value.title, text: value.text, links: value.links }
      }
      return { ok: true, ...value }
    },
  }
}

export function apply(ctx) {
  const policyStore = new PolicyStore()
  const controller = createBrowserController({ policyStore })
  const disposeTool = ctx.tools?.register?.(browserTool(controller, ctx))
  const disposeRoute = registerRpcRoute(ctx, controller)
  let disposePrompt
  try {
    disposePrompt = ctx.get?.('systemPrompt')?.section?.({
      name: 'browser-cdp',
      order: 7420,
      interpolate: false,
      text: PROMPT,
    })
  } catch {}

  function registerSkills(host) {
    try {
      const stop = host.inject(['skills'], (skillsCtx) => {
        void loadBrowserSkills().then((skills) => {
          for (const skill of skills) {
            try {
              skillsCtx.skills.register({
                name: skill.name,
                description: skill.description,
                content: skill.content,
                whenToUse: skill.description,
                source: 'bundled',
                provider: 'dsh-browser-computer-use',
                invocation: { modelInvocable: true, userInvocable: true },
              })
            } catch {}
          }
        }).catch(() => {})
        return () => {}
      })
      return typeof stop === 'function' ? stop : () => {}
    } catch {
      return () => {}
    }
  }

  const disposeSkills = registerSkills(ctx)

  ctx.effect(() => () => {
    try { disposeTool?.() } catch {}
    try { disposeRoute?.() } catch {}
    try { disposePrompt?.() } catch {}
    try { disposeSkills?.() } catch {}
  })

  return controller
}

export { classifyAction }
