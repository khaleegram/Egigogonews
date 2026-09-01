# Client reference sites — feature check

Reviewed 2026-08-31.

**Their looks are not the brief.** We took features only. Our visual identity is our own — see screen spec §G.

Sites reviewed:

1. [theeagleeye.com.ng](https://theeagleeye.com.ng/) — homepage
2. [skybulletnews.com.ng](https://skybulletnews.com.ng/magi-graduates-another-500-women-under-zinariya-minna-empowerment-programs/) — news article
3. [voiceupnews.com.ng](https://voiceupnews.com.ng/article/advice-to-the-leadership-of-apc-in-niger-state-choose-unity-reconciliation-and-progress) — opinion article

## Verdict

Our spec covers everything they ship, and goes further on newsroom process: reporter/editor review workflow, news tips, investigations as a section, story updates, sponsored flags, backup and analytics.

## Feature matrix

| Feature on their sites | Seen on | Ours |
|---|---|---|
| Breaking headlines | All three | One sitewide bar (SRS 7) |
| Categories + nav | All three | 12 seed categories, admin-managed (SRS 6) |
| Search | All three | Postgres full text (SRS 10) |
| Article: headline, byline, date, hero, body | Sky Bullet, VoiceUp | SRS 5, screen B3 |
| Breadcrumb | Sky Bullet, VoiceUp | SRS 22 |
| Read time | Sky Bullet | SRS 22 |
| View counts | Eagle-Eye | SRS 10, 22 |
| Hero slider of top stories | Eagle-Eye | Up to 5 featured (screen B1) |
| Opinion as its own section | VoiceUp, Eagle-Eye | Plus features and investigations (SRS 3) |
| Share to WhatsApp, Facebook, X | Sky Bullet, VoiceUp | Plus copy link (SRS 12) |
| Floating WhatsApp button | Eagle-Eye | One link button (screen A) |
| Related stories | Sky Bullet | More in category (screen B3) |
| Videos section | Eagle-Eye | `/videos` filter over articles (SRS 23) |
| Ads and sponsored blocks | Eagle-Eye | Four slots + sponsored flag (SRS 14) |
| Trending / latest / editor's picks | Eagle-Eye | Trending + featured (SRS 10) |
| Hausa / Yoruba translation | Eagle-Eye | Page translator, English in CMS (SRS 19) |
| Comments | Sky Bullet (closed there) | Guest + moderated, ours actually open (SRS 20) |
| Newsletter | VoiceUp | Subscribe, confirm, admin send (SRS 13) |
| About, contact, privacy, terms, ethics | VoiceUp | All five (screen B11) |
| Archives | VoiceUp | Month + category (screen B9) |
| Staff login | Sky Bullet | `/login`, staff only (SRS 2) |

## Deliberately not copied

| Theirs | Why not |
|---|---|
| Their dark themes, mastheads, WordPress chrome | We build our own identity |
| Reader accounts | Comments are guest; nothing else needs an account |
| Comment replies and likes | Flat, moderated comments are enough |
| Dark/light toggle, category count badges, prev/next story | Chrome that adds work and no journalism |
| Separate Hausa/Yoruba article bodies | The translator is what they actually shipped, and it is what readers use |

## What they do not have that we do

Reporter-to-editor review workflow, news tips intake, investigations section, timestamped story updates, breaking push notifications, CMS analytics, documented backups.
