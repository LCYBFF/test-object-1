import { sql } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { db } from "@resume/db";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => {
    let database = "up";
    try {
      await db.execute(sql`select 1`);
    } catch {
      database = "down";
    }

    return {
      status: "ok",
      database,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  });
};