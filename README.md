# DSH Safe Browser Task Center

安全任务中心 bundle：提供任务 CRUD、L0-L4 风险分级、审批/暂停/继续/取消与动作时间线。

## 安全边界

- **不接外部账户**，不读取或保存 cookies、token、密码。
- **不调用私有接口**，不实现真实浏览器控制或 DOM 自动化。
- provider 固定标记为 `unavailable`；仅提供只读 `web.fetch` / `web.search` fallback（如果 Harness 已注册公开 web provider，否则返回 `provider_unavailable`）。
- 所有状态由任务中心维护；审批、暂停、继续、取消仅改变任务状态，不会触发浏览器动作。

## Bundle 文件

- `index.js`：Host 服务与 `browser_task_center` agent tool。
- `client.js`：Web Client UI，注册 `main` 与 `sidebar` slots，使用 theme token、locale、connection RPC。
- `rpc.js`：任务 store、只读 web adapter 与 JSON RPC route/client。
- `cordis.patch.yml`：插入 bundle entry。

安装 bundle 后，任务中心可在 Web UI 的 main/sidebar 插槽出现；无 provider 时显示明确空态、错误、不可用与只读状态。

## UI 验证说明

Client 使用 DSH theme token、键盘可操作表单、状态徽章和可读错误提示；本环境没有可控浏览器截图通道，因此未伪造截图或 mock 页面。安装并重启 DSH 后，应在 sidebar 的 Browser tasks 入口检查 main 面板、窄窗口布局、深浅色主题和审批状态。

## 验证状态（DSH 0.2.1-rc.2）

- Host bundle 已在当前 profile 中 `application: applied`，`fiberPhase: active`。
- Client 已注册到实时插槽：`sidebar.panellist`（面板图标）与 `main`（面板主体）的 occupants 中可见本插件 id。
- Client 只使用 `--dsw-alias-*` 主题 token、`ctx.connection.rpc`、`ctx.slots`、`ctx.locale`，不写 DOM、不导入 DSH Client 包。
- 单元测试与 `node --check` 通过（见下表）。

### 关于界面截图

本机在编写本文件时处于锁屏/无图形会话状态，`screencapture` 只能得到锁屏画面，因此仓库中**没有伪造的截图或 mock 图**。解锁 DSH 后可在实际界面中截图并按下面步骤替换本节：

1. 打开左侧栏对应的面板图标；
2. 浅色与深色主题各截一张，窗口宽度分别取 1280px 与 375px；
3. 将图片放到 `docs/screenshots/` 并在本文件引用。

面板内容：Provider 状态与只读兜底说明、任务创建（L0–L4）、状态徽章、审批/暂停/继续/取消/删除、动作时间线。
