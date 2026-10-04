// tsup 基于 esbuild 的封装，负责把 API 与 packages/db 的 TS 源码打包成自包含产物。
// 运行时 npm 依赖（fastify 等）默认按 package.json dependencies 自动 external；
// @resume/db 是 workspace 内的 TS 源码包，必须 noExternal 打进产物，否则运行时 node 无法加载 TS。
import { cpSync } from "node:fs";
import { defineConfig } from "tsup";

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
  treeshake: true,
  sourcemap: false,
  // 每个入口自包含单文件，不产出共享 chunk（服务器部署只需 dist 里的 mjs）
  splitting: false,
  external: ["fastify", "@fastify/cors", "dotenv", "drizzle-orm", "pg"],
  noExternal: ["@resume/db"],
  // pm2 / Dockerfile 引用 dist/index.mjs、dist/migrate.mjs、dist/seed.mjs，保持 .mjs 命名
  outExtension: () => ({ js: ".mjs" }),
  async onSuccess() {
    // migrate.mjs 位于 dist/，按 relative "drizzle" 到上一级读取，故拷到 apps/api/drizzle
    cpSync("../../packages/db/drizzle", "drizzle", { recursive: true });
  },
});
