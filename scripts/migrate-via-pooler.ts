/**
 * Applies pending Prisma migrations through the Supabase *transaction pooler* (DATABASE_URL, port 6543).
 *
 * Why: some networks block the session pooler / direct port 5432, which `prisma migrate` needs.
 * This script runs each pending `prisma/migrations/<name>/migration.sql` in a transaction and records it in
 * `_prisma_migrations` exactly like Prisma does, so `prisma migrate deploy` (e.g. on Vercel) stays in sync.
 *
 * Workflow when you change the schema on such a network:
 *   npm run db:diff -- <migration_name>   # writes a new migration.sql from the schema diff
 *   npm run db:apply                      # applies it with this script
 */
import "dotenv/config";
import { createHash, randomUUID } from "node:crypto";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { Client } from "pg";

const MIGRATIONS_DIR = path.join(process.cwd(), "prisma", "migrations");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const client = new Client({ connectionString: url, connectionTimeoutMillis: 60_000 });
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id" VARCHAR(36) PRIMARY KEY NOT NULL,
        "checksum" VARCHAR(64) NOT NULL,
        "finished_at" TIMESTAMPTZ,
        "migration_name" VARCHAR(255) NOT NULL,
        "logs" TEXT,
        "rolled_back_at" TIMESTAMPTZ,
        "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0
      )`);

    const { rows } = await client.query<{ migration_name: string }>(
      `SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL`,
    );
    const applied = new Set(rows.map((r) => r.migration_name));

    const pending = readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(path.join(MIGRATIONS_DIR, d.name, "migration.sql")))
      .map((d) => d.name)
      .sort()
      .filter((name) => !applied.has(name));

    if (pending.length === 0) {
      console.log("✓ Database is up to date.");
      return;
    }

    for (const name of pending) {
      const sql = readFileSync(path.join(MIGRATIONS_DIR, name, "migration.sql"), "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");
      process.stdout.write(`→ ${name} … `);
      // Single simple-query round trip keeps the whole transaction on one pooled backend.
      await client.query(
        `BEGIN;\n${sql}\n;INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, applied_steps_count)
         VALUES ('${randomUUID()}', '${checksum}', now(), '${name.replace(/'/g, "''")}', 1);\nCOMMIT;`,
      );
      console.log("done");
    }
    console.log(`✓ Applied ${pending.length} migration(s).`);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
