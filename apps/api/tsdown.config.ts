// tsdown（基于 Rolldown）负责把 API 与 packages/db 的 TS 源码打包成产物。
// 运行时 npm 依赖（fastify 等）按 package.json dependencies 默认 external；
// @resume/db 是 workspace 内的 TS 源码包，必须 alwaysBundle 打进产物，否则运行时 node 无法加载 TS。
// 构建脚本用 --config-loader tsx 加载本 TS 配置：tsdown 默认的 native 加载需要 Node 22.18+，
// 显式指定 tsx 后 Node 22 全系（含 22.13~22.17）都能构建，且 tsx 已是本包 devDependency。
import { cpSync } from "node:fs";
import { defineConfig } from "tsdown";

// 路径相对 process.cwd()：pnpm --filter @resume/api 执行时 cwd 为 apps/api
export default defineConfig({
  entry: {
    index: "src/index.ts",
    migrate: "../../packages/db/src/migrate.ts",
    seed: "../../packages/db/src/seed.ts",
  },
  outDir: "dist",
  format: "esm",
  platform: "node",
  target: "node22",
  clean: true,
  // tsdown 的代码分割无法关闭：多个入口共用的 @resume/db 会抽成 dist 下的共享 chunk，
  // 入口 mjs 以相对路径引用它，故部署时必须整体同步 dist 目录（现有流程正是如此）
  deps: {
    neverBundle: ["fastify", "@fastify/cors", "dotenv", "drizzle-orm", "pg"],
    alwaysBundle: ["@resume/db"],
  },
  // pm2 / Dockerfile 引用 dist/index.mjs、dist/migrate.mjs、dist/seed.mjs，保持 .mjs 命名
  outExtensions: () => ({ js: ".mjs" }),
  async onSuccess() {
    // migrate.mjs 位于 dist/，按 relative "drizzle" 到上一级读取，故拷到 apps/api/drizzle
    cpSync("../../packages/db/drizzle", "drizzle", { recursive: true });
  },
});