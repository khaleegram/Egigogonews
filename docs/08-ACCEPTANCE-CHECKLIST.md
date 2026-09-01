# Acceptance checklist

Tick on **production**, not on a laptop. Every box is required — this is the release, not a phase.

## Publishing

- [ ] Reporter logs in, sees only own articles
- [ ] Reporter saves a draft, submits for review; editor gets bell + email
- [ ] Editor returns it with a note; reporter can edit again
- [ ] Editor cannot publish without dek, body, category, hero image, hero alt, byline (inline list shows what is missing)
- [ ] Editor publishes; story is live at its category URL within a minute
- [ ] Slug is locked after first publish
- [ ] Editor schedules a story; cron publishes it on time
- [ ] Editor unpublishes; public URL 404s, story still in CMS
- [ ] **Save** edits body in place; **Add update** appends a timestamped update and leaves the body alone
- [ ] Opinion, feature, and investigative stories land on `/opinion`, `/features`, `/investigations`
- [ ] Reporter cannot reach Breaking, Tips, Comments, Ads, Newsletter, Categories, Users, Settings

## Reading

- [ ] Home renders on a phone: breaking (if active), hero, latest, category rails, opinion, features, investigations, trending
- [ ] Category, archive, search paginate with Previous / Next
- [ ] Article shows breadcrumb, kicker, byline, date, read time, views, hero, body
- [ ] Video embed plays; audio player works; both optional
- [ ] `/videos` lists only stories that have an embed
- [ ] Trending reflects last 7 days, and a refresh does not inflate a view
- [ ] Sponsored story shows the label
- [ ] Draft or unpublished URL returns 404

## Reach

- [ ] WhatsApp share opens with headline + link; Facebook, X, Copy link all work
- [ ] Breaking bar appears sitewide; close hides it for that session only; reactivating it does not require a deploy
- [ ] Reader enables notifications; activating breaking sends one push with the headline; disabling stops them
- [ ] Newsletter: subscribe, confirm by email, admin send reaches confirmed subscribers only, send is logged
- [ ] Language select switches English / Hausa / Yoruba and the choice sticks across pages

## Community

- [ ] Guest comment submits, is invisible until an editor approves, then shows on the article
- [ ] Reject keeps it off the site permanently
- [ ] Comment and tip forms are rate-limited and honeypot-protected
- [ ] Tip submits, appears in the CMS queue, notifies editors, and can move new → in progress → closed

## Business

- [ ] All four ad slots render when active and in date, disappear when not
- [ ] Ad click goes to the advertiser URL in a new tab
- [ ] Admin can add and disable categories; disabled ones stay on old stories

## Platform

- [ ] Unique title + meta description, canonical, Open Graph, Twitter card, JSON-LD NewsArticle on articles
- [ ] `/sitemap.xml` lists published stories only; `/robots.txt` present
- [ ] CMS dashboard shows 7-day views and top stories
- [ ] Daily backup cron writes a dump to R2; Settings shows last backup; restore steps written down and **tested once**
- [ ] Login, tips, comments rate-limited; CMS routes reject the wrong role
- [ ] Lighthouse mobile: performance and accessibility both green on home and an article
- [ ] Every image has alt text
- [ ] No secrets in git; `.env` documented

## Brand

- [ ] Site does not resemble Eagle-Eye, Sky Bullet, or VoiceUp
- [ ] Masthead reads Egigogo Newspaper with “Truth, Integrity and Impact”
- [ ] About, Contact, Privacy, Terms, Editorial ethics all present and truthful
