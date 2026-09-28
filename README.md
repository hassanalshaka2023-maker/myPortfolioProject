# Hassan Alsheikha — Portfolio

Bilingual (English / Arabic) developer portfolio with an admin dashboard.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · Motion · Prisma 7 + Supabase Postgres · Supabase Storage · Auth.js · next-intl · Zod + React Hook Form · Resend

## Quick start

```bash
npm install
cp .env.example .env        # fill in the values (see below)
npm run db:migrate          # creates the tables (or: npm run db:apply — see below)
npm run db:seed             # admin user + existing portfolio content + storage bucket
npm run dev                 # http://localhost:3000
```

### If port 5432 is blocked on your network

`prisma migrate` needs the session pooler (port 5432). If it fails with `P1001`, use the transaction pooler instead:

```bash
npm run db:diff -- <migration_name>   # generate migration SQL offline from schema changes
npm run db:apply                      # apply pending migrations over DATABASE_URL (port 6543)
```

Both write to the standard `_prisma_migrations` table, so `prisma migrate deploy` elsewhere stays in sync.

The design-system reference lives at `/styleguide` (development only).

## Environment variables

See [`.env.example`](.env.example) — every variable is documented there.

| Variable | Where to get it |
| --- | --- |
| `DATABASE_URL` | Supabase → Project Settings → Database → Transaction pooler (port 6543) |
| `DIRECT_URL` | Same page → Session pooler (port 5432) — used for migrations |
| `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `AUTH_SECRET` | `npx auth secret` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Your choice — used by the seed script |
| `RESEND_API_KEY` (optional) | resend.com — email notifications for contact messages |

## Project structure

```
prisma/              schema + seed
messages/            en.json / ar.json UI strings
src/app/[locale]/    public site and dashboard routes
src/components/      ui/ (primitives) · sections/ · dashboard/ · effects/
src/i18n/            next-intl routing and request config
src/lib/             db client, env validation, helpers
src/server/          server actions and services (storage, email, rate-limit)
_legacy/             the original Vite version, kept for reference
```

Deployment steps (Vercel) are added in phase 6.
