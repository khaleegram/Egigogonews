# PRD — Egigogo Newspaper

**One product. One release.** Nothing in the client core list is “later,” MVP-only, or phase 2. Engineering may code in order; **done means every item in §4 is live.**

## 1. Product

A credible, independent digital news site and a small newsroom CMS.

It publishes accurate, timely journalism with particular attention to **Niger State**, **Northern Nigeria**, and **national affairs**.

Tagline on the public site: **Truth, Integrity and Impact**.

## 2. Problem

Communities need a trusted place for politics, governance, security, education, health, business, agriculture, technology, sports, entertainment, community issues, features, and investigations — with a professional publishing process, not a blog dump.

## 3. Users

| User | Job |
|---|---|
| Reader | Read on phone, search, share, comment (no account), submit a tip, newsletter, browser notifications, language EN/HA/YO |
| Reporter | Draft and submit stories; upload media |
| Editor | Review, edit, publish, unpublish; breaking; tips; comments |
| Admin | Users, categories, ads, settings, newsletter, backups visible in settings |

There is **no public reader account**. Comments are guest (name + email + text). Staff only have logins.

## 4. The product (all required — client core)

Every row ships. No parking lot.

| Client asked | What we build | Spec |
|---|---|---|
| Modern, mobile-friendly news website | Public site, mobile-first | Screen spec A–B |
| CMS | Staff `/cms` | Screen spec D–E |
| Secure admin / editor / reporter accounts | Roles, hashed passwords, sessions, forgot-password | SRS 1–2 |
| News categories | 12 topics, admin can add/disable | SRS 6 |
| Archives | `/archive` by month + category | Screen B9 |
| Breaking news | One sitewide bar | SRS 7 |
| Update features | Timestamped story updates | SRS 8 |
| Headlines, bylines | Title, dek, byline | SRS 5 |
| Images | Hero + inline on **R2** | SRS 9, system design §5 |
| Videos | YouTube/Vimeo embed on article + `/videos` index | SRS 9, 23 |
| Audio | One audio file + player | SRS 9 |
| Search | Full text, published only | SRS 10 |
| Trending | Top 8 by views, last 7 days | SRS 10 |
| Opinion | Type + `/opinion` | SRS 3 |
| Features | Type + `/features` | SRS 3 |
| Investigative / public-interest | Type + `/investigations` | SRS 3 |
| Reader news-tip | `/tips` + CMS queue | SRS 11 |
| Social + WhatsApp sharing | WA, Facebook, X, copy link | SRS 12 |
| Newsletter | Subscribe, confirm, admin send | SRS 13 |
| Notifications | CMS bell; email to editors on tip/review/comment; **browser push** when breaking turns on | SRS 21 |
| Advertising | Four ad slots | SRS 14 |
| Sponsored content | Flag + public label | SRS 14 |
| SEO | Titles, OG, JSON-LD, sitemap, robots | SRS 15 |
| Analytics | View counts, CMS dashboard 7-day | SRS 16 |
| Security | Authz, CSRF, rate limits, HTTPS | SRS 17 |
| Backup | Daily dump to **R2** via cron; restore steps in settings | SRS 17, system design §9 |
| Performance | SSR, 60s revalidate, lazy images | SRS 18 |
| Hausa / Yoruba translator | Header select, on-page translate | SRS 19 |
| Comments | Guest + moderate | SRS 20 |

Also in product (same release): Community and National categories; About, Contact, Privacy, Terms, Editorial ethics pages; breadcrumbs, read time, view counts, floating WhatsApp button (SRS 22).

## 5. Not the product (never asked — do not build)

Not a backlog. Just not this newspaper.

- Reader logins, likes/reactions, nested comment threads
- Native iOS/Android apps
- WhatsApp Business API / chatbot (share + optional channel URL only)
- Dual CMS languages (three stored bodies per story)
- Paywall
- Full ad exchange / RTB
- Extra architecture: microservices, queues, Kubernetes, event sourcing
- AI writing / AI moderation / recommendation engine
- Multi-tenant
- Copying Eagle-Eye / Sky Bullet / VoiceUp **looks**

## 6. Editorial (same product)

- Voice: serious, public-interest. Not tabloid.
- Corrections are honest: **Add update** timestamps the change instead of quietly rewriting history.
- Investigations use the same editor as news. No separate vault, no special workflow.
- Sponsored content is always labelled.

## 7. Done means

Every row of §4 is live in production: a reporter files, an editor publishes, and a reader on a phone in Minna can read it, search it, share it to WhatsApp, comment on it (once approved), send a tip, subscribe, read the page in Hausa or Yoruba, and get a push when news breaks — with ads, SEO, analytics, backups, and performance as specified.

Verified against [08-ACCEPTANCE-CHECKLIST.md](./08-ACCEPTANCE-CHECKLIST.md). Every box, or we are not finished.

## 8. Architecture constraint

One Next.js app on **Vercel Hobby**. One **Neon** Postgres. Media on **Cloudflare R2**. Email via **Brevo**. Auth.js + Drizzle + TipTap. Video is embed URL, not a transcoding farm. No paid monthly host/DB/blob assumed at launch — details in [03-SYSTEM-DESIGN.md](./03-SYSTEM-DESIGN.md).
