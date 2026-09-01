# System design (lean)

**One web app. One database. One file store. Free-first stack — no paid monthly plan assumed at launch.**

## 1. Locked stack

| Layer | Choice |
|---|---|
| App | Next.js App Router + TypeScript + Tailwind |
| ORM | **Drizzle** (only ORM — never add Prisma) |
| Auth | **Auth.js** credentials provider + our `users` / roles / DB sessions |
| Rich text | **TipTap** (body only: p, h2, bold, italic, link, lists, insert image) |
| Host | **Vercel Hobby** (same Next.js app = public site + CMS + server actions) |
| DB | **Neon** free Postgres (`DATABASE_URL`) |
| Media | **Cloudflare R2** free (10 GB, egress free) |
| Email | **Brevo** free (~300 emails/day) |
| Push | Web Push + VAPID (`web-push` lib + `/sw.js`) |
| Scheduled publish | HTTP endpoint + **external free cron** (Hobby has no reliable Vercel Cron) |

No separate API service. No Redis. No Clerk. No Vercel Blob.

```
Reader / staff browser
        │
        ▼
 Vercel Hobby (Next.js: pages + server actions)
        │
        ├── Neon Postgres
        ├── Cloudflare R2 (images, audio, optional backup dumps)
        ├── Brevo (reset, confirm, newsletter, staff alerts)
        └── Web Push (breaking only)
        
 External free cron ──POST──► /api/cron/publish  (CRON_SECRET)
 External free cron ──POST──► /api/cron/backup   (optional; dumps to R2)
```

## 2. Route map

**Public**

| Path | Page |
|---|---|
| `/` | Home |
| `/category/[slug]` | Category listing |
| `/[category]/[slug]` | News article |
| `/opinion` `/opinion/[slug]` | Opinion index + article |
| `/features` `/features/[slug]` | Features |
| `/investigations` `/investigations/[slug]` | Investigations |
| `/videos` | Articles that have a video embed |
| `/search` | Search `?q=` |
| `/archive` | Date/category archive |
| `/tips` | Submit a tip |
| `/about` `/contact` `/privacy` `/terms` `/ethics` | Static |
| `/newsletter/confirm` | Confirm token |
| `/newsletter/unsubscribe` | One-click unsubscribe (`?token=`) |
| `/sitemap.xml` `/robots.txt` | SEO |
| `/sw.js` | Service worker for breaking push |

**Staff**

| Path | Page |
|---|---|
| `/login` `/forgot-password` `/reset-password` | Auth |
| `/cms` | Dashboard |
| `/cms/articles` `/cms/articles/new` `/cms/articles/[id]` | Articles |
| `/cms/media` | Media library |
| `/cms/breaking` | Breaking bar |
| `/cms/tips` `/cms/tips/[id]` | Tips |
| `/cms/comments` | Comment moderation |
| `/cms/ads` | Ad slots |
| `/cms/newsletter` | Newsletter |
| `/cms/users` | Users (admin) |
| `/cms/categories` | Categories (admin) |
| `/cms/settings` | Settings (admin) |

**Internal**

| Path | Purpose |
|---|---|
| `/api/cron/publish` | Publish due `scheduled` rows. Header/query `CRON_SECRET`. |
| `/api/cron/backup` | `pg_dump` (or Neon logical dump) → upload `.sql.gz` to R2. Updates `site_settings.last_backup_at`. |

Middleware: `/cms/*` requires session. Role checked per page as in SRS.

**Reserved path segments** (never allow as category slugs):  
`category`, `opinion`, `features`, `investigations`, `videos`, `search`, `archive`, `tips`, `about`, `contact`, `privacy`, `terms`, `ethics`, `newsletter`, `cms`, `login`, `api`, `sw.js`, `sitemap.xml`, `robots.txt`.

## 3. Write path (article)

1. Reporter save → `articles` row `draft`.
2. Submit → `in_review` + notifications + Brevo `staff_alert` if configured.
3. Editor publish → `published`, `published_at`, `revalidatePath` for `/`, article URL, category, section index, `/videos` if embed, `/sitemap.xml`.
4. External cron hits `/api/cron/publish` when `publish_at <= now` → same as (3).

Breaking activate → update singleton, revalidate layout, send Web Push.

## 4. Read path (article)

1. Lookup by slug + type/category; only `published`.
2. Render TipTap HTML (sanitized).
3. View increment once per article per session (cookie).

## 5. Media (R2)

- Upload from CMS (and tip image) via server action → R2 object key → store public URL on `articles` / `media` / `tips`.
- Serve public URLs (R2 custom domain or `r2.dev`). Configure `next/image` `remotePatterns` for that host. No Vercel Image Optimization dependency required; prefer R2 URL + sensible sizes on upload.
- Stay inside **10 GB** free. Prefer WebP/JPEG compression on upload. Audio fills the bucket faster — one file per article max (SRS).

## 6. Email (Brevo)

Four templates: password reset, newsletter confirm, newsletter issue, staff_alert.  
From-address must be a verified Brevo sender/domain. If `BREVO_API_KEY` missing: CMS shows “email not configured”; Send / reset still fail honestly.

## 7. Auth (Auth.js)

Credentials: email + password against `users.password_hash`. Session in DB (`sessions` or Auth.js adapter tables — same idea). Cookie HTTP-only. Roles enforced in CMS layouts/actions, not only in UI.

## 8. Translator

Public header language select. Implementation: **Google Website Translator** (or equivalent free on-page widget) for English / Hausa / Yoruba. Cookie remembers choice. English remains the only CMS language. No paid translation API.

## 9. Backup (free stack)

- Neon free: use whatever restore window Neon provides on the free plan **plus**
- Daily external cron → `/api/cron/backup` → dump uploaded to R2 prefix `backups/YYYY-MM-DD.sql.gz`
- Settings shows `last_backup_at`
- Restore steps: download dump from R2 → restore into Neon (documented on Settings page). Test restore **once** before calling the product done.

## 10. What we refuse

- Separate search cluster, GraphQL, CQRS, microservices
- Vercel Blob, paid Vercel Pro as a requirement
- Prisma alongside Drizzle
- Real-time websocket breaking
- Dual Hausa/Yoruba article bodies in the CMS

## 11. Environments

`local` | `production`. Same schema. Local: Docker Postgres **or** Neon branch/dev URL; MinIO/local disk optional for media, or R2 from day one.

`.env`:

| Key | For |
|---|---|
| `DATABASE_URL` | Neon Postgres |
| `AUTH_SECRET` / `SESSION_SECRET` | Auth.js / cookie signing |
| `NEXT_PUBLIC_SITE_URL` | Canonicals, share, emails |
| `BREVO_API_KEY` | Email (Brevo) |
| `EMAIL_FROM` | Verified sender, e.g. `news@egigogo.com` |
| `R2_ACCOUNT_ID` | Cloudflare |
| `R2_ACCESS_KEY_ID` | R2 S3 API |
| `R2_SECRET_ACCESS_KEY` | R2 S3 API |
| `R2_BUCKET` | Bucket name |
| `R2_PUBLIC_URL` | Public base URL for objects |
| `R2_ENDPOINT` | `https://<accountid>.r2.cloudflarestorage.com` |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Web Push |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Client subscribe |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | First migrate seed |
| `CRON_SECRET` | Protects `/api/cron/*` |

Degrade honestly: no Brevo → mail actions disabled with reason; no VAPID → hide Enable notifications; no R2 → uploads fail with clear error (do not fake success).
