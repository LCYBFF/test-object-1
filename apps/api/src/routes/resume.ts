import { asc, eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import {
  db,
  education,
  experiences,
  profiles,
  projects,
  skills,
  socialLinks,
} from "@resume/db";

async function findProfile() {
  const [profile] = await db
    .select()
    .from(profiles)
    .orderBy(asc(profiles.id))
    .limit(1);
  return profile ?? null;
}

export const resumeRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/profile", async (_request, reply) => {
    const profile = await findProfile();
    if (!profile) {
      return reply.code(404).send({ message: "profile not found" });
    }
    return profile;
  });

  app.get("/api/resume", async () => {
    const profile = await findProfile();
    if (!profile) {
      return {
        profile: null,
        skills: [],
        experiences: [],
        education: [],
        projects: [],
        socialLinks: [],
      };
    }

    const profileId = profile.id;
    const [skillRows, experienceRows, educationRows, projectRows, socialRows] =
      await Promise.all([
        db.select().from(skills).where(eq(skills.profileId, profileId)).orderBy(asc(skills.sortOrder)),
        db.select().from(experiences).where(eq(experiences.profileId, profileId)).orderBy(asc(experiences.sortOrder)),
        db.select().from(education).where(eq(education.profileId, profileId)).orderBy(asc(education.sortOrder)),
        db.select().from(projects).where(eq(projects.profileId, profileId)).orderBy(asc(projects.sortOrder)),
        db.select().from(socialLinks).where(eq(socialLinks.profileId, profileId)).orderBy(asc(socialLinks.sortOrder)),
      ]);

    return {
      profile,
      skills: skillRows,
      experiences: experienceRows,
      education: educationRows,
      projects: projectRows,
      socialLinks: socialRows,
    };
  });
};