// Creates prisma/migrations/<timestamp>_<name>/migration.sql from the diff between the
// already-applied migrations and the current schema — without connecting to the database.
// Usage: npm run db:diff -- add_something
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const name = (process.argv[2] ?? "").replace(/[^a-z0-9_]/gi, "_").toLowerCase();
if (!name) {
  console.error("Usage: npm run db:diff -- <migration_name>");
  process.exit(1);
}

const sql = execSync(
  "npx prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --script",
  { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
);
if (!sql.trim() || /This is an empty migration/.test(sql)) {
  console.log("No schema changes detected.");
  process.exit(0);
}

const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
const dir = `prisma/migrations/${stamp}_${name}`;
mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/migration.sql`, sql);
console.log(`✓ Created ${dir}/migration.sql — review it, then run: npm run db:apply`);
