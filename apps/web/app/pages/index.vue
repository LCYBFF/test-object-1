<script setup lang="ts">
import { emptyResume, type ResumePayload, type Skill } from "~/types/resume";

const config = useRuntimeConfig();

const { data } = await useAsyncData<ResumePayload>(
  "resume",
  async () => {
    try {
      return await $fetch<ResumePayload>(`${config.public.apiBase}/api/resume`);
    } catch (error) {
      console.error("[web] 获取简历数据失败：", error);
      return emptyResume();
    }
  },
  { default: () => emptyResume() },
);

const resume = computed<ResumePayload>(() => data.value ?? emptyResume());
const profile = computed(() => resume.value.profile);
const initials = computed(() => profile.value?.fullName.slice(0, 1) ?? "简");

const contacts = computed(() => {
  const person = profile.value;
  if (!person) return [];

  const items: { label: string; value: string; href?: string }[] = [];
  items.push({ label: "邮箱", value: person.email, href: `mailto:${person.email}` });
  if (person.phone) items.push({ label: "电话", value: person.phone, href: `tel:${person.phone}` });
  if (person.location) items.push({ label: "城市", value: person.location });
  if (person.website) {
    items.push({
      label: "网站",
      value: person.website.replace(/^https?:\/\//, ""),
      href: person.website,
    });
  }
  return items;
});

const groupedSkills = computed(() => {
  const groups = new Map<string, Skill[]>();
  for (const skill of resume.value.skills) {
    const list = groups.get(skill.category);
    if (list) list.push(skill);
    else groups.set(skill.category, [skill]);
  }
  return [...groups.entries()].map(([category, items]) => ({ category, items }));
});

function formatMonth(value: string | null): string {
  if (!value) return "";
  const [year, month] = value.split("-");
  return `${year}.${month}`;
}

function formatRange(start: string | null, end: string | null, current: boolean): string {
  const from = formatMonth(start) || "—";
  const to = current || !end ? "至今" : formatMonth(end);
  return `${from} — ${to}`;
}

useHead(() => ({
  title: profile.value ? `${profile.value.fullName} · 个人简历` : "个人简历",
}));
</script>

<template>
  <main class="page">
    <div class="shell">
      <header class="hero">
        <div class="avatar" aria-hidden="true">{{ initials }}</div>
        <div class="hero-main">
          <h1>{{ profile?.fullName ?? "暂无简历数据" }}</h1>
          <p class="headline">{{ profile?.headline ?? "请先运行 pnpm db:seed 写入示例数据" }}</p>
          <ul v-if="contacts.length" class="contacts">
            <li v-for="item in contacts" :key="item.label">
              <span class="contact-label">{{ item.label }}</span>
              <a v-if="item.href" :href="item.href" class="contact-value">{{ item.value }}</a>
              <span v-else class="contact-value">{{ item.value }}</span>
            </li>
          </ul>
        </div>
        <ul v-if="resume.socialLinks.length" class="socials">
          <li v-for="link in resume.socialLinks" :key="link.id">
            <a :href="link.url" target="_blank" rel="noopener">{{ link.label }}</a>
          </li>
        </ul>
      </header>

      <div class="grid">
        <div class="col-main">
          <section v-if="profile?.summary" class="card">
            <h2>个人简介</h2>
            <p class="summary">{{ profile.summary }}</p>
          </section>

          <section v-if="resume.experiences.length" class="card">
            <h2>工作经历</h2>
            <ol class="timeline">
              <li v-for="item in resume.experiences" :key="item.id">
                <div class="row">
                  <h3>{{ item.role }}<span class="at">@ {{ item.company }}</span></h3>
                  <span class="period">{{ formatRange(item.startDate, item.endDate, item.current) }}</span>
                </div>
                <p v-if="item.location" class="muted">{{ item.location }}</p>
                <p v-if="item.description">{{ item.description }}</p>
                <ul v-if="item.highlights.length" class="bullets">
                  <li v-for="(highlight, index) in item.highlights" :key="index">{{ highlight }}</li>
                </ul>
              </li>
            </ol>
          </section>

          <section v-if="resume.projects.length" class="card">
            <h2>项目经历</h2>
            <div class="projects">
              <article v-for="project in resume.projects" :key="project.id" class="project">
                <div class="row">
                  <h3>{{ project.name }}</h3>
                  <span v-if="project.role" class="period">{{ project.role }}</span>
                </div>
                <p v-if="project.description">{{ project.description }}</p>
                <ul v-if="project.tech.length" class="tags">
                  <li v-for="tech in project.tech" :key="tech">{{ tech }}</li>
                </ul>
                <a
                  v-if="project.url"
                  :href="project.url"
                  class="link"
                  target="_blank"
                  rel="noopener"
                >查看项目 →</a>
              </article>
            </div>
          </section>
        </div>

        <aside class="col-side">
          <section v-if="groupedSkills.length" class="card">
            <h2>技能</h2>
            <div v-for="group in groupedSkills" :key="group.category" class="skill-group">
              <h3 class="skill-category">{{ group.category }}</h3>
              <div v-for="skill in group.items" :key="skill.id" class="skill">
                <div class="skill-label">
                  <span>{{ skill.name }}</span>
                  <span class="muted">{{ skill.level }}%</span>
                </div>
                <div class="bar">
                  <span :style="{ width: `${skill.level}%` }" />
                </div>
              </div>
            </div>
          </section>

          <section v-if="resume.education.length" class="card">
            <h2>教育经历</h2>
            <ol class="edu">
              <li v-for="item in resume.education" :key="item.id">
                <h3>{{ item.school }}</h3>
                <p class="muted">
                  {{ item.degree }}<template v-if="item.field"> · {{ item.field }}</template>
                </p>
                <p class="muted period">{{ formatRange(item.startDate, item.endDate, false) }}</p>
                <p v-if="item.description">{{ item.description }}</p>
              </li>
            </ol>
          </section>
        </aside>
      </div>

      <footer class="foot">
        <span>{{ profile?.fullName ?? "个人简历" }} · 个人简历单页</span>
        <span>Fastify API · PostgreSQL · Drizzle ORM</span>
      </footer>
    </div>
  </main>
</template>

<style scoped>
.page {
  padding: 48px 20px 64px;
}

.shell {
  max-width: 1040px;
  margin: 0 auto;
}

/* Hero */
.hero {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px;
  background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.avatar {
  flex: 0 0 auto;
  width: 88px;
  height: 88px;
  display: grid;
  place-items: center;
  border-radius: 24px;
  background: linear-gradient(140deg, #4f46e5, #0ea5e9);
  color: #fff;
  font-size: 38px;
  font-weight: 600;
  letter-spacing: 1px;
}

.hero-main {
  flex: 1 1 auto;
  min-width: 0;
}

.hero h1 {
  margin: 0;
  font-size: 30px;
  letter-spacing: 0.5px;
}

.headline {
  margin: 6px 0 14px;
  color: var(--accent);
  font-weight: 500;
}

.contacts {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  font-size: 14px;
}

.contacts li {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}

.contact-label {
  color: var(--text-muted);
  font-size: 12px;
}

.contact-value:hover {
  color: var(--accent);
}

.socials {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 0 0 auto;
}

.socials a {
  display: inline-block;
  padding: 6px 14px;
  font-size: 13px;
  color: var(--accent);
  background: var(--accent-soft);
  border-radius: 999px;
  transition: background 0.15s ease, color 0.15s ease;
}

.socials a:hover {
  background: var(--accent);
  color: #fff;
}

/* Layout */
.grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(0, 1fr);
  gap: 20px;
  margin-top: 20px;
  align-items: start;
}

.col-main,
.col-side {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  padding: 26px 28px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.card h2 {
  margin: 0 0 18px;
  font-size: 15px;
  letter-spacing: 2px;
  color: var(--text-muted);
  font-weight: 600;
  position: relative;
  padding-left: 14px;
}

.card h2::before {
  content: "";
  position: absolute;
  left: 0;
  top: 3px;
  bottom: 3px;
  width: 4px;
  border-radius: 2px;
  background: linear-gradient(180deg, #4f46e5, #0ea5e9);
}

.summary {
  margin: 0;
  color: #334155;
}

/* Timeline */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.timeline > li {
  padding-left: 20px;
  border-left: 2px solid var(--border);
  position: relative;
}

.timeline > li::before {
  content: "";
  position: absolute;
  left: -7px;
  top: 6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--surface);
  border: 3px solid var(--accent);
}

.row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.row h3 {
  margin: 0;
  font-size: 16px;
}

.at {
  margin-left: 8px;
  color: var(--text-muted);
  font-weight: 400;
  font-size: 14px;
}

.period {
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
}

.muted {
  color: var(--text-muted);
  font-size: 13px;
}

.timeline p {
  margin: 6px 0 0;
}

.bullets {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bullets li {
  position: relative;
  padding-left: 16px;
  color: #334155;
  font-size: 14px;
}

.bullets li::before {
  content: "";
  position: absolute;
  left: 2px;
  top: 9px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #a5b4fc;
}

/* Projects */
.projects {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.project p {
  margin: 6px 0 0;
  color: #334155;
  font-size: 14px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.tags li {
  padding: 3px 10px;
  font-size: 12px;
  color: #0f766e;
  background: #ecfdf5;
  border-radius: 999px;
}

.link {
  display: inline-block;
  margin-top: 10px;
  font-size: 13px;
  color: var(--accent);
  font-weight: 500;
}

/* Skills */
.skill-group + .skill-group {
  margin-top: 16px;
}

.skill-category {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 600;
}

.skill + .skill {
  margin-top: 12px;
}

.skill-label {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 6px;
}

.bar {
  height: 8px;
  border-radius: 999px;
  background: #eef1f7;
  overflow: hidden;
}

.bar span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #6366f1, #0ea5e9);
}

/* Education */
.edu {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.edu h3 {
  margin: 0;
  font-size: 15px;
}

.edu p {
  margin: 4px 0 0;
  font-size: 13px;
}

.edu p:not(.muted) {
  color: #334155;
}

/* Footer */
.foot {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 28px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 12px;
}

/* Responsive */
@media (max-width: 860px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .socials {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

/* Print */
@media print {
  .page {
    padding: 0;
  }

  .card,
  .hero {
    box-shadow: none;
    break-inside: avoid;
  }
}
</style>