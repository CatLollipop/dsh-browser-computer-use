---
name: browser-use
description: Drive the user's CDP-enabled Chromium browser to open pages, read content, click, type, and screenshot. Use for tasks that need a real browser session, JavaScript-rendered pages, or visual verification.
---

# Browser Use (CDP)

Use this skill when the task needs a **real browser**, not a text fetch: JS-rendered pages, interacting with a site, visual checks, or filling a workflow's UI.

## Before anything

1. Call the `browser` tool with `action: "status"`.
2. If it reports `enabled: false`, stop and ask the user to enable it in **设置 → 插件 → dsh-browser-computer-use**（或插件管理里的该插件配置页），press 启动浏览器 / 重新检测，then retry.
3. If `reachable: false`, tell the user the debug endpoint is not answering and ask them to launch the browser. Do not retry status in a loop.

## Working loop

1. **Observe first**: `tabs` to list targets, then `read` (or `screenshot`) to see the page.
2. **Prefer reading over clicking**: extract text/links before interacting.
3. **Write actions need approval**: `open`, `navigate`, `click`, `type`, `key`, `scroll`, `closeTab`, `activate` may trigger a one-time user approval. If the tool returns `APPROVAL_REQUIRED`, do not retry; explain what you wanted to do and wait for the user.
4. **After each action**, re-`read` or `screenshot` to confirm the page changed as expected.
5. **Keep claims grounded**: only say a page says something if `read` returned it; only say a screenshot looks right if you actually saw the image.

## Site permissions

- `ask` (default): every write action asks the user.
- `auto`: the user has pre-approved this site; writes run without a per-action prompt. Stay inside what they asked for.
- `block`: refuse; report the site is disallowed and stop.
- `defaultMode` applies when the host has no override.

## Safety rules

- Never type passwords, card numbers, or tokens. The tool refuses password fields; do not try to work around that.
- Never read or exfiltrate cookies, localStorage, or session stores.
- Do not submit forms, place orders, send messages, or delete data on `auto` sites unless the user explicitly asked for that exact action.
- Screenshots are not redacted; avoid capturing pages with secrets, and never paste credentials into pages.
- `file:`, `data:`, `javascript:`, `chrome:`, and URLs with embedded credentials are refused by design.

## Failure handling

| Symptom | What to do |
|---|---|
| `BROWSER_DISABLED` | Ask the user to enable CDP in the plugin configuration page. |
| `CDP_UNREACHABLE` / `CDP_UNAVAILABLE` | Ask the user to launch the browser or fix the endpoint. |
| `APPROVAL_REQUIRED` | Stop; explain the planned action; wait for the user. |
| `SITE_BLOCKED` / `HOST_BLOCKED` | Report the block; do not try another URL to bypass it. |
| `SELECTOR_NOT_FOUND` | Re-read the page, try a more stable selector, or ask the user. |
| `PASSWORD_FIELD_BLOCKED` | Hand the step to the user; do not attempt alternatives. |
| `TAB_CREATE_FAILED` / `NO_TAB` | Ask the user to open a tab, then retry once. |

## Ending

Summarize what you opened, what you read, what you changed, and any action the user still needs to approve. Leave the browser in the state you found it unless the user asked otherwise.
