# SRS — Software requirements

Normative. Implementation must match. If a screen spec and this conflict, update both before coding.

## 1. Roles

| Role | Can |
|---|---|
| **reporter** | Create/edit **own** drafts. Submit for review. Upload media for own stories. Cannot publish. Sees only own articles. |
| **editor** | Everything a reporter can, plus: see all articles, edit any, publish, unpublish, schedule, set breaking, manage updates, process tips, moderate comments, feature/pin on home. Cannot manage users or site settings. |
| **admin** | Everything an editor can, plus: users (create/disable), categories, ad slots, sponsored flag, newsletter send, site settings. |

One person, one role. No custom permission matrix.

## 2. Authentication

- Staff login: email + password (bcrypt/argon2 hash).
- Session cookie, HTTP-only, Secure, 30-day expiry, sliding on use.
- Logout ends session.
- Disabled user cannot log in; existing sessions for that user stop working.
- Forgot password: email link (required). Reset token expires in 1 hour, single use.
- Login attempts rate-limited per IP (see §17).

## 3. Article types

`news` | `opinion` | `feature` | `investigative`

Same fields. Different public section URLs:

- `/news/...` not used as a dump; news uses **category** URLs.
- Opinion: `/opinion/[slug]`
- Feature: `/features/[slug]`
- Investigative: `/investigations/[slug]`
- Standard news: `/[category-slug]/[slug]`

## 4. Article statuses

`draft` → `in_review` → `published` | `scheduled`  
From published: `unpublished` (hidden from public, still in CMS).

| Action | Who | From | To |
|---|---|---|---|
| Save draft | reporter (own), editor, admin | any except published unless editor | draft (if not yet published) |
| Submit for review | reporter (own) | draft | in_review |
| Publish now | editor, admin | draft, in_review, scheduled, unpublished | published (`publishedAt` = now) |
| Schedule | editor, admin | draft, in_review | scheduled (`publishAt` future) |
| Unpublish | editor, admin | published | unpublished |
| Return to reporter | editor, admin | in_review | draft + optional note |

Scheduled: external free cron POSTs `/api/cron/publish` (guarded by `CRON_SECRET`) about once a minute; publishes when `publish_at <= now`. Do not depend on Vercel Cron on Hobby.

## 5. Article fields (required vs optional)

**Required to save draft:** title (min 8 chars).  
**Required to publish:** title, slug, dek (standfirst, max 280), body (min 50 chars), category, type, byline name, hero image **with alt text**, SEO title (defaults to title).

Optional: video embed URL, audio file, location (free text, e.g. “Minna, Niger State”), featured flag, sponsored flag.

No article tags in this product (no tag tables, no tag UI).

Breaking is **not** an article field. It is the singleton in §7, set from the article via **Set as breaking**.

Slug: unique, lowercase, hyphenated. Auto from title; editable before first publish; **locked after first publish**.

## 6. Categories (seed set; admin can add, rename, disable)

Politics, Governance, Security, Education, Health, Business, Agriculture, Technology, Sports, Entertainment, Community, National.

Admin can add/disable categories. Disabled categories stay on old articles but cannot be selected for new ones.

New category slugs must not collide with reserved public path segments (see system design §2).

## 7. Breaking news

At most **one** global breaking item at a time.

Fields: headline, link (internal article URL or external), active yes/no.

Public: bar under header on all public pages when active.

Editor: “Set as breaking” on an article copies title + URL into the breaking record and activates it. “Clear breaking” deactivates.

Activating breaking (from either place) also sends one reader push — see §21C. Deactivating sends nothing.

## 8. Story updates

On a published article, editor adds **updates**: `{ created_at, body }`. Public page shows “Updates” list newest first, above the original body.

Two separate buttons, never merged: **Save** edits the story in place; **Add update** appends a timestamped update and leaves the body alone. Editors choose which is honest for the change.

## 9. Media

- Images: JPEG/WebP/PNG, max 8MB. Stored in **Cloudflare R2**. Hero + inline in body.
- Audio: mp3/m4a, max 25MB. One optional audio per article. HTML5 player on article page. Also R2.
- Video: URL only (YouTube or Vimeo). One optional embed per article, below hero.

Serve R2 public URLs. Allow the R2 host in `next/image` remotePatterns. Prefer compress-on-upload over a paid image CDN.

## 10. Search and trending

- Search: `q` against title, dek, body (Postgres full text). Results: published only. Paginated 20.
- Trending: published articles ranked by `article_view_days` summed over the last 7 days. Top 8 on home, top 5 in the article sidebar. Ties broken by newest.
- A view counts once per article per browser session (cookie gate). Refresh spam does not count. Each view increments both `articles.view_count` (lifetime) and today's `article_view_days` row.

## 11. Tips

Public form: name (optional), contact (phone or email, required), location (optional), category (optional), message (required, min 30 chars), image optional.

Status: `new` → `in_progress` → `closed`. Editors only. Submit creates CMS notification for all editors+admin.

No public listing of tips.

## 12. Sharing

On article: WhatsApp, Facebook, X, Copy link. WhatsApp uses `https://wa.me/?text=` + encoded title + URL.

## 13. Newsletter

- Public footer: email, Subscribe. Store `newsletter_subscribers` (email unique, confirmed via one-click link in email).
- Unconfirmed emails older than 7 days can be deleted by job.
- Every newsletter email includes unsubscribe link → `/newsletter/unsubscribe?token=`.
- Admin: compose subject + intro; pick “include last N published” or manual checklist; Send via **Brevo**. Log sends. No drip sequences.

## 14. Ads and sponsored

**Ad slots (fixed):** `home_top`, `home_mid`, `article_sidebar`, `article_inbody`.  
Each slot: image, click URL, active date range, active flag. One creative per slot at a time (simplest: latest active overlapping now).

**Sponsored article:** boolean on article. Public: “Sponsored” label. Does not use ad slots.

No impression tracking beyond optional click-through on the ad URL (external). We do not build an ads analytics product.

## 15. SEO

- Unique `<title>` and meta description (dek).
- Canonical URL, Open Graph, Twitter card.
- JSON-LD NewsArticle.
- `/sitemap.xml` published articles.
- `/robots.txt`.

## 16. Analytics

Source of truth: `articles.view_count` (lifetime) and `article_view_days(article_id, day, count)` (per day), written as in §10.

CMS dashboard shows: total views last 7 days, top 10 articles last 7 days, published-today count. No third-party analytics product required.

## 17. Security and ops

- All CMS routes require auth + role.
- CSRF on mutations (framework default).
- Rate-limit login, tip submit, and comment submit (IP).
- Daily backup on the free stack: cron hits `/api/cron/backup` → dump to **R2** `backups/`. Neon free restore window is extra safety, not a substitute. Admin **Settings** shows `last_backup_at` plus restore steps. Required; test restore once.
- Do not store secrets in git.

## 18. Performance

- Public pages server-rendered.
- Home and article cached with short revalidate (e.g. 60s). Publish must revalidate that article + home + category.
- Images lazy-load below fold.

## 19. Page translator (Hausa / Yoruba)

Public chrome only. **Staff write once, in English.**

Control: header select — English | Hausa | Yoruba. Default English.

Behavior: same URLs and same stored copy. Changing language runs **Google Website Translator** (free on-page widget) for EN/HA/YO. Choice stored in a cookie so it sticks on next pages.

If the translator script fails to load, the select still shows; page stays English. No paid translation API. No separate Hausa/Yoruba article bodies in the CMS.

## 20. Comments

On every **published** public article, below share row, above “More in [category]”.

**Guest form (no login):** display name (required, 2–80 chars), email (required, not shown publicly), body (required, 10–2000 chars). Honeypot field: if filled, drop silently.

Submit → `status=pending`. Public list shows **approved** only, newest first, flat (no replies). Empty: “No comments yet.” After submit: “Thanks. Your comment is awaiting review.”

**CMS:** editors/admin `/cms/comments`. **Approve** | **Reject**. Rejected never public.

New pending comment → notification `kind=comment` for editors+admin.

Reporters do not moderate. Comments stay on for all published articles (no off switch — one path).

## 21. Notifications (all required)

Three channels. Same product.

**A. CMS bell** — already: tip, in_review, comment. Click marks read, opens link.

**B. Email to editors + admin** — same events as A. One extra template: staff_alert (title + link). If email env missing, CMS bell still works; Settings shows email not configured.

**C. Reader browser push** — public **Enable notifications** (header on desktop, menu on mobile). Prompt uses Web Push. Store `push_subscriptions`. When editor **saves breaking as active**, send one push: breaking headline + URL. No per-category push, no marketing blasts (newsletter is for that). **Disable notifications** unsubscribes this browser.

Password reset and newsletter emails stay as specified.

## 22. Small display rules (no new systems)

- **Breadcrumb** on article pages: Home > Section > headline. Section = category for news, or Opinion / Features / Investigations.
- **Read time**: `ceil(words in body / 200)` minutes, computed at render. No stored column.
- **View count** shown on article and on cards (`articles.view_count`).
- **Relative time** for anything under 24h (“3 hours ago”), then date.
- Sponsored articles show a muted “Sponsored” label; they still appear in normal lists.

## 23. Videos section

`/videos` lists published articles that have `video_embed_url`, newest first, 20 per page, same card + pagination pattern as a category.

This is a **filter over articles**. No separate video CMS, no upload, no transcoding, no playlists.
