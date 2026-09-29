// Creates prisma/migrations/<timestamp>_<name>/migration.sql from the difference between
// prisma/schema.snapshot.prisma (the schema as of the last migration) and prisma/schema.prisma —
// without connecting to any database. Then refreshes the snapshot.
// Usage: npm run db:diff -- add_something      → then: npm run db:apply (or deploy to Vercel)
import { execSync } from "node:child_process";
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";

const SNAPSHOT = "prisma/schema.snapshot.prisma";
const SCHEMA = "prisma/schema.prisma";

const name = (process.argv[2] ?? "").replace(/[^a-z0-9_]/gi, "_").toLowerCase();
if (!name) {
  console.error("Usage: npm run db:diff -- <migration_name>");
  process.exit(1);
}

const sql = execSync(`npx prisma migrate diff --from-schema ${SNAPSHOT} --to-schema ${SCHEMA} --script`, {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"],
});
if (!sql.trim() || /This is an empty migration/.test(sql)) {
  console.log("No schema changes detected.");
  process.exit(0);
}

const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
const dir = `prisma/migrations/${stamp}_${name}`;
mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/migration.sql`, sql);
copyFileSync(SCHEMA, SNAPSHOT);
console.log(`✓ Created ${dir}/migration.sql — review it, then run: npm run db:apply`);
