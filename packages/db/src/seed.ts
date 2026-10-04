import { db, pool } from "./client";
import {
  education,
  experiences,
  profiles,
  projects,
  skills,
  socialLinks,
} from "./schema/index";

// 部署时会随迁移一起执行：默认仅在 profiles 为空（首次初始化）时灌入，
// 避免每次部署清空线上数据；本地需要重置时用 SEED_FORCE=true 强制覆盖
const force = process.env.SEED_FORCE === "true";

async function seed() {
  if (!force) {
    const [existing] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .limit(1);
    if (existing) {
      console.log("[db] profiles 已有数据，跳过 seed（如需强制重置请设置 SEED_FORCE=true）");
      return;
    }
  }

  await db.transaction(async (tx) => {
    // 清空旧数据，保证可重复执行
    await tx.delete(socialLinks);
    await tx.delete(projects);
    await tx.delete(education);
    await tx.delete(experiences);
    await tx.delete(skills);
    await tx.delete(profiles);

    const [profile] = await tx
      .insert(profiles)
      .values({
        fullName: "张明",
        headline: "全栈工程师 · Node.js / TypeScript / 云原生",
        summary:
          "6 年 Web 研发经验，专注 TypeScript 全栈与云原生架构。主导过千万级日请求的 BFF 层重构，熟悉 Node.js 性能调优、PostgreSQL 数据建模与容器化交付流程。乐于把复杂系统拆解成清晰、可维护的模块。",
        email: "zhangming@example.com",
        phone: "138-0000-0000",
        location: "中国 · 杭州",
        website: "https://example.com",
        avatarUrl: null,
      })
      .returning();

    if (!profile) throw new Error("profile insert failed");

    const profileId = profile.id;

    await tx.insert(skills).values([
      { profileId, name: "TypeScript", category: "语言", level: 92, sortOrder: 1 },
      { profileId, name: "Node.js / Fastify", category: "后端", level: 90, sortOrder: 2 },
      { profileId, name: "Vue 3 / Nuxt", category: "前端", level: 85, sortOrder: 3 },
      { profileId, name: "PostgreSQL", category: "数据库", level: 82, sortOrder: 4 },
      { profileId, name: "Docker / CI-CD", category: "工程化", level: 80, sortOrder: 5 },
      { profileId, name: "Drizzle ORM", category: "数据库", level: 78, sortOrder: 6 },
    ]);

    await tx.insert(experiences).values([
      {
        profileId,
        company: "云启科技",
        role: "高级全栈工程师",
        location: "杭州",
        startDate: "2023-04-01",
        endDate: null,
        current: true,
        description: "负责企业级 SaaS 平台的核心研发与架构演进。",
        highlights: [
          "主导 BFF 层从 Express 迁移至 Fastify，P99 延迟下降 42%",
          "搭建 pnpm monorepo 与统一 CI/CD，发布耗时由 18 分钟缩短到 6 分钟",
          "推动 PostgreSQL 慢查询治理，月度数据库成本下降 30%",
        ],
        sortOrder: 1,
      },
      {
        profileId,
        company: "智联数据",
        role: "后端工程师",
        location: "上海",
        startDate: "2021-03-01",
        endDate: "2023-03-31",
        current: false,
        description: "参与数据中台 API 与任务调度系统的设计实现。",
        highlights: [
          "设计基于 PostgreSQL 的分区表方案，支撑日均 2000 万条写入",
          "引入 Drizzle ORM 统一数据访问层，消除跨服务类型漂移",
        ],
        sortOrder: 2,
      },
      {
        profileId,
        company: "初创工作室",
        role: "前端工程师",
        location: "远程",
        startDate: "2019-07-01",
        endDate: "2021-02-28",
        current: false,
        description: "负责多个中小型项目的前端架构与交付。",
        highlights: ["沉淀组件库与脚手架，新项目启动时间由 3 天缩短至半天"],
        sortOrder: 3,
      },
    ]);

    await tx.insert(education).values([
      {
        profileId,
        school: "浙江大学",
        degree: "工学硕士",
        field: "计算机科学与技术",
        startDate: "2016-09-01",
        endDate: "2019-06-30",
        description: "研究方向：分布式系统与数据库性能优化。",
        sortOrder: 1,
      },
      {
        profileId,
        school: "武汉大学",
        degree: "工学学士",
        field: "软件工程",
        startDate: "2012-09-01",
        endDate: "2016-06-30",
        description: "连续三年获校级奖学金。",
        sortOrder: 2,
      },
    ]);

    await tx.insert(projects).values([
      {
        profileId,
        name: "Resume Monorepo",
        role: "个人项目 · 全栈",
        url: "https://github.com/example/resume-monorepo",
        description:
          "基于 pnpm monorepo 的个人简历单页应用，Fastify 提供 API、Nuxt 负责 SSR 渲染、Drizzle 管理 PostgreSQL 数据模型。",
        tech: ["TypeScript", "Fastify", "Nuxt", "Drizzle ORM", "PostgreSQL", "Docker"],
        sortOrder: 1,
      },
      {
        profileId,
        name: "统一数据访问层",
        role: "核心贡献者",
        url: null,
        description:
          "为多服务提供共享的 Schema 与类型定义，直接暴露 TS 源码，避免编译产物与类型漂移。",
        tech: ["TypeScript", "Drizzle ORM", "PostgreSQL"],
        sortOrder: 2,
      },
    ]);

    await tx.insert(socialLinks).values([
      { profileId, label: "GitHub", url: "https://github.com/example", sortOrder: 1 },
      { profileId, label: "个人博客", url: "https://blog.example.com", sortOrder: 2 },
      { profileId, label: "LinkedIn", url: "https://linkedin.com/in/example", sortOrder: 3 },
    ]);
  });

  console.log("[db] seed complete");
}

await seed();
await pool.end();