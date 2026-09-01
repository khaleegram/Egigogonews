import type { Metadata } from "next";
import { siteUrl } from "@/lib/email";
import type { Story } from "@/lib/story";

const SITE_NAME = "Egigogo Newspaper";

export function metadataForStory(story: Story): Metadata {
  const title = story.title;
  const description =
    story.dek?.trim() ||
    `${story.category} coverage from ${SITE_NAME}.`;
  const url = siteUrl(story.href);
  const image = {
    url: story.imageUrl,
    alt: story.imageAlt || story.title,
    width: 1200,
    height: 630,
  };

  return {
    title,
    description,
    alternates: { canonical: url },
    authors: story.byline ? [{ name: story.byline }] : undefined,
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      title,
      description,
      url,
      locale: "en_NG",
      images: [image],
      publishedTime: story.publishedAt?.toISOString(),
      modifiedTime: story.publishedAt?.toISOString(),
      authors: story.byline ? [story.byline] : undefined,
      section: story.category,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [story.imageUrl],
    },
  };
}

/** JSON-LD for Google / rich results (also helps some share scrapers). */
export function storyJsonLd(story: Story) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: story.title,
    description: story.dek || undefined,
    image: [story.imageUrl],
    datePublished: story.publishedAt?.toISOString(),
    dateModified: story.publishedAt?.toISOString(),
    author: story.byline
      ? { "@type": "Person", name: story.byline }
      : { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "NewsMediaOrganization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: siteUrl("/icons/icon-512.png"),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": siteUrl(story.href),
    },
    articleSection: story.category,
  };
}
