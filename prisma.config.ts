import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // The CLI (migrate, db push, studio) uses the direct connection; the app runtime uses the
  // pooled DATABASE_URL via the pg adapter (src/lib/db.ts). Read with a fallback so that
  // `prisma generate` (postinstall, CI) works without any database configured.
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
