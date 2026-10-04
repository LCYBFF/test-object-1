import { pool } from "@resume/db";
import { buildApp } from "./app";
import { env } from "./env";

const app = await buildApp();

async function shutdown(signal: string) {
  app.log.info(`received ${signal}, shutting down`);
  await app.close();
  await pool.end();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

try {
  await app.listen({ port: env.port, host: env.host });
} catch (error) {
  app.log.error(error);
  await pool.end();
  process.exit(1);
}