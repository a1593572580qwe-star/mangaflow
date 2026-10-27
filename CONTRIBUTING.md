# 贡献指南 (Contributing Guide)

感谢你关注并有意为 **MangaFlow 漫画分镜工坊** 贡献力量！我们欢迎各种形式的贡献，包括缺陷修复、功能建议、分镜演出算法优化、文档完善以及剧作教学模版设计。

---

## 一、开发前准备

### 1. 环境要求

- **Node.js**：`>= 18.17.0`（推荐使用 Node.js 20 LTS 或 Node.js 22+）
- **包管理器**：`npm`（随 Node.js 一同安装）
- **操作系统**：Windows、macOS 或 Linux

### 2. 克隆与安装依赖

```bash
# 克隆仓库
git clone https://github.com/a1593572580qwe-star/mangaflow.git
cd mangaflow

# 使用锁文件进行干净安装（推荐）
npm ci
# 或
npm install
```

### 3. 环境配置

```bash
# 复制环境变量模板
cp .env.example .env.local
```

若暂无 API 密钥，可保持 `.env.local` 中的 `STORYBOARD_API_KEY` 为空，系统会自动以完整的**免 Key 演示模式**启动，所有核心分镜、排版与编辑功能均可直接使用。

---

## 二、本地开发与验证

### 常用命令清单

| 命令 | 用途 | 说明 |
| :--- | :--- | :--- |
| `npm run dev` | 启动本地开发服务器 | 打开 [http://localhost:3000](http://localhost:3000) 即可实时热重载开发 |
| `npm run lint` | ESLint 代码规范检查 | 检查 React、Next.js 规范和代码异味 |
| `npm run typecheck` | TypeScript 静态类型检查 | `tsc --noEmit`，确保无类型错误 |
| `npm test` | 运行自动化单元与集成测试 | 覆盖核心分镜逻辑、Zod 校验、API Route 与导出恢复 |
| `npm run build` | Next.js 生产环境构建 | 验证静态路由与服务端 API Route 是否能顺利构建 |
| `npm run start` | 启动生产环境服务 | 验证构建产物的实际运行效果 |

---

## 三、提交 Pull Request 的规范与要求

### 1. 提交前自查清单

在提交 PR 之前，请务必在本地依次执行以下三项检查，确保全部通过：

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

### 2. 分支命名与 Commit 格式

推荐采用语义化分支命名与约定式提交（Conventional Commits）：

- **分支命名**：
  - 功能开发：`feat/short-description`
  - 缺陷修复：`fix/issue-description`
  - 文档改进：`docs/update-readme`
- **Commit 格式**：
  - `feat: 增加分格间白与人物剪影透视比例微调`
  - `fix: 修复纵向条漫模式下拟声词排版越界问题`
  - `docs: 补充自托管 Dockerfile 与环境变量说明`
  - `test: 增加镜头切换连贯性边界测试用例`

### 3. 严格安全规则

- **绝不提交私有凭据**：严禁将任何真实的 `STORYBOARD_API_KEY`、访问令牌或个人敏感数据写入代码、测试用例或 Git 历史。
- **保护用户隐私**：所有的 AI 请求必须经过 Next.js 服务端路由代理，不得绕过服务端直接从浏览器向第三方大模型暴露用户私钥。

---

## 四、问题反馈与功能建议

如果你发现了 Bug 或有新功能设想，请查阅现有的 [Issues](https://github.com/a1593572580qwe-star/mangaflow/issues) 是否已有讨论。若没有，请使用我们提供的 [Issue 模板](.github/ISSUE_TEMPLATE/) 提交工单。
