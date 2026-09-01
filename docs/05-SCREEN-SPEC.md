# Screen spec — every control

If a control is not listed, do not add it.

Conventions:

- **Primary** = filled button, one per view.
- **Danger** = unpublish/disable, always confirm modal: Cancel | Confirm.
- Mobile: public header collapses to hamburger. CMS uses a left nav; on small screens nav is a top drawer.

---

# A. Public — chrome (all public pages)

## Header

| Control | Action |
|---|---|
| Wordmark **EGIGOGO NEWSPAPER** | Go `/` |
| Tagline text (desktop) | Not clickable |
| Nav: Home | `/` |
| Nav: Politics, Governance, Security, Education, Health, Business, Agriculture, Technology, Sports, Entertainment, Community, National | `/category/[slug]` |
| Nav: Opinion | `/opinion` |
| Nav: Features | `/features` |
| Nav: Investigations | `/investigations` |
| Nav: Videos | `/videos` |
| Search icon | Opens search field in header; Enter → `/search?q=` |
| Language | English / Hausa / Yoruba. Sets cookie; runs Google Website Translator on the page. Does not change URLs or CMS content. |
| **Enable notifications** | Requests browser permission; saves push subscription. If already enabled: **Disable notifications**. |
| Menu (mobile) | Opens same links + search + language + notifications |

## Breaking bar (only if `breaking.active`)

| Control | Action |
|---|---|
| Label `BREAKING` | Not a link |
| Headline | Go `breaking.url` |
| Close (X) | Hides bar **for this browser session only** (sessionStorage). Does not deactivate breaking. |

## Footer

| Control | Action |
|---|---|
| About / Contact / Privacy / Terms / Editorial ethics | `/about` `/contact` `/privacy` `/terms` `/ethics` |
| Social icons | External, `target=_blank` if URL set in settings; hide icon if URL empty |
| Newsletter email + **Subscribe** | Creates unconfirmed subscriber; shows “Check your email”. Invalid email: inline error |
| WhatsApp channel | If `whatsapp_channel_url` set, footer link; else omit |

## Floating WhatsApp button (all public pages)

| Control | Action |
|---|---|
| WhatsApp circle, bottom-right | Opens `whatsapp_channel_url` in new tab. Hidden entirely if that setting is empty. |

One button. No chat widget, no live agent, no bot.

---

# B. Public — pages

## B1. Home `/`

**Layout (top to bottom):** breaking (chrome) → `home_top` ad if active → hero → 4 latest news cards → `home_mid` ad if active → rails: one row per category with 3 latest (skip empty) → Opinion 3 → Features 2 → Investigations 2 → Trending 8 (list).

**Hero:** up to 5 `featured` published articles as a slider (image, category kicker, headline, date, views). If none featured, show the single latest published and no slider controls.

| Control | Action |
|---|---|
| Hero slide image/title | Go article URL |
| Hero ‹ › | Previous / next slide. Auto-advance every 7s, pauses on hover or focus |
| Hero dots | Jump to that slide |
| Card title/image | Go article URL |
| Rail **See all** | `/category/[slug]` or section index |
| Trending item | Go article URL |
| Ad image | Go `ad.click_url` (external, new tab) |

Cards show: category, headline, time, view count.

No “load more” on home. No infinite scroll.

## B2. Category `/category/[slug]`

Title = category name. List 20 published in that category, newest first. Pagination: **Previous** / **Next** (not numbered soup). Each card: image, title, dek, time.

| Control | Action |
|---|---|
| Card | Article URL |
| Previous / Next | `?page=` |

Empty: “No stories in this section yet.”

## B3. Article (news, opinion, feature, investigative)

**Main column, top to bottom:** breadcrumb → category/type kicker → headline → dek → byline + `publishedAt` + read time + views → Sponsored label if flagged → hero image → video embed if URL → audio player if file → **Updates** list if any → body → `article_inbody` ad if active → share row → comments → “More in [category]” 4 stories.

**Sidebar (desktop only, collapses under the article on mobile):** `article_sidebar` ad if active → Trending 5.

| Control | Action |
|---|---|
| Breadcrumb Home | `/` |
| Breadcrumb section | Category or section index |
| Category kicker | `/category/[slug]` |
| Byline | Not a public author page (no click) |
| Share WhatsApp | Open wa.me with title + URL |
| Share Facebook | Facebook sharer URL |
| Share X | Twitter intent URL |
| Copy link | Copy canonical URL; button label becomes “Copied” 2s |
| More-in card | That article |
| Audio | Native player only if file exists |

### Comments (article only)

Approved comments listed newest first: display name, date, body. Email never shown.

| Control | Action |
|---|---|
| Name, email, comment | Guest fields |
| **Post comment** | Creates pending comment. Success copy: awaiting review. Validation: inline |
| Rate limited | “Please wait and try again.” |

No reply, no like, no login to comment.

## B4. Opinion index `/opinion`  
Same as category list, filter `type=opinion`. Cards go `/opinion/[slug]`.

## B5. Features `/features` — `type=feature`

## B6. Investigations `/investigations` — `type=investigative`

## B7. Videos `/videos`

Published articles that have `video_embed_url`, newest first, 20 per page. Card shows thumbnail with a play badge, category, headline, time.

| Control | Action |
|---|---|
| Card | That article (video plays on the article page, not here) |
| Previous / Next | `?page=` |

Empty: “No videos yet.”

## B8. Search `/search`

| Control | Action |
|---|---|
| Query input (prefilled from `q`) | — |
| **Search** | GET `/search?q=` |
| Result row | Article |
| Previous / Next | Pagination |

Empty query: prompt only, no results. No results: “No stories matched.”

## B9. Archive `/archive`

| Control | Action |
|---|---|
| Month dropdown | Filter `?month=YYYY-MM` |
| Category dropdown | Filter `?category=` |
| **Apply** | Reload with query |
| Result card | Article |
| Pagination | As category |

## B10. Tips `/tips`

| Control | Action |
|---|---|
| Name | Optional |
| Contact | Required |
| Location | Optional |
| Category select | Optional, list active categories + blank |
| Message | Required ≥ 30 chars |
| Image | Optional, same image rules as CMS |
| **Submit tip** | POST; success screen “Thank you. Editors will review.” No login. |
| **Submit another** | Back to empty form |

Errors: inline under fields. Rate limit: message “Please wait and try again.”

## B11. Static `/about` `/contact` `/privacy` `/terms` `/ethics`

- **About**: `site_settings.about_html`, editable by admin.
- **Contact**: `contact_email` as a mailto link, plus a pointer to `/tips`. No second form.
- **Privacy, Terms, Editorial ethics**: markdown files in the repo. Changing them is a deploy, not a CMS screen.

## B12. Newsletter confirm `/newsletter/confirm?token=`

Valid: “You are subscribed.” Invalid: “Link expired.”

## B13. Newsletter unsubscribe `/newsletter/unsubscribe?token=`

Valid: sets `unsubscribed_at`, shows “You have been unsubscribed.” Invalid: “Link expired.” No login.

---

# C. Auth

## C1. Login `/login`

Staff only. If already logged in → `/cms`.

| Control | Action |
|---|---|
| Email, password | — |
| **Log in** | Session; go `/cms`. Fail: “Invalid email or password” (same message always) |
| **Forgot password** | `/forgot-password` |

## C2. Forgot password

Email + **Send reset link**. Always show “If that account exists, we sent a link.”

## C3. Reset password

New password, confirm, **Update password** → `/login`.

---

# D. CMS chrome (all `/cms/*`)

**Left nav**

| Item | Who sees | Goes to |
|---|---|---|
| Dashboard | all | `/cms` |
| Articles | all | `/cms/articles` |
| New article | all | `/cms/articles/new` |
| Breaking | editor, admin | `/cms/breaking` |
| Tips | editor, admin | `/cms/tips` |
| Comments | editor, admin | `/cms/comments` |
| Media | all | `/cms/media` |
| Ads | admin | `/cms/ads` |
| Newsletter | admin | `/cms/newsletter` |
| Categories | admin | `/cms/categories` |
| Users | admin | `/cms/users` |
| Settings | admin | `/cms/settings` |

**Top bar**

| Control | Action |
|---|---|
| Bell | Dropdown: unread notifications. Click row → `link` and mark read |
| Name + role | — |
| **Log out** | Clear session → `/login` |

Reporter nav hides Breaking, Tips, Comments, Ads, Newsletter, Categories, Users, Settings.

---

# E. CMS pages

## E1. Dashboard `/cms`

Widgets: counts — drafts (mine if reporter, all if editor), in_review, published today, new tips, pending comments (both editor+ only). Views last 7 days + top 10 articles last 7 days (editor+). List: 10 latest articles you can see. List: 5 unread notifications.

| Control | Action |
|---|---|
| **New article** | `/cms/articles/new` |
| Article title in list | `/cms/articles/[id]` |
| Tips count | `/cms/tips` (hidden for reporter) |
| Pending comments count | `/cms/comments` (hidden for reporter) |
| Top article row | `/cms/articles/[id]` |

## E2. Articles list `/cms/articles`

Filters: status, type, category, search title. Table: title, type, status, author, updated.

| Control | Action |
|---|---|
| **New article** | `/cms/articles/new` |
| Row | Edit `/cms/articles/[id]` |
| Filter **Apply** | Query string |
| Pagination | 20 per page |

Reporter: only `author_id = me`.

## E3. Article editor `/cms/articles/new` and `/cms/articles/[id]`

**Fields (left column):** type (select), category (select), title, slug (auto until published), dek, location, body (**TipTap**: p, h2, bold, italic, link, ordered/unordered list, insert image from media picker).

**Right column:** status badge, byline, hero image **Upload** / **Choose from library** + alt text + caption, video embed URL, audio **Upload**, featured checkbox (editor+), sponsored checkbox (admin only), SEO title, SEO description.

Alt text is required whenever a hero image is set — publish blocks without it.

**Buttons — reporter, status draft:**

| Button | Action |
|---|---|
| **Save draft** | Persist, stay. Toast Saved. |
| **Submit for review** | Status `in_review`, notify editors, stay. Disabled if title < 8 chars. |
| **Preview** | Opens public-like preview route `/cms/articles/[id]/preview` (auth required, not indexed) |

**Buttons — reporter, status in_review:** only **Preview**. No edit until returned. (Editor can still edit.)

**Buttons — editor/admin:**

| Button | Visible when | Action |
|---|---|---|
| **Save** | always | Persist fields; if published, this **edits body in place** (not an Update entry) |
| **Add update** | published | Opens modal: textarea. Confirm → inserts `article_updates` row, does not replace body |
| **Submit for review** | draft (if they want) | Same as reporter |
| **Return to reporter** | in_review | Modal: required note → draft + `editor_note` |
| **Schedule** | draft or in_review | Modal: datetime → `scheduled`. Block if publish requirements fail |
| **Publish now** | draft, in_review, scheduled, unpublished | Validate required-to-publish; else inline list of missing fields. Success → published, revalidate |
| **Unpublish** | published | Confirm → unpublished |
| **Set as breaking** | published | Confirm modal (same copy as E5 Save) → writes breaking singleton with this headline + URL, active=true, sends one push |
| **Preview** | always | Preview route |

**Publish validation missing list** (blocks publish, shown inline): dek, body length, category, hero image, hero alt text, byline.

**Byline field:** text, default current user’s name, editable.

Delete article: **not offered** (unpublish only). Avoid accidental wipes.

## E4. Preview `/cms/articles/[id]/preview`

Read-only public layout + banner “Preview — not public”. **Back to editor**.

## E5. Breaking `/cms/breaking`

Form: headline, URL, active toggle. Shows when it was last changed and by whom.

| Control | Action |
|---|---|
| **Save** | Update singleton. If this turns `active` on, confirm modal: “Show sitewide and push to N subscribers?” then send one push (SRS §21C) |
| **Clear / deactivate** | `active=false`. Bar disappears sitewide. No push |

## E6. Tips list `/cms/tips`

Filters: status. Table: date, contact, snippet, status.

| Control | Action |
|---|---|
| Row | `/cms/tips/[id]` |

## E7. Tip detail `/cms/tips/[id]`

Shows all fields + image. Status select.

| Control | Action |
|---|---|
| Status **Save** | `new` / `in_progress` / `closed` |
| **Open new article** | `/cms/articles/new?tipId=` — creates nothing yet; editor copies facts manually. **Do not auto-write an article.** |

## E8. Comments `/cms/comments`

Filters: pending (default), approved, rejected. Table: date, article title, name, snippet, status.

| Control | Action |
|---|---|
| Article title | `/cms/articles/[id]` |
| **Approve** | `approved` — appears on public article |
| **Reject** | Confirm → `rejected` |

## E9. Media `/cms/media`

Grid of uploads.

| Control | Action |
|---|---|
| **Upload** | File picker → `media` row |
| Thumbnail | Copy URL to clipboard (for rare paste). Article insert uses picker modal, not this copy as primary |

No delete of media files (avoid broken articles).

## E10. Ads `/cms/ads` (admin)

Four cards, one per slot.

| Control | Action |
|---|---|
| Image upload, click URL, start, end, active | — |
| **Save slot** | Persist that slot |

## E11. Newsletter `/cms/newsletter` (admin)

Subscriber count. Form: subject, intro. Checklist of last 20 published (checkbox).

| Control | Action |
|---|---|
| **Send** | Confirm “Send to N confirmed subscribers?” → provider send → log `newsletter_sends` |
| Disabled if email not configured | Tooltip |

## E12. Categories `/cms/categories` (admin)

Table: name, slug, active, sort.

| Control | Action |
|---|---|
| **Add category** | Modal: name → slug auto → insert. Reject reserved slugs (system design §2) with inline error |
| **Save row** | Update name/sort/active |
| Slug | Editable only if no published articles in category; same reserved-slug check |

## E13. Users `/cms/users` (admin)

| Control | Action |
|---|---|
| **Add user** | Modal: name, email, role, temp password or send reset. Creates `users` |
| **Disable** | Confirm, `active=false`. Cannot disable self |
| **Change role** | Select + Save |

No self-role-demote if last admin (block).

## E14. Settings `/cms/settings` (admin)

Fields per `site_settings`. About: textarea HTML or markdown. **Save**.

Read-only: email configured yes/no; last backup time (or “configure host backup — required”). Restore steps as static text on this page.

---

# F. Empty, error, edge

| State | UI |
|---|---|
| 404 | “Story not found” + link Home |
| 500 | “Something went wrong” |
| CMS forbidden | “You don’t have access” + Dashboard |
| Unpublished / draft hit public URL | 404 (same as missing) |

---

# G. Visual (enough to implement, not a design system rewrite)

- **Our own look.** The reference sites are a feature list, not a design. Do not copy their palettes, mastheads, or chrome.
- Mobile first, max content width ~1120px.
- Typography: readable serif headlines, sans body. High contrast.
- One accent colour plus neutrals. Not two shouting accents.
- Breaking bar: one line, full width, unmistakable.
- Sponsored: small muted label, not a watermark.
- Hero slider: 5 slides maximum, arrows and dots always reachable by keyboard, pause on hover/focus.
- Every image has alt text; hero alt comes from a caption/alt field on upload.
- Tap targets 44px minimum. Body text never below 16px.
- Do not add widgets nobody asked for (weather, stock ticker, related-by-AI, chat bots). Comments, language select, Enable notifications, and the WhatsApp button are specified — they stay.

---

# H. Copy that must be exact

Reused strings, so screens do not drift.

| Where | Text |
|---|---|
| Login failure | Invalid email or password |
| Forgot password | If that account exists, we sent a link |
| Comment posted | Thanks. Your comment is awaiting review. |
| No comments | No comments yet. |
| Tip posted | Thank you. Editors will review. |
| Rate limited | Please wait and try again. |
| Newsletter pending | Check your email to confirm. |
| Empty category | No stories in this section yet. |
| Empty search | No stories matched. |
| Empty videos | No videos yet. |
| 404 | Story not found |
| 500 | Something went wrong |
| CMS forbidden | You don’t have access |
| You have been unsubscribed | Newsletter unsubscribe success |
