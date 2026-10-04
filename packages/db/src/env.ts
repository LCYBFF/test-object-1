import "dotenv/config";

export const databaseUrl =
  process.env.DATABASE_URL ?? "postgres://root:root@localhost:5432/resume";