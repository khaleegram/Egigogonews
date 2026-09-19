/** Seed categories + reserved public path segments — docs/02-SRS + 03-SYSTEM-DESIGN */

export const SEED_CATEGORIES: { slug: string; name: string; sortOrder: number }[] =
  [
    { slug: "politics", name: "Politics", sortOrder: 1 },
    { slug: "governance", name: "Governance", sortOrder: 2 },
    { slug: "security", name: "Security", sortOrder: 3 },
    { slug: "education", name: "Education", sortOrder: 4 },
    { slug: "health", name: "Health", sortOrder: 5 },
    { slug: "business", name: "Business", sortOrder: 6 },
    { slug: "agriculture", name: "Agriculture", sortOrder: 7 },
    { slug: "technology", name: "Technology", sortOrder: 8 },
    { slug: "sports", name: "Sports", sortOrder: 9 },
    { slug: "entertainment", name: "Entertainment", sortOrder: 10 },
    { slug: "community", name: "Community", sortOrder: 11 },
    { slug: "national", name: "National", sortOrder: 12 },
  ];

export const RESERVED_PATH_SEGMENTS = new Set([
  "category",
  "opinion",
  "features",
  "investigations",
  "videos",
  "search",
  "archive",
  "tips",
  "about",
  "contact",
  "privacy",
  "terms",
  "ethics",
  "newsletter",
  "cms",
  "login",
  "forgot-password",
  "reset-password",
  "api",
  "sw.js",
  "offline.html",
  "manifest.webmanifest",
  "sitemap.xml",
  "robots.txt",
]);

export const AD_SLOT_KEYS = [
  "home_top",
  "home_mid",
  "article_sidebar",
  "article_inbody",
] as const;
