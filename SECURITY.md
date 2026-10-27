# 安全策略 (Security Policy)

MangaFlow 团队高度重视系统的安全性和创作者的隐私数据安全。

---

## 一、支持的安全维护版本

| 版本分支 | 支持状态 |
| :--- | :--- |
| 1.x (最新 release / main) | :white_check_mark: 积极接收安全更新 |
| < 1.0.0 | :x: 不再维护，请升级至最新版 |

---

## 二、漏洞反馈流程 (Reporting a Vulnerability)

如果您在 MangaFlow 中发现了潜在的安全漏洞（如服务端请求伪造 SSRF、敏感信息泄露、依赖项高危漏洞或注入风险），**请切勿在公开的 GitHub Issue 或公开发表物中直接披露**。

推荐通过 **GitHub 私密漏洞报告 (Private Vulnerability Reporting)** 提交：
- 请访问本项目 GitHub 仓库页面的 **Security** 标签页，点击 **Report a vulnerability** 提交私密报告。
- 维护者收到通知后将在私密通道中与您协作处理，避免安全漏洞在修复前公开扩散。

> *注：仓库管理员可在 GitHub 仓库的 `Settings` -> `Code security and analysis` 中开启 `Private vulnerability reporting` 功能。*

我们承诺：
1. 在 48 小时内确认收到漏洞报告并初步评估影响范围。
2. 在验证漏洞后，优先安排修复并在修复版本发布前保持负责任的披露期。
3. 在 Release Notes 中对漏洞报告者致谢（如报告者愿意公开身份）。

---

## 三、API 密钥与数据安全设计

### 1. 密钥安全与服务端代理

- **无客户端暴露**：MangaFlow 采用 Next.js App Router 服务端架构，`STORYBOARD_API_KEY` 仅在服务端进程中被读取并参与向上游 AI 发送请求。系统前端通过 `/api/ai/config` 查询配置状态时，仅返回布尔值 `hasApiKey: boolean`，绝对不会将服务端明文密钥下发至浏览器端。
- **环境隔离**：`.env.local` 默认包含在 `.gitignore` 列表中。切勿将包含真实凭据的任何环境配置文件加入 Git 追踪。
- **界面临时密钥**：用户在前端“设置”面板中手动输入的 API Key 仅保存在用户浏览器的 `localStorage` 中，并在发起分镜生成时通过 HTTPS 传输至本项目服务端代理转发，不会被持久化存储在任何第三方服务器。

### 2. 创作隐私与数据边界

- **本地优先**：用户的漫画分镜工程、草稿、人物设定及编辑历史默认完全保存在浏览器本地的 `localStorage` 中。
- **第三方 AI 调用边界**：只有在用户主动触发【剧情因果分析】、【生成全篇分镜】、【单页重构】、【单格微调】或【连贯性审查】等 AI 相关操作时，当前项目的剧情梗概、人物设定和对应画格数据才会作为 Prompt 上下文发送给用户所配置的大语言模型服务商（如 OpenAI、DeepSeek、通义千问等）。未配置 API Key 时，系统运行在内置规则驱动的演示模式下，不会发起任何外部网络通信。
- **无静默数据收集**：MangaFlow 不含任何后门、遥测上报或第三方广告分析脚本。

---

## 四、意外密钥泄露的应急处置

若您在开发或部署过程中不慎将真实的 API 密钥提交到了 Git 仓库或公开网络中：
1. **立即轮换**：请第一时间前往对应的 AI 服务商后台（OpenAI、DeepSeek 等）吊销并重新生成该 API Key。
2. **切勿仅提交新 Commit 覆盖**：仅用新提交删除文件无法从 Git 历史树中抹除敏感信息。如需彻底清除 Git 历史，需使用 `git-filter-repo` 或 BFG Repo-Cleaner 重写提交历史并强制推送。
