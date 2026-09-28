import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7 configuration: connection URLs and migrate/seed live here.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});