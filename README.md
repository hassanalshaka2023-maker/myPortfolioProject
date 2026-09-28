# Hassan Alsheikha — Portfolio

Bilingual (English / Arabic) developer portfolio with an admin dashboard.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · Motion · Prisma 7 + Supabase Postgres · Supabase Storage · Auth.js · next-intl · Zod + React Hook Form · Resend

## Quick start

```bash
npm install
cp .env.example .env        # fill in the values (see below)
npm run db:migrate          # creates the tables
npm run db:seed             # admin user + existing portfolio content + storage bucket
npm run dev                 # http://localhost:3000
```

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
