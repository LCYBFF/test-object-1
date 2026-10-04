# syntax=docker/dockerfile:1

FROM node:22-slim AS base
# Docker 构建没有 TTY，pnpm 需要 CI=true 才会在非交互环境下删除 node_modules（pnpm prune --prod）
ENV CI=true
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# 只拷贝清单与根配置，让依赖层可被缓存复用
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY packages/db/package.json packages/db/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# 在构建阶段完成 tsdown 打包，并裁剪生产依赖
FROM deps AS build
COPY packages/db packages/db
COPY apps/api apps/api
RUN pnpm --filter @resume/api build && pnpm prune --prod

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/drizzle ./apps/api/drizzle
EXPOSE 3001
# 先执行数据库迁移与 seed（dist 产物自带逻辑与 SQL），再启动 API；seed 仅在库为空时灌入
CMD ["sh", "-c", "node apps/api/dist/migrate.mjs && node apps/api/dist/seed.mjs && node apps/api/dist/index.mjs"]