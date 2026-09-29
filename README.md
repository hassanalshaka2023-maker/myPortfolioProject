# Hassan Alsheikha — Portfolio

Bilingual (English / Arabic, RTL) developer portfolio with a private admin dashboard for managing projects, skills, experience, services, site settings and contact messages.

**Stack:** Next.js 16 (App Router, TypeScript strict) · Tailwind CSS v4 · shadcn/ui (Radix) · Motion · Prisma 7 + Supabase Postgres · Supabase Storage · Auth.js v5 · next-intl · Zod + React Hook Form · Resend

---

## Features

**Public site** — `/` (English) and `/ar` (Arabic, RTL)

- Hero with word-by-word headline, pointer-following glow, tech marquee
- About (animated stats), Skills (grouped by category), filterable Projects grid, Roadmap (planned projects), Experience timeline, Services, Contact form
- Case-study page per project (`/projects/[slug]`): role, problem → solution → result, gallery with lightbox, next project
- Dark / light themes, `prefers-reduced-motion` respected, keyboard accessible
- SEO: per-page metadata, canonical + hreflang, JSON-LD (Person, WebSite, CreativeWork), generated Open Graph images, `sitemap.xml`, `robots.txt`, web manifest

**Dashboard** — `/dashboard` (credentials login)

- Overview: project counts by status, unread messages, recent messages, quick actions
- Projects CRUD: bilingual fields, markdown editor with preview, cover + gallery uploads, tech tags, status/category, dates, links, featured/published, drag-and-drop ordering, search/filter/pagination, duplicate
- Skills, Experience, Services: add/edit dialogs, drag-and-drop ordering
- Messages inbox: search, read/unread filter, bulk actions, reply by email
- Settings: profile, contact, social links, avatar + CV upload, section visibility, password change
- Every change revalidates the public site immediately

**Security**

- Login rate-limited per IP and per email (5 attempts / 15 min); contact form 3 messages / 10 min per IP + honeypot
- `/dashboard` guarded by the proxy, the layout and every server action
- All input validated with Zod on the server
- Supabase Data API locked out (RLS on, API roles revoked) — the app talks to Postgres only through Prisma
- Uploads go browser → Supabase Storage via one-time signed URLs; the service key never leaves the server

---

## Local development

Requirements: Node.js ≥ 20.9, a Supabase project.

```bash
npm install
cp .env.example .env        # fill in the values — see "Environment variables"
npm run db:deploy           # create the tables (see note below if port 5432 is blocked)
npm run db:seed             # admin user, starter content, storage bucket
npm run dev                 # http://localhost:3000
```

Sign in at `/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`. The design-system reference is at `/styleguide` (development only).

### If port 5432 is blocked on your network

Prisma's migration commands need the session pooler (port 5432). If they fail with `P1001`, use the transaction pooler (port 6543) instead:

```bash
npm run db:apply                      # apply pending migrations over DATABASE_URL
npm run db:diff -- <migration_name>   # after editing schema.prisma: generate the SQL offline
```

Both record migrations in the standard `_prisma_migrations` table, so `prisma migrate deploy` elsewhere (e.g. on Vercel) stays in sync.

### Scripts

| Script | What it does |
| --- | --- |
| `dev` / `build` / `start` | Next.js |
| `lint` / `typecheck` | ESLint / `tsc --noEmit` |
| `db:deploy` | Apply pending migrations (`prisma migrate deploy`) |
| `db:migrate` | Create + apply a migration in development (`prisma migrate dev`) |
| `db:apply` / `db:diff` | Pooler-based alternative to the two above |
| `db:seed` | Seed admin + content (idempotent; also resets the admin password to `ADMIN_PASSWORD`) |
| `db:studio` | Prisma Studio |
| `vercel-build` | Used automatically by Vercel: migrate, generate, build |

---

## Environment variables

Every variable is documented in [`.env.example`](.env.example).

| Variable | Required | Where to get it |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes | Public URL, e.g. `https://hassan.dev` (used for canonical URLs, sitemap, OG) |
| `DATABASE_URL` | yes | Supabase → **Connect** → ORMs → Prisma → transaction pooler (port 6543) |
| `DIRECT_URL` | yes | Same place → session pooler (port 5432), used for migrations |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Supabase → Project Settings → API Keys → **secret** key (server only) |
| `SUPABASE_STORAGE_BUCKET` | no | Defaults to `portfolio`; created by the seed script |
| `AUTH_SECRET` | yes | `npx auth secret` or `openssl rand -base64 32` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | seed only | Dashboard account created by `db:seed` (password ≥ 12 chars) |
| `RESEND_API_KEY` | no | resend.com — enables email notifications for new messages |
| `CONTACT_TO_EMAIL` | no | Where notifications go (falls back to the email in Settings) |
| `CONTACT_FROM_EMAIL` | no | Sender; must be on a domain verified in Resend (or `onboarding@resend.dev` for testing) |

---

## Deploying to Vercel

1. **Push the repo to GitHub.**
2. **Import it in Vercel** → *Add New… → Project* → select the repo. Framework preset: Next.js (auto-detected). Leave build settings as they are — Vercel runs the `vercel-build` script, which applies migrations before building.
3. **Environment variables** → add everything from the table above (for *Production* and *Preview*). Set `NEXT_PUBLIC_SITE_URL` to the final domain.
4. **Deploy.** Functions run in `fra1` (Frankfurt, see `vercel.json`) to sit next to a Supabase project in `eu-central-1`; change it if your database is elsewhere.
5. **First run only** — if the database is empty, seed it from your machine: `npm run db:seed`.
6. **Custom domain** → Project → *Settings → Domains*. Update `NEXT_PUBLIC_SITE_URL` and redeploy.

After deploying: sign in, change the password in *Settings*, replace the `[TODO]` placeholders, and submit `https://<domain>/sitemap.xml` in Google Search Console.

> Preview deployments share the production database and also run `prisma migrate deploy`. For a separate staging database, give the *Preview* environment its own `DATABASE_URL` / `DIRECT_URL`.

### Email notifications (optional)

1. Create a Resend account and an API key → `RESEND_API_KEY`.
2. Without a verified domain Resend can only deliver to the address you signed up with — set `CONTACT_TO_EMAIL` to that address and keep `CONTACT_FROM_EMAIL="Portfolio <onboarding@resend.dev>"`.
3. With your own domain: verify it in Resend (DNS records), then use e.g. `CONTACT_FROM_EMAIL="Portfolio <hello@your-domain.com>"`.

Messages are always saved to the database, so the inbox works with or without email.

---

## Project structure

```
prisma/
  schema.prisma          data model (bilingual fields use the En / Ar suffix)
  migrations/            SQL migrations (incl. Data API lockdown)
  seed.ts                admin user + starter content + storage bucket
messages/                en.json / ar.json UI strings (public site + dashboard)
scripts/                 pooler-based migration helpers
src/
  app/
    [locale]/(site)/     public pages, OG images, page template
    [locale]/dashboard/  admin pages (projects, skills, experience, services, messages, settings)
    [locale]/login/      sign-in page
    api/auth/            Auth.js route handler
    sitemap.ts robots.ts manifest.ts icon.svg apple-icon.tsx
  components/
    ui/                  shadcn-style primitives
    sections/            public page sections
    site/                header, footer, markdown, icons
    dashboard/           dashboard building blocks (uploads, sortable list, dialogs…)
    effects/             cursor glow, aurora, reveal / enter animations
  i18n/                  next-intl routing + request config
  lib/                   db client, env, fonts, SEO/OG helpers, validation schemas
  server/
    actions/             server actions (all auth-checked + Zod-validated)
    services/            storage, email, rate limit
    queries.ts           cached read queries for the public site
  auth.ts auth.config.ts proxy.ts
_legacy/                 the original Vite version, kept for reference
```

### Content conventions

- Bilingual text is stored as `<field>En` / `<field>Ar`; `localized(obj, "field", locale)` picks one with fallback.
- In headlines, `*word*` renders as the highlighted accent (italic serif in English, bold gradient in Arabic).
- Paragraphs starting with `[TODO]` are shown highlighted in development and hidden in production.
- Skill icons are [simple-icons](https://simpleicons.org) slugs (e.g. `nodedotjs`).
