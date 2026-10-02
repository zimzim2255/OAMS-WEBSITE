import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7 configuration: connection URLs and migrate/seed live here.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Fallback so `prisma generate` works during the Docker build (no .env
    // baked into the image). Runtime migrate/serve set the real DATABASE_URL.
    url: process.env.DATABASE_URL ?? "postgresql://oams:oams@localhost:5432/oams?schema=public",
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});