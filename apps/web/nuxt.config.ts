export default defineNuxtConfig({
  compatibilityDate: "2026-10-04",
  devtools: { enabled: false },

  runtimeConfig: {
    public: {
      // 浏览器/SSR 访问 API 的地址，容器内可用 NUXT_PUBLIC_API_BASE 覆盖
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3001",
    },
  },

  css: ["~/assets/css/main.css"],

  app: {
    head: {
      htmlAttrs: { lang: "zh-CN" },
      title: "个人简历",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "个人简历单页 — pnpm monorepo + Fastify + Nuxt + Drizzle ORM + PostgreSQL",
        },
      ],
    },
  },
});