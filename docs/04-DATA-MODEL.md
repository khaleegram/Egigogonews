# Data model

Postgres. No extra tables “just in case.”

## users
id, email unique, password_hash, name, role (`admin`|`editor`|`reporter`), active bool default true, created_at

## sessions
id, user_id, expires_at, created_at  
(or framework session table — same idea)

## password_reset_tokens
id, user_id, token_hash, expires_at, used_at

## categories
id, slug unique, name, description, active, sort_order

## articles
id, type (`news`|`opinion`|`feature`|`investigative`), status, title, slug unique, dek, body (text/html), **category_id required for all types**, author_id, byline_name (snapshot), location, hero_image_url, hero_image_alt, hero_caption, video_embed_url, audio_url, featured bool, sponsored bool, seo_title, seo_description, published_at, publish_at, unpublished_at, view_count int default 0, editor_note (return-to-reporter), created_at, updated_at

## article_updates
id, article_id, body, created_by, created_at

## media
id, url, kind (`image`|`audio`), filename, alt (images), uploaded_by, created_at  
(articles store URLs; this is the library list). Objects live in **Cloudflare R2**.

## breaking
id singleton or one row: headline, url, active, updated_by, updated_at  
**Constraint:** application ensures only one active. Simplest: **one row**, always updated in place.

## tips
id, name, contact, location, category_id nullable, message, image_url, status (`new`|`in_progress`|`closed`), created_at, updated_at

## notifications
id, user_id, kind (`tip`|`review`|`comment`), title, link, read_at, created_at  
Fan-out: insert one row per editor+admin.

## comments
id, article_id, display_name, email, body, status (`pending`|`approved`|`rejected`), ip, created_at

## push_subscriptions
id, endpoint unique, p256dh, auth, created_at

## newsletter_subscribers
id, email unique, confirmed_at, confirm_token_hash, unsubscribe_token_hash, created_at, unsubscribed_at

## newsletter_sends
id, subject, intro, sent_by, sent_at, article_ids (int[] or join table)

## ad_slots
id, slot_key unique (`home_top`|`home_mid`|`article_sidebar`|`article_inbody`), image_url, click_url, starts_at, ends_at, active

## article_view_days
article_id, day date, count  
PK (article_id, day). Trending = sum last 7 days.

## site_settings
singleton row: site_name, tagline, whatsapp_channel_url (footer link **and** floating button; empty hides both), facebook_url, twitter_url, instagram_url, youtube_url, contact_email, about_html, last_backup_at

## Indexes (the ones that matter)

- `articles(status, published_at desc)` — every public listing
- `articles(category_id, status, published_at desc)` — category pages
- `articles(type, status, published_at desc)` — opinion / features / investigations
- `articles(slug)` unique
- Full-text index over `title, dek, body` for search
- `article_view_days(day)` — trending window
- `comments(status, created_at desc)` and `comments(article_id, status)`
- `tips(status, created_at desc)`

## Seed

- Admin user from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` on first migrate.
- 12 categories from SRS §6.
- One `breaking` row, `active=false`.
- Four `ad_slots` rows, empty creatives, `active=false`.
- One `site_settings` row: site_name “Egigogo Newspaper”, tagline “Truth, Integrity and Impact”.
