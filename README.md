# dsh-browser-computer-use

通过 **Chrome DevTools Protocol (CDP)** 控制一个真实的 Chromium 内核浏览器。默认关闭，必须由用户在 **DeepSeek Harness → 设置 → 浏览器** 中手动开启；所有写操作默认逐次审批。

> 安全边界：不读取 Cookie、不填写密码框、不访问 `file:`/`data:`/`javascript:`/`chrome://` 等协议、不提供远程调试之外的私有接口。

## 安装

```text
plugin_manager({ action: "install_bundle", target: "<本目录绝对路径>" })
```

安装后：

- 设置里多出 **浏览器** 页：CDP 开关、调试地址、启动浏览器、网站权限；
- 不再新增左侧栏图标；标签页、导航、读取页面、截图、操作记录都在 **设置 → 浏览器** 页内；
- 模型获得 `browser` 工具（需先手动开启 CDP）。

## 手动开启 CDP

1. **设置 → 浏览器 → 启用 CDP 浏览器控制** 打开。
2. 调试地址默认 `http://127.0.0.1:9222`。
3. 点 **启动浏览器**：插件会以独立配置目录（`$DSH_HOME/browser-computer-use/profile`）启动本机 Chromium 内核浏览器，并监听该端口；也可以自己启动：

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.dsh/browser-computer-use/profile" \
  --no-first-run about:blank
```

支持的浏览器：Chrome、Chrome Canary、Chromium、Microsoft Edge、Brave，以及 Playwright 缓存里的 “Google Chrome for Testing”。也可用 `DSH_BROWSER_EXECUTABLE` 指定可执行文件；`DSH_BROWSER_HEADLESS=1` 可让启动器以 headless 模式启动（用于验证或服务器环境）。

4. 点 **重新检测**，状态变为「已连接」后，页面下方的标签页、导航、读取、截图与操作记录即可使用。

## 网站权限（设置内配置）

| 权限 | 行为 |
|---|---|
| `auto` 自动允许 | 该域名的点击/输入/导航不再逐次审批（仍受协议与密码框保护） |
| `ask` 每次询问 | 默认值；代理每个写操作都请求用户一次性批准 |
| `block` 禁止 | 完全拒绝该域名的导航与打开 |

域名按后缀匹配：`example.com` 同时覆盖 `docs.example.com`。

## 模型工具 `browser`

| action | 说明 | 风险 |
|---|---|---|
| `status` / `tabs` / `read` / `screenshot` | 读取状态、标签页、页面文本、截图 | 只读，无需审批 |
| `open` / `navigate` | 打开或跳转 http(s) 页面 | 写操作 |
| `click` / `type` / `key` / `scroll` | 点击选择器或坐标、输入文字、按键、滚动 | 写操作 |
| `activate` / `closeTab` | 切换、关闭标签页 | 写操作 |
| `history` | 最近操作记录 | 只读 |

写操作在 `ask` 站点下会调用 DSH 的审批通道（一次性批准）；被拒绝时工具返回 `APPROVAL_REQUIRED`，代理不会循环重试。截图会同时落盘并作为图片附件进入对话。

## 安全限制

- 密码输入框（`input[type=password]`）拒绝自动填写；
- 拒绝 URL 携带账号密码、拒绝非 `http(s)` 协议；
- 截图**不会自动脱敏**，可能包含页面上的敏感信息，README 与界面均有提示；
- 默认只允许 loopback 调试地址；远程端点需要显式允许（配置文件项 `allowRemoteEndpoint`，当前未暴露 UI）；
- 关闭 CDP 开关会立即断开调试 WebSocket。

## 验证状态（DSH 0.2.1-rc.2）

已用 Playwright 缓存中的 `Google Chrome for Testing` 做过真实 CDP 冒烟测试：

- `/json/version`、`/json/list`、新建/关闭标签页；
- `Page.navigate`、`Runtime.evaluate` 读取页面文本、`Page.captureScreenshot`；
- `data:` URL 被 `URL_BLOCKED` 拒绝；`block` 站点返回 `HOST_BLOCKED`；
- 关闭开关时工具返回 `BROWSER_DISABLED`；
- `launchBrowser()` 实际拉起 Chrome for Testing（headless）并等到 `/json/version` 就绪；
- 通过 DSH 活工具 `browser status` 验证：默认关闭、可发现本机 Microsoft Edge 可执行文件；
- `node --test` 4 项通过（端点归一化、URL 守卫、动作分级、策略默认值）。

未验证：真实桌面浏览器（非 headless）下的人工点击路径与深浅色视觉；本机当前为锁屏状态，未生成截图。

## 目录

| 文件 | 作用 |
|---|---|
| `index.js` | 宿主入口：`browser` 工具、审批判定、系统提示、RPC 路由 |
| `cdp.js` | CDP 客户端：版本/标签页/导航/点击/输入/按键/滚动/截图/读页面、URL 守卫、动作分级 |
| `policy.js` | 策略存储：开关、端点、网站权限、操作记录（`$DSH_HOME/browser-computer-use/policy.json`） |
| `launcher.js` | 发现并启动本机 Chromium 内核浏览器（独立配置目录） |
| `rpc.js` | 控制器与 `/api/dsh-browser-computer-use` 路由 |
| `client.js` | 设置页 + 浏览器面板 |
| `test/rpc.test.js` | 端点、URL 守卫、分级、策略测试 |

## 仓库

- GitHub: <https://github.com/CatLollipop/dsh-browser-computer-use>
