import cors from "@fastify/cors";
import Fastify from "fastify";
import { healthRoutes } from "./routes/health";
import { resumeRoutes } from "./routes/resume";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  await app.register(healthRoutes);
  await app.register(resumeRoutes);

  return app;
}