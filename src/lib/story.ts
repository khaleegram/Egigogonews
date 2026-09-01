export type Story = {
  id: string;
  href: string;
  category: string;
  categorySlug: string;
  title: string;
  dek: string;
  imageUrl: string;
  imageAlt: string;
  publishedLabel: string;
  viewCount: number;
  byline?: string;
  type?: "news" | "opinion" | "feature" | "investigative";
  hasVideo?: boolean;
  videoEmbedUrl?: string;
  audioUrl?: string;
  /** Plain paragraphs (legacy demo) or omit when bodyHtml is set */
  body?: string[];
  /** TipTap / CMS HTML */
  bodyHtml?: string;
  location?: string;
  sponsored?: boolean;
  publishedAt?: Date | null;
};

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?auto=format&fit=crop&w=1200&q=80";

export function articleHref(categorySlug: string, slug: string) {
  return `/${categorySlug}/${slug}`;
}

export function formatViews(n: number) {
  if (n >= 10000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function formatPublishedLabel(date: Date | null | undefined) {
  if (!date) return "Draft";
  const ms = Date.now() - date.getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return mins <= 1 ? "Just now" : `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function placeholderImage() {
  return PLACEHOLDER_IMAGE;
}

export function wordCountFromHtml(html: string) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return 0;
  return text.split(" ").length;
}
