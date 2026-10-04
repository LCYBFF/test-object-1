import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/** 个人基本信息（单页简历主体，通常只有一行） */
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 120 }).notNull(),
  headline: varchar("headline", { length: 200 }).notNull(),
  summary: text("summary").notNull(),
  email: varchar("email", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  location: varchar("location", { length: 120 }),
  website: varchar("website", { length: 200 }),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
});

/** 技能标签及熟练度（0-100，用于前端进度条） */
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 80 }).notNull(),
  category: varchar("category", { length: 80 }).notNull().default("通用"),
  level: integer("level").notNull().default(60),
  sortOrder: integer("sort_order").notNull().default(0),
});

/** 工作经历 */
export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  company: varchar("company", { length: 160 }).notNull(),
  role: varchar("role", { length: 160 }).notNull(),
  location: varchar("location", { length: 120 }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  current: boolean("current").notNull().default(false),
  description: text("description").notNull().default(""),
  highlights: jsonb("highlights").$type<string[]>().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
});

/** 教育经历 */
export const education = pgTable("education", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  school: varchar("school", { length: 160 }).notNull(),
  degree: varchar("degree", { length: 120 }).notNull(),
  field: varchar("field", { length: 160 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  description: text("description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

/** 项目经历 */
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(),
  role: varchar("role", { length: 160 }),
  url: varchar("url", { length: 240 }),
  description: text("description").notNull().default(""),
  tech: jsonb("tech").$type<string[]>().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
});

/** 社交链接 */
export const socialLinks = pgTable("social_links", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 80 }).notNull(),
  url: varchar("url", { length: 240 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type Profile = typeof profiles.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type Experience = typeof experiences.$inferSelect;
export type Education = typeof education.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type SocialLink = typeof socialLinks.$inferSelect;