/**
 * Drizzle schema — mirrors docs/04-DATA-MODEL.md
 * No UI. Foundation only.
 */

import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "editor",
  "reporter",
]);

export const articleTypeEnum = pgEnum("article_type", [
  "news",
  "opinion",
  "feature",
  "investigative",
]);

export const articleStatusEnum = pgEnum("article_status", [
  "draft",
  "in_review",
  "published",
  "scheduled",
  "unpublished",
]);

export const tipStatusEnum = pgEnum("tip_status", [
  "new",
  "in_progress",
  "closed",
]);

export const commentStatusEnum = pgEnum("comment_status", [
  "pending",
  "approved",
  "rejected",
]);

export const notificationKindEnum = pgEnum("notification_kind", [
  "tip",
  "review",
  "comment",
]);

export const mediaKindEnum = pgEnum("media_kind", ["image", "audio"]);

export const adSlotKeyEnum = pgEnum("ad_slot_key", [
  "home_top",
  "home_mid",
  "article_sidebar",
  "article_inbody",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Auth.js / session store */
export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: articleTypeEnum("type").notNull(),
    status: articleStatusEnum("status").notNull().default("draft"),
    title: varchar("title", { length: 500 }).notNull(),
    slug: varchar("slug", { length: 500 }).notNull(),
    dek: varchar("dek", { length: 280 }),
    body: text("body"),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
    bylineName: varchar("byline_name", { length: 255 }),
    location: varchar("location", { length: 255 }),
    heroImageUrl: text("hero_image_url"),
    heroImageAlt: text("hero_image_alt"),
    heroCaption: text("hero_caption"),
    videoEmbedUrl: text("video_embed_url"),
    audioUrl: text("audio_url"),
    featured: boolean("featured").notNull().default(false),
    sponsored: boolean("sponsored").notNull().default(false),
    seoTitle: varchar("seo_title", { length: 500 }),
    seoDescription: varchar("seo_description", { length: 500 }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    publishAt: timestamp("publish_at", { withTimezone: true }),
    unpublishedAt: timestamp("unpublished_at", { withTimezone: true }),
    viewCount: integer("view_count").notNull().default(0),
    editorNote: text("editor_note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("articles_slug_uidx").on(t.slug)],
);

export const articleUpdates = pgTable("article_updates", {
  id: uuid("id").defaultRandom().primaryKey(),
  articleId: uuid("article_id")
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const media = pgTable("media", {
  id: uuid("id").defaultRandom().primaryKey(),
  url: text("url").notNull(),
  kind: mediaKindEnum("kind").notNull(),
  filename: varchar("filename", { length: 500 }).notNull(),
  alt: text("alt"),
  uploadedBy: uuid("uploaded_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Singleton row — always update in place */
export const breaking = pgTable("breaking", {
  id: integer("id").primaryKey().default(1),
  headline: text("headline").notNull().default(""),
  url: text("url").notNull().default(""),
  active: boolean("active").notNull().default(false),
  updatedBy: uuid("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const tips = pgTable("tips", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }),
  contact: varchar("contact", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  categoryId: uuid("category_id").references(() => categories.id),
  message: text("message").notNull(),
  imageUrl: text("image_url"),
  status: tipStatusEnum("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kind: notificationKindEnum("kind").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  link: text("link").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  articleId: uuid("article_id")
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" }),
  displayName: varchar("display_name", { length: 80 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  body: text("body").notNull(),
  status: commentStatusEnum("status").notNull().default("pending"),
  ip: varchar("ip", { length: 64 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  confirmTokenHash: text("confirm_token_hash"),
  unsubscribeTokenHash: text("unsubscribe_token_hash"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
});

export const newsletterSends = pgTable("newsletter_sends", {
  id: uuid("id").defaultRandom().primaryKey(),
  subject: varchar("subject", { length: 500 }).notNull(),
  intro: text("intro"),
  sentBy: uuid("sent_by")
    .notNull()
    .references(() => users.id),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  articleIds: text("article_ids").notNull().default("[]"), // JSON array of uuids
});

export const adSlots = pgTable("ad_slots", {
  id: uuid("id").defaultRandom().primaryKey(),
  slotKey: adSlotKeyEnum("slot_key").notNull().unique(),
  imageUrl: text("image_url"),
  clickUrl: text("click_url"),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  active: boolean("active").notNull().default(false),
});

export const articleViewDays = pgTable(
  "article_view_days",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    day: date("day").notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.articleId, t.day] })],
);

export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  siteName: varchar("site_name", { length: 255 }).notNull(),
  tagline: varchar("tagline", { length: 255 }).notNull(),
  whatsappChannelUrl: text("whatsapp_channel_url"),
  facebookUrl: text("facebook_url"),
  twitterUrl: text("twitter_url"),
  instagramUrl: text("instagram_url"),
  youtubeUrl: text("youtube_url"),
  contactEmail: varchar("contact_email", { length: 255 }),
  aboutHtml: text("about_html"),
  lastBackupAt: timestamp("last_backup_at", { withTimezone: true }),
});
