# Egigogo Newspaper

**Truth, Integrity and Impact** — Niger State, Northern Nigeria, national affairs.

Spec: [`docs/00-INDEX.md`](docs/00-INDEX.md). **UI is intentionally not built yet** — foundation only. Design one page later and reuse.

## Stack

Vercel Hobby · Neon · Cloudflare R2 · Resend · Drizzle · Auth.js · TipTap (later) · Web Push

## What’s scaffolded (no skin)

- Next.js App Router + TypeScript
- Full Drizzle schema (`src/db/schema.ts`) + seed
- Auth.js credentials (`src/lib/auth.ts`) + `/cms` middleware
- Public + CMS **route stubs** (plain text)
- Cron stubs: `/api/cron/publish`, `/api/cron/backup`
- `.env.example`

## Local

```bash
cp .env.example .env.local
# fill AUTH_SECRET, SEED_ADMIN_* (DATABASE_URL defaults to the local container)

npm run db:up      # local Postgres on 5433 (Docker)
npm run db:push
npm run db:seed
npm run dev
```

Local development runs against the Docker database, **not** Neon — pointing dev
at production wakes the metered Neon compute and burns its free quota (and
inflates view counters).

```bash
npm run db:down    # stop the container when you're done
```

Generate `AUTH_SECRET` with: `openssl rand -base64 32`

## Rule

Do not invent UI. When you design, do **one** page well, then apply the same pattern.
