import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./client";

const here = dirname(fileURLToPath(import.meta.url));
const migrationsFolder = resolve(here, "../drizzle");

console.log(`[db] running migrations from ${migrationsFolder}`);

await migrate(db, { migrationsFolder });
await pool.end();

console.log("[db] migrations complete");