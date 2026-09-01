# Implementation plan

Code follows the docs. New idea → update the doc first.

**One product.** Numbered steps are **coding order**, not phases. Done = step 5 finished and [08-ACCEPTANCE-CHECKLIST.md](./08-ACCEPTANCE-CHECKLIST.md) fully ticked.

## Stack (locked — free-first)

| Layer | Choice |
|---|---|
| Framework | Next.js App Router + TypeScript + Tailwind |
| ORM | **Drizzle** only |
| Auth | **Auth.js** credentials + DB sessions |
| Editor | **TipTap** |
| Host | **Vercel Hobby** |
| DB | **Neon** free Postgres |
| Media | **Cloudflare R2** (10 GB free) |
| Email | **Brevo** free |
| Push | Web Push + VAPID |
| Cron | External free cron → `/api/cron/publish` (+ `/api/cron/backup`) with `CRON_SECRET` |

Public pages: server components. CMS mutations: server actions. Nothing else joins the stack without a doc change.

Details and env keys: [03-SYSTEM-DESIGN.md](./03-SYSTEM-DESIGN.md).

## Coding order

### 1. Skeleton
- Next.js app on the locked stack
- Drizzle schema + migrate against Neon (or local Postgres with same URL shape)
- Seed admin + 12 categories + breaking row + ad slots + site_settings
- Auth.js login / logout / middleware on `/cms`
- Public header/footer chrome (language + notifications can be inert until their step)
- CMS chrome + empty dashboard

### 2. Article CMS
- TipTap editor, list, preview, statuses, return-to-reporter
- Schedule + `/api/cron/publish`
- Image/audio upload to **R2**, media library
- Role rules (reporter own only)

### 3. Public reading
- Home (hero slider), category, article URLs, opinion/features/investigations
- Breadcrumb, read time, views, trending, share, `/videos`
- SEO, sitemap, robots, revalidate on publish
- `next/image` remotePatterns for R2 public host

### 4. Newsroom and community
- Breaking + bar + push send
- Tips, archive, search, featured
- Comments + moderation
- EN/HA/YO on-page translator (Google Website Translator widget)
- CMS bell + Brevo staff alerts

### 5. Business and platform
- Ads, sponsored, newsletter (confirm + **unsubscribe** route)
- Forgot-password email, users, categories (block reserved slugs)
- Settings, static pages
- `/api/cron/backup` → R2; Settings shows `last_backup_at`; restore note tested once
- Wire external cron jobs in the free cron provider

## Do not build

Only PRD §5.

## Habits

- After each step, check [05-SCREEN-SPEC.md](./05-SCREEN-SPEC.md).
- No control not in the screen spec.
- No table/column not in [04-DATA-MODEL.md](./04-DATA-MODEL.md).
- Copy from screen spec §H.
- Verify on a real phone.
- Stay inside free caps (R2 10 GB, Brevo daily free limit, Neon free). Do not add paid services “just in case.”
