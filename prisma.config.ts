import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7 configuration: connection URLs and migrate/seed live here.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Real connection is provided at runtime via DATABASE_URL (docker-compose).
    // The builder stage sets a dummy URL just so `prisma generate` can run.
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});