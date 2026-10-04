# Resume Monorepo

基于 **pnpm monorepo + Fastify 5 + Nuxt 4 + Drizzle ORM + PostgreSQL** 的个人简历单页应用。

- `apps/api`：Fastify 5 提供 REST API，Drizzle ORM 访问 PostgreSQL
- `apps/web`：Nuxt 4 单页简历，SSR 渲染，服务端拉取 API 数据
- `packages/db`：数据库 Schema 与迁移的唯一来源，**直接暴露 TypeScript 源码**给 API 与 drizzle-kit，避免编译产物造成的类型漂移

## 技术栈与版本

| 分类 | 依赖 | 版本 |
| --- | --- | --- |
| 包管理 | pnpm | 10.32.1（`packageManager` 固定） |
| 语言 | TypeScript | `^6.0.3` |
| 类型检查 | vue-tsc | `^3.3.12` |
| 后端 | Fastify | `^5.12.5` |
| 前端 | Nuxt / Vue | `^4.5.2` / `^3.5.43` |
| ORM | drizzle-orm / drizzle-kit | `^0.45.3` / `^0.31.11` |
| 数据库 | PostgreSQL | 17 |

所有依赖版本集中在 `pnpm-workspace.yaml` 的 `catalog:` 中声明，各子包通过 `"catalog:"` 引用，**全仓库版本一致、不再分散漂移**。

## 目录结构

```
.
├── apps/
│   ├── api/                 # Fastify 5 + Drizzle
│   │   ├── src/
│   │   │   ├── app.ts           # 组装 Fastify 实例、注册 CORS 与路由
│   │   │   ├── env.ts           # 读取 PORT / HOST / NODE_ENV
│   │   │   ├── index.ts         # 启动入口 + 优雅退出
│   │   │   └── routes/          # /health、/api/profile、/api/resume
│   │   ├── tsdown.config.ts     # 打包为 dist/index.mjs、dist/migrate.mjs
│   │   ├── ecosystem.config.cjs # 非 Docker 部署的 pm2 进程定义
│   │   └── Dockerfile
│   └── web/                 # Nuxt 4
│       ├── app/
│       │   ├── pages/index.vue      # 简历单页
│       │   ├── assets/css/main.css  # 全局样式
│       │   └── types/resume.ts      # 与 API 对齐的类型定义
│       ├── nuxt.config.ts
│       ├── ecosystem.config.cjs # 非 Docker 部署的 pm2 进程定义
│       └── Dockerfile
├── packages/
│   └── db/                  # Drizzle schema / 迁移 / 种子数据
│       ├── src/schema/      # 表结构定义（resume.ts / index.ts）
│       ├── src/client.ts    # pg Pool + drizzle 实例
│       ├── src/env.ts       # DATABASE_URL（带默认值）
│       ├── src/migrate.ts   # 迁移入口
│       ├── src/seed.ts      # 示例数据
│       └── drizzle.config.ts
├── .github/workflows/       # CI / CD（见下文）
├── docker-compose.yml
├── pnpm-workspace.yaml      # workspace + catalog（集中版本管理）
└── tsconfig.base.json       # 各子包继承的 TS 基础配置
```

## 环境变量

| 文件 | 变量 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `packages/db/.env` | `DATABASE_URL` | `postgres://root:root@localhost:5432/resume` | drizzle-kit、迁移、种子数据使用 |
| `apps/api/.env` | `DATABASE_URL` | 同上 | API 运行时连接串 |
| `apps/api/.env` | `PORT` | `3001` | API 监听端口 |
| `apps/api/.env` | `HOST` | `0.0.0.0` | API 监听地址 |
| `apps/web`（运行时） | `NUXT_PUBLIC_API_BASE` | `http://localhost:3001` | 浏览器 / SSR 访问 API 的基址，容器内用 `http://api:3001` |

复制模板即可开始：

```bash
cp packages/db/.env.example packages/db/.env
cp apps/api/.env.example apps/api/.env
```

> `.env` 已在 `.gitignore` 中忽略；`.env.example` 作为模板保留。

## 本地开发

前置：Node.js ≥ 22、pnpm 10、可用的 PostgreSQL（账号 `root`）。

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp packages/db/.env.example packages/db/.env
cp apps/api/.env.example apps/api/.env

# 3. 生成并执行迁移，写入示例数据
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 4. 启动（API: http://localhost:3001，Web: http://localhost:3000）
pnpm dev:api
pnpm dev:web
```

本地 PostgreSQL 可用 Docker 单独拉起：

```bash
docker run -d --name resume-pg \
  -e POSTGRES_USER=root -e POSTGRES_PASSWORD=root -e POSTGRES_DB=resume \
  -p 5432:5432 postgres:17-alpine
```

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 并行启动 `apps/*` 的开发服务 |
| `pnpm dev:api` / `pnpm dev:web` | 单独启动 API / Web 开发服务 |
| `pnpm build` | 构建 Nuxt 生产产物（`.output`） |
| `pnpm typecheck` | 递归执行各子包类型检查（含 vue-tsc） |
| `pnpm db:generate` | 由 Schema 生成 SQL 迁移 |
| `pnpm db:migrate` | 执行迁移 |
| `pnpm db:seed` | 写入示例简历数据 |
| `pnpm db:studio` | 打开 Drizzle Studio |
| `pnpm docker:up` / `docker:down` / `docker:logs` | Docker 编排的启动 / 停止 / 日志 |

## API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/health` | 健康检查，含数据库连通状态 |
| GET | `/api/profile` | 个人基本信息 |
| GET | `/api/resume` | 简历全量数据（基本信息 + 技能 + 经历 + 教育 + 项目 + 社交链接） |

`GET /health`：

```json
{ "status": "ok", "database": "up", "uptime": 12, "timestamp": "2026-10-04T12:00:00.000Z" }
```

`GET /api/resume`（无数据时各列表为空数组，`profile` 为 `null`）：

```json
{
  "profile": { "id": 1, "fullName": "张三", "headline": "全栈工程师", "summary": "…", "email": "…" },
  "skills": [{ "id": 1, "name": "TypeScript", "category": "语言", "level": 90, "sortOrder": 0 }],
  "experiences": [{ "id": 1, "company": "…", "role": "…", "startDate": "2022-03-01", "endDate": null, "current": true, "highlights": [] }],
  "education": [],
  "projects": [{ "id": 1, "name": "…", "tech": ["Nuxt", "Fastify"] }],
  "socialLinks": [{ "id": 1, "label": "GitHub", "url": "https://github.com/…" }]
}
```

## 数据模型

`profiles`（基本信息）、`skills`（技能）、`experiences`（工作经历）、`education`（教育经历）、`projects`（项目）、`social_links`（社交链接），各子表通过 `profile_id` 外键级联关联到 `profiles`。

| 表 | 关键字段 |
| --- | --- |
| `profiles` | `full_name`、`headline`、`summary`、`email`、`phone`、`location`、`website`、`avatar_url`、`created_at` |
| `skills` | `profile_id`、`name`、`category`、`level`(0-100)、`sort_order` |
| `experiences` | `profile_id`、`company`、`role`、`start_date`、`end_date`、`current`、`description`、`highlights`(jsonb) |
| `education` | `profile_id`、`school`、`degree`、`field`、`start_date`、`end_date`、`description` |
| `projects` | `profile_id`、`name`、`role`、`url`、`description`、`tech`(jsonb) |
| `social_links` | `profile_id`、`label`、`url`、`sort_order` |

所有列表类子表都带 `sort_order`，API 按该字段升序返回。

**改表流程**：编辑 `packages/db/src/schema/resume.ts` → `pnpm db:generate` 生成迁移 → `pnpm db:migrate` 应用。

## Docker 部署

```bash
pnpm docker:up      # 构建并启动 db / api / web
pnpm docker:logs
pnpm docker:down
```

- `db`：`postgres:17-alpine`，账号 `root` / 密码 `root` / 库名 `resume`，数据持久化到 `pgdata` 卷
- `api`：多阶段构建，容器启动时先自动执行迁移再启动服务，暴露 `3001`
- `web`：Nuxt 构建产物 `.output` 独立运行，通过 `NUXT_PUBLIC_API_BASE=http://api:3001` 在容器网络内访问 API，暴露 `3000`

访问 http://localhost:3000 查看简历页面。

## CI / CD

API 与 Web 使用**相互独立的 workflow**，各自按改动路径触发（改 API 不会跑 Web 流程，反之亦然），互不阻塞、可分别设为 required check。

| Workflow | 触发 | 做什么 |
| --- | --- | --- |
| `ci-api.yml` | `apps/api/**` 或 `packages/db/**` 等改动 | 装依赖 → `db` + `api` 类型检查 → 迁移漂移检查 → 迁移 + 种子（Postgres service）→ tsdown 打包 → 启动产物冒烟测试 `/health` |
| `ci-web.yml` | `apps/web/**` 等改动 | 装依赖 → `nuxt prepare` + `vue-tsc` 类型检查 → `nuxt build` |
| `cd-api.yml` | `apps/api/**` / `packages/db/**` 改动、`v*` tag 或手动 | 构建 API 镜像并推送 GHCR（`ghcr.io/<owner>/<repo>/api`） |
| `cd-web.yml` | `apps/web/**` 改动、`v*` tag 或手动 | 构建 Web 镜像并推送 GHCR（`ghcr.io/<owner>/<repo>/web`） |
| `deploy-api.yml` | `apps/api/**` / `packages/db/**` 改动或手动 | **不使用 Docker**：runner 上安装依赖 + tsdown 打包 + `pnpm deploy` 产出自包含目录 → `ssh-deploy`（rsync over SSH）同步 → 服务器仅 `node` 迁移 + pm2 重启 `resume-api` |
| `deploy-web.yml` | `apps/web/**` 改动或手动 | **不使用 Docker**：runner 上 `nuxt build` → 暂存产物 → `ssh-deploy`（rsync over SSH）同步 → pm2 重启 `resume-web` |

> `main` / `master` 分支均会触发；所有 workflow 都支持 `workflow_dispatch` 手动触发（可绕过路径过滤强制运行）。`ci-*.yml` 配置了 `concurrency`（同分支新推送会取消旧运行），`deploy-*.yml` 则不取消（`cancel-in-progress: false`，避免打断进行中的发布）。

### 非 Docker 部署（SSH + rsync + pm2）

`deploy-*.yml` 直接把应用跑在服务器上，用 pm2 守护进程，不依赖容器。传输与远程执行由 Marketplace 的 [`easingthemes/ssh-deploy`](https://github.com/easingthemes/ssh-deploy) 一个 action 完成——它通过 **rsync over SSH** 同步目录，并支持在同步前后执行远程脚本（`SCRIPT_AFTER`）。

**编译与依赖都发生在 runner 上**，服务器只接收产物、不做 `pnpm install` 也不跑 TS 源码：

- **API**：`pnpm --filter @resume/api build` 用 tsdown（Rolldown 封装）把 TS 源码（含 `packages/db`）打包成 `dist/index.mjs`、`dist/migrate.mjs`（运行时依赖 fastify/pg/drizzle-orm 保持 external），再 `pnpm --filter @resume/api deploy --legacy --prod deploy/api` 把包 + 生产依赖平铺成自包含目录；随后 rsync 同步
- **Web**：`nuxt build` 产出 `.output`（自带运行时依赖），暂存为 `deploy/web`（含 `ecosystem.config.cjs`）后 rsync 同步

`ARGS` 使用 `-rlgoDzvc -i --delete`：`--delete` 让远端目录与本地严格一致（清理旧产物），`EXCLUDE: ".env"` 保证服务器上的 `.env` 不被覆盖或删除。`SCRIPT_AFTER_REQUIRED: "true"` 让远程迁移/重启失败时 job 一并失败（该参数默认不生效，必须显式设置）。

需要在仓库 **Settings → Secrets and variables → Actions** 配置：

| 类型 | 名称 | 说明 |
| --- | --- | --- |
| secret | `SERVER_SSH_KEY` | SSH 私钥（**PEM 格式**，无 passphrase） |
| secret | `DEPLOY_HOST` | 服务器地址 |
| secret | `DEPLOY_USER` | SSH 用户名 |
| secret | `DEPLOY_PORT` | SSH 端口（可选，默认 22） |
| variable | `API_DEPLOY_DIR` | 服务器上 API 部署目录，如 `/opt/resume` |
| variable | `WEB_DEPLOY_DIR` | 服务器上 Web 产物目录，如 `/opt/resume-web` |

**生成 PEM 密钥对**（ssh-deploy 走 rsync，推荐 PEM 格式的 RSA 私钥）：

```bash
ssh-keygen -m PEM -t rsa -b 4096 -C "github-actions-deploy" -f deploy_key
```

- 提示 passphrase 时**直接回车留空**（rsync 无法交互输入密码短语）
- 公钥 `deploy_key.pub` 追加到服务器 `~/.ssh/authorized_keys`，私钥 `deploy_key`（首行应为 `-----BEGIN RSA PRIVATE KEY-----`）整体贴进 `SERVER_SSH_KEY`

服务器前置条件：

- Node.js 22、`pm2`（`npm i -g pm2`）与 `rsync`，且都在**非交互式 SSH 的 PATH** 中；**不需要 pnpm**
- API：`$API_DEPLOY_DIR/.env` 中配置 `DATABASE_URL`（pm2 的 `cwd` 为部署目录根，由 `dotenv` 加载）
- Web：`$WEB_DEPLOY_DIR/.env` 中配置 `NUXT_PUBLIC_API_BASE`（部署脚本会先 source 再 `pm2 --update-env`）

进程定义见 `apps/api/ecosystem.config.cjs`（`resume-api`，端口 3001，运行 `dist/index.mjs`）与 `apps/web/ecosystem.config.cjs`（`resume-web`，端口 3000）。

## 常见问题

**迁移漂移检查失败（`git diff -- packages/db/drizzle` 有输出）**
改了 Schema 却没提交生成的迁移文件。本地执行 `pnpm db:generate` 并把 `packages/db/drizzle/` 一起提交。

**`tsc` 报错找不到 `packages/db` 的类型**
`packages/db` 直接以 TS 源码形式被引用（`main`/`exports` 指向 `src/index.ts`），无需先构建；确保用仓库根目录安装依赖（`pnpm install`），让 workspace 软链生效。

**pnpm 报 store 写入失败 / corepack 报 `Cannot find module bin/pnpm.cjs`**
`.npmrc` 已把 store/state/cache 重定向到仓库内目录（`.pnpm-store` / `.pnpm-state` / `.pnpm-cache`，均已 gitignore），并设置 `package-import-method=copy`。若 corepack 版本过旧，升级 corepack（≥ 0.36）以兼容 pnpm 的新二进制布局。

**`vue-tsc` 类型检查失败**
`vue-tsc ^3.3.12` 可配合 TS 6 / TS 7；若使用更旧的 vue-tsc，请升级到 3.3.12+，或把 TypeScript 固定到 `^6.0.3`（catalog 中的当前值）。

**Web 页面拿不到数据**
确认 `NUXT_PUBLIC_API_BASE` 指向可达的 API 地址（本地 `http://localhost:3001`，容器内 `http://api:3001`），并确认数据库已完成迁移与种子写入。