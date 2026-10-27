# MangaFlow 漫画分镜工坊 (AI Manga Storyboard Studio)

> **面向漫画家、分镜画师、编剧与视觉叙事创作者的开源 AI 漫画分镜创作辅助工作台**  
> *An open-source AI-assisted manga storyboarding workbench for comic artists, storyboard directors, and visual storytellers.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.17.0-brightgreen.svg)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)

[English Summary](#english-summary) | [功能清单](#三核心功能清单) | [快速上手](#六安装与本地启动步骤) | [AI 接口配置](#八ai-api-配置教程) | [常见问题](#十二常见问题与排障指南)

---

## English Summary

**MangaFlow** is a modern, developer-friendly and artist-first open-source web application designed to bridge literary screenplays with comic visual storytelling. It decomposes story scripts into structured, paginated manga storyboards.

- **Dual Modes**: Works out-of-the-box in a zero-network, zero-key **Demo Mode** with deterministic rule-based generation, or seamlessly connects to any **OpenAI-compatible LLM** (OpenAI, DeepSeek, Moonshot, Qwen, Ollama, etc.).
- **Director-level Insights**: Analyzes visual pacing, shot size progressions (Extreme Wide to Detail), camera angles (Dutch angle, Low angle, OTS), reader focal points, and provides 2 alternative shots for every panel.
- **Manga & Webtoon Support**: Full layout control for Japanese right-to-left (RTL) paginated manga and vertical-scroll webtoons.
- **Data Privacy**: Local-first architecture (`localStorage`), server-side API proxy (API keys are never exposed to the client), and clean export options (Markdown script & full JSON backup).

---

## 一、界面与工作台布局预览

MangaFlow 还原了实体漫画原稿纸质感，结合日本经典分镜演出法（コマ割り），界面分为四个高效协作区域：

```text
+-----------------------------------------------------------------------------------------------+
| [MangaFlow] 标题与项目切换 | 格式[日式/条漫] 视线流向[开/关] 缩放[100%] | [分析] [审查] [导出] [设置⚙️]  |
+-------------------+-----------------------------------------------+---------------------------+
| ◀ 页面缩略图侧边栏  |               中央核心漫画画布 (Canvas)         | ▶ 右侧检查器 (Inspector)    |
|                   |                                               |                           |
| [第 1 页] 4格      |   +---------------------------------------+   | 【分镜属性】               |
|  - 序章开篇       |   | 日式漫画纸张 (带蜻蜓切线标与出血线)     |   | · 景别：[特写 / Close-Up]  |
|                   |   | ------------------------------------- |   | · 视角：[荷式倾斜 / Dutch] |
| [第 2 页] 4格      |   | [ 第 1 格: 远景 交代空间环境 ]         |   | · 构图：[对角线构图]       |
|  - 视线碰撞       |   |                                       |   | · 动作：急促停步转身       |
|                   |   | [ 第 2 格: 中景 对话与动作 ]           |   |                           |
| [+ 新增页面]      |   |                                       |   | 【台词与音效】             |
|                   |   | [ 第 3 格: 特写 眼神与关键道具 ]       |   | · [普通对白] 角色A: ...    |
|                   |   |                                       |   | · [拟声词/SFX] 轰隆——!     |
|                   |   | [ 第 4 格: 翻页钩子 (Page-turner) ]    |   |                           |
|                   |   +---------------------------------------+   | 【分镜监督教学与备选方案】 |
|                   |                                               | · 为什么选本格镜头？       |
|                   |   视线流动引导线: 右上 -> 左上 -> 右下 -> 左下   | · 备选方案 A / 方案 B      |
+-------------------+-----------------------------------------------+---------------------------+
```

---

## 二、产品定位与设计原则

1. **编剧剧本一键拆解**：输入文字故事梗概或章节脚本，系统依据戏剧节拍自动拆解为合理的页数与画格。
2. **拒绝盲盒黑箱，赋能导演思维**：不仅输出画格画面，更详细解析“为什么这样选镜头”、“读者首要视觉焦点在何处”、“如何把握前后格动静衔接”，并附带 2 组对比备选镜头方案。
3. **精准细分漫画语言要素**：
   - **8 类台词音效系统**：普通对白、画外对白、旁白叙述、内心独白、深层思考、低语微声、震惊呐喊、拟声词（SFX）。
   - **6 阶景别系统**：大远景（Extreme Wide）、远景（Wide）、中景（Medium）、近景（Close-Up）、特写（Extreme Close-Up）、局部细节（Detail）。
   - **6 种视角构图**：平视（Eye-level）、仰角（Low Angle）、俯角（High Angle）、荷式倾斜（Dutch Angle）、过肩反打（OTS）、鸟瞰（Birds-eye）。
4. **单格修改绝不覆盖全局**：对某一格微调或替换方案时，仅局部更新目标画格，其余画格上下文完好无损。
5. **双模自由切换**：无 Key 状态下全功能可用的演示模式；填入 Key 即可连接真实 AI 进行深度创作。

---

## 三、核心功能清单

- [x] **故事剧作前期分析**：梳理事件因果链、出场人物弧光、视觉展现重点（Show, Don't Tell）及翻页悬念建议。
- [x] **多格式画幅支持**：
  - **日式分页漫画 (Manga Page)**：支持自右向左（RTL）视线阅读流、跨页与翻页悬念（Page-turner Hook）、日式蜻蜓标原稿纸画框。
  - **纵向条漫 (Webtoon)**：自上而下单列纵向流动，适配移动端阅读习惯。
- [x] **可视化画布与交互排版**：支持自由加格、删格、画格上下移动、版式模版一键切换（顶部重点、经典四格、动态斜切、宽画幅电影感等）。
- [x] **漫画格微调与局部重绘指导**：针对单格输入导演意图（如“改为特写，增强雷电光影”），AI 局部重构镜头设计。
- [x] **总编连贯性与轴线审查**：由 AI 模拟“漫画总监”，自动检测 180 度视线轴线违背（跳轴穿帮）、连续同景别单调、节奏拖沓等潜在失误。
- [x] **撤销与重做堆栈 (Undo/Redo)**：支持 30 步历史记录无损回退。
- [x] **本地持久化与数据备份**：
  - 自动实时保存至浏览器 `localStorage`，刷新不丢失。
  - 支持导出与导入完整工程 JSON 文件。
  - 支持一键导出排版规范的 Markdown 分镜脚本。

---

## 四、技术栈与项目架构

```text
mangaflow/
├── .github/
│   ├── workflows/ci.yml           # GitHub Actions 持续集成自动化工作流
│   ├── ISSUE_TEMPLATE/            # 缺陷反馈与功能建议 Issue 模板
│   └── pull_request_template.md   # Pull Request 合并规范模板
├── src/
│   ├── app/                       # Next.js 14 App Router 页面与 API 路由
│   │   ├── api/ai/                # 服务端 AI 请求代理（安全隔离密钥）
│   │   │   ├── analyze/           # 剧情因果链与节拍分析
│   │   │   ├── check/             # 分镜连贯性与跳轴审查
│   │   │   ├── config/            # 接口配置安全状态探测
│   │   │   ├── page/              # 单页分镜重构接口
│   │   │   ├── regenerate/        # 单格分镜微调接口
│   │   │   └── storyboard/        # 全篇分页分镜生成接口
│   │   ├── layout.tsx             # 全局页面骨架与元数据
│   │   └── page.tsx               # 漫画分镜工作台主页面
│   ├── components/                # 模块化 UI 组件
│   │   ├── canvas/                # 漫画原稿画布与画格线框渲染
│   │   ├── inspector/             # 右侧分镜导演检查器与教学解析
│   │   ├── layout/                # 顶部导航栏与侧边栏
│   │   └── modals/                # 新建项目/导出/连贯性审查/设置弹窗
│   ├── data/                      # 内置高质量经典演示故事工程
│   ├── lib/
│   │   ├── ai/                    # 服务端 LLM 客户端与演示生成算法引擎
│   │   ├── store/                 # StoryboardContext 状态管理与历史栈
│   │   └── utils/                 # 漫画术语字典与排版计算
│   └── types/                     # TypeScript 类型定义与 Zod 校验 Schema
├── tests/                         # 单元与集成自动化测试套件
├── .env.example                   # 环境变量配置说明模板
├── CONTRIBUTING.md                # 开发者贡献与代码规范指南
├── LICENSE                        # MIT 开源许可证
├── package.json                   # 项目依赖与开发脚本
└── SECURITY.md                    # 安全边界与漏洞披露政策
```

---

## 五、系统环境要求

| 环境项 | 最低要求 | 推荐版本 |
| :--- | :--- | :--- |
| **Node.js** | `>= 18.17.0` | `20.x LTS` 或 `22.x` |
| **包管理器** | `npm 9.x+` | `npm 10.x+` |
| **浏览器** | 支持现代 ES2020 的浏览器 | Google Chrome, Edge, Safari, Firefox |
| **外部网络** | 演示模式无需外网 | 仅在调用远程 AI 时需访问配置的 API 端点 |

---

## 六、安装与本地启动步骤

### 1. Windows 环境

> **提示**：如果您的 Windows PowerShell 提示脚本执行受限（`PSSecurityException`），可在命令行前加 `cmd /c` 执行，或以管理员身份运行 `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`。

```powershell
# 1. 克隆代码仓库
git clone https://github.com/a1593572580qwe-star/mangaflow.git
cd mangaflow

# 2. 安装依赖（根据 package-lock.json 干净安装）
npm ci

# 3. 复制环境变量文件（可选，未配置将自动启用演示模式）
copy .env.example .env.local

# 4. 启动开发服务器
npm run dev
```

在浏览器中访问 [http://localhost:3000](http://localhost:3000) 即可开始创作。

---

### 2. macOS / Linux 环境

```bash
# 1. 克隆代码仓库
git clone https://github.com/a1593572580qwe-star/mangaflow.git
cd mangaflow

# 2. 依赖安装
npm ci

# 3. 复制环境变量
cp .env.example .env.local

# 4. 启动开发服务器
npm run dev
```

---

## 七、生产构建与自托管运行

### 1. 本地 Node.js 生产环境构建

```bash
# 执行生产优化打包
npm run build

# 启动生产服务（监听 3000 端口）
npm run start
```

### 2. 在线部署平台支持

本项目采用 Next.js App Router 混合架构，包含服务端 API Route 代理：
- **Vercel（推荐）**：一键导入 GitHub 仓库，在 Project Settings -> Environment Variables 中填入 `STORYBOARD_BASE_URL`、`STORYBOARD_API_KEY`、`STORYBOARD_MODEL`，点击 Deploy 即可。
- **Docker / 独立 Node 服务器**：可使用标准 Node.js 镜像部署，暴露 3000 端口，并挂载环境变量。
- **静态部署说明**：请勿在 `next.config.mjs` 中盲目启用 `output: 'export'`，否则会导致服务端 AI 代理接口失效。如需纯静态免后端运行，系统前端已支持免后端直接读取内置演示数据。

---

## 八、AI API 配置教程

MangaFlow 支持任何符合 **OpenAI 兼容协议** 的大语言模型服务，无需专用适配器。

### 方式一：服务端环境变量（推荐团队与服务器部署）

在项目根目录下创建 `.env.local` 文件：

```bash
# OpenAI 官方
STORYBOARD_BASE_URL=https://api.openai.com/v1
STORYBOARD_API_KEY=sk-your-openai-key-here
STORYBOARD_MODEL=gpt-4o-mini

# 或 DeepSeek（高性价比推荐）
# STORYBOARD_BASE_URL=https://api.deepseek.com
# STORYBOARD_API_KEY=sk-your-deepseek-key-here
# STORYBOARD_MODEL=deepseek-chat

# 或 阿里云通义千问
# STORYBOARD_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
# STORYBOARD_API_KEY=sk-your-qwen-key-here
# STORYBOARD_MODEL=qwen-turbo

# 或 本地 Ollama
# STORYBOARD_BASE_URL=http://localhost:11434/v1
# STORYBOARD_API_KEY=ollama
# STORYBOARD_MODEL=llama3.1
```

### 方式二：界面右上角设置（适合个人用户直接体验）

1. 点击主界面右上角导航栏的 **设置 (⚙️)** 按钮。
2. 在弹出窗口中填入对应的 `API Base URL`、`API Key` 与 `Model`。
3. 点击 **测试连接**，系统将在服务端发起轻量鉴权探测，并即时提示连接结果。
4. 点击 **保存配置**，配置将安全保存在您当前浏览器的本地存储中。

---

## 九、演示模式与真实 AI 模式对比

| 对比维度 | 内置演示模式 (Demo Mode) | 真实 AI 模式 (Online AI) |
| :--- | :--- | :--- |
| **网络与密钥要求** | **完全无需网络、无需 API Key** | 需要有效 API Key 与网络连接 |
| **触发条件** | 未填写 `STORYBOARD_API_KEY` 时的默认行为 | 配置了有效 Key 并通过鉴权 |
| **生成逻辑** | 基于漫画镜头语法规则库的确定性算法 | 大语言模型理解故事文本并即时推导 |
| **使用成本** | **完全免费** | 按各模型提供商标准消耗 Token |
| **功能完整性** | 前期分析、分镜生成、单格微调、审查全可用 | 全功能完全一致，内容高度定制化 |
| **提示标识** | 界面顶部与卡片均有明显的“演示模式”标注 | 标识当前正在调用的模型名称 |

---

## 十、基本使用工作流教程

1. **新建故事企划**：点击左上角【新建企划】，输入故事标题、舞台背景、剧情梗概，并添加 1~2 位主要角色。
2. **前期剧情分析**：点击顶部【剧作前期分析】，AI 将为您拆解因果链、主角情感弧光与翻页钩子建议。
3. **生成全篇分镜**：确认分析后点击【一键生成分镜】，系统将根据设定的目标页数自动生成完整的日式/条漫分页画格。
4. **画布浏览与布局调整**：
   - 点击顶部切换【日式分页】或【纵向条漫】视图。
   - 点击【视线流向】查看读者浏览视线轨迹。
   - 在左侧页面列表中可自由调整页面版式（如改设顶部重点大格、四格匀称等）。
5. **画格微调与教学研读**：
   - 点击画布上的任意漫画格，右侧检查器将展示该格的景别、构图理由与作画描述。
   - 查看底部的 2 种【备选镜头方案】，可一键替换。
   - 在【单格微调】输入框输入新的要求（例如“改成从主角背后过肩拍摄”），局部重构该格。
6. **总监连贯性审查**：完成分镜后，点击【连贯性审查】，检查是否存在跳轴、连续同景别或节奏失衡问题。
7. **导出交付**：点击【导出】，可复制或下载 Markdown 格式的完整分镜剧本，或导出 JSON 工程文件作为备份。

---

## 十一、自动化测试与代码规范

本项目配备了完整的自动化测试与类型检查流程：

```bash
# 运行自动化测试套件（覆盖数据校验、模拟引擎、单格隔离、API Route、持久化）
npm test

# 运行 TypeScript 静态类型检查
npm run typecheck

# 运行 ESLint 代码规范检查
npm run lint

# 生产环境打包验证
npm run build
```

---

## 十二、常见问题与排障指南

### Q1: 运行 `npm` 命令报错 `PSSecurityException` 或无法加载脚本？
**解答**：这是 Windows PowerShell 的默认执行策略限制。可在终端前缀 `cmd /c` 执行，例如 `cmd /c "npm test"`；或执行 `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` 解除限制。

### Q2: 为什么没有填 Key 也能生成分镜？是不是假功能？
**解答**：不是假功能。MangaFlow 专门内置了符合日本漫画经典镜头规则的**离线演示引擎**，当检测到未配置 Key 时会自动启动该引擎，以便开发者与用户无需支付 Token 即可完整验证所有编辑操作。

### Q3: 为什么大模型有时候输出的分镜结构报错？
**解答**：我们使用 Zod 3 对模型返回的所有 JSON 结构实施了严格校验。若大模型偶尔输出不完整的格式，系统的 `extractJsonFromText` 会自动剥离外围杂质并尝试反解；若仍不符合要求，将明确返回错误信息，绝不吞掉异常。建议使用具备优秀结构化 JSON 能力的模型（如 `gpt-4o-mini`, `gpt-4o`, `deepseek-chat`）。

### Q4: 如何在多台电脑间同步我的分镜项目？
**解答**：点击顶部【导出】按钮，选择【导出 JSON 工程文件】。在另一台电脑上打开 MangaFlow，点击【导入 JSON】即可无损恢复全部页面与画格。

---

## 十三、数据保存方式与隐私安全说明

1. **客户端数据隐私**：您的故事内容、人物设定与修改记录均保存在浏览器的 `localStorage` 中，绝不上传至未经您授权的第三方服务器。
2. **密钥安全隔离**：服务端的 `STORYBOARD_API_KEY` 仅在 Node.js 服务端路由内读取，不会通过任何接口向前端暴露。
3. **外部 AI 数据边界**：只有在用户主动触发 AI 功能时，故事上下文才会经由本项目服务端代理转发给用户指定的 API 端点。

---

## 十四、开源许可证与贡献指南

本项目采用 [MIT 许可证](LICENSE) 开源。

欢迎查阅 [CONTRIBUTING.md](CONTRIBUTING.md) 了解代码提交规范、测试要求与贡献指引。

---

## 十五、已知限制与后续开发计划

### 当前版本已知限制
- 目前暂未内置图像扩散生成（Diffusion/SD/Midjourney）直接生图功能，聚焦于**分镜导演、画面构图设计与绘制者指南**。
- 本地浏览器 `localStorage` 受浏览器容量限制（通常为 5MB~10MB），特大长篇工程建议定期导出 JSON 备份。

### 后续路线图 (Roadmap)
- [ ] 导出标准分页 PDF / 打印排版格式（A4/B5 带切角出血位）。
- [ ] 基于 IndexedDB 升级底层持久化存储，支持超大长篇连载分镜管理。
- [ ] 接入图像生成 API（如 Stable Diffusion / DALL-E / ComfyUI），实现分镜草图一键可视化草稿渲染。
- [ ] 多角色人设参考图（Character Sheet）与服装卡片绑定。
