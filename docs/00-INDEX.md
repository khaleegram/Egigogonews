# Egigogo Newspaper — planning index

**Product:** Egigogo Newspaper  
**Tagline:** Truth, Integrity and Impact  
**Focus:** Niger State, Northern Nigeria, national affairs

## Two rules

1. **Only what is specified.** If a feature, screen, button, or table is not in these docs, it is not in the build. No speculative architecture.
2. **Docs first.** Change the doc, then the code. Never the reverse.

**One release.** The numbered steps in the implementation plan are coding order, not phases. Nothing on the client's core list is deferred.

## Documents

| Doc | Purpose |
|---|---|
| [01-PRD.md](./01-PRD.md) | The product, plus a client-requirement traceability table |
| [02-SRS.md](./02-SRS.md) | Normative rules: roles, statuses, validation, every feature's behaviour |
| [03-SYSTEM-DESIGN.md](./03-SYSTEM-DESIGN.md) | One app, one DB, one blob. Routes, write/read paths, env |
| [04-DATA-MODEL.md](./04-DATA-MODEL.md) | Tables, fields, indexes, seed |
| [05-SCREEN-SPEC.md](./05-SCREEN-SPEC.md) | Every screen, every control, where it goes, what it writes. Exact copy strings |
| [06-IMPLEMENTATION-PLAN.md](./06-IMPLEMENTATION-PLAN.md) | Stack and coding order for the same release |
| [07-CLIENT-REFERENCES.md](./07-CLIENT-REFERENCES.md) | The three client URLs as a **feature** checklist, not a design |
| [08-ACCEPTANCE-CHECKLIST.md](./08-ACCEPTANCE-CHECKLIST.md) | What must be true in production before we call it done |

## Precedence when docs disagree

PRD (what) → SRS (rules) → screen spec (controls) → data model → implementation plan. Fix the higher doc first, then push the change down.

## Decisions already made (do not relitigate without updating docs)

- Staff logins only. Readers never register; comments are guest + moderated.
- Same article engine for news, opinion, features, investigations. Type changes the URL, not the machinery.
- Breaking is one sitewide singleton, and turning it on is what sends reader push.
- Hausa and Yoruba are a page translator (Google Website Translator widget). Editors write once, in English.
- Video is an embed URL. `/videos` is a filter over articles.
- Ads are four fixed slots plus a sponsored flag. No ad server.
- Our own visual identity. Reference sites informed features only.
- **Stack (free-first):** Vercel Hobby + Neon + Cloudflare R2 + Brevo + Drizzle + Auth.js + TipTap + Web Push. External free cron for schedule/backup. See [03-SYSTEM-DESIGN.md](./03-SYSTEM-DESIGN.md).
