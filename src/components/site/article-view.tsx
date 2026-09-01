import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/site/section-heading";
import { StoryCard } from "@/components/site/story-card";
import { listPublishedStories } from "@/lib/articles";
import {
  formatViews,
  wordCountFromHtml,
  type Story,
} from "@/lib/story";
import { ShareRow } from "@/components/site/share-row";
import { CommentBlock } from "@/components/site/comment-block";
import { listApprovedComments } from "@/lib/comment-actions";
import { storyJsonLd } from "@/lib/story-metadata";

function embedSrc(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu")) {
      const id =
        u.searchParams.get("v") ||
        u.pathname.split("/").filter(Boolean).pop() ||
        "";
      return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes("vimeo")) {
      const id = u.pathname.split("/").filter(Boolean).pop() || "";
      return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    /* fall through */
  }
  return url;
}

export async function ArticleView({
  story,
  related,
}: {
  story: Story;
  related: Story[];
}) {
  const trending = await listPublishedStories({
    limit: 5,
    orderBy: "trending",
  });
  const approvedComments = await listApprovedComments(story.id);

  const words = story.bodyHtml
    ? wordCountFromHtml(story.bodyHtml)
    : (story.body?.join(" ").split(/\s+/).length ?? 200);
  const readMins = Math.max(1, Math.ceil(words / 200));

  return (
    <div className="article-layout">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(storyJsonLd(story)),
        }}
      />
      <article>
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden>/</span>
          <Link href={`/category/${story.categorySlug}`}>{story.category}</Link>
          <span aria-hidden>/</span>
          <span>{story.title}</span>
        </nav>

        <p className="article-kicker">
          <Link href={`/category/${story.categorySlug}`}>{story.category}</Link>
        </p>
        <h1 className="article-title">{story.title}</h1>
        <p className="article-dek">{story.dek}</p>
        <p className="article-byline">
          {story.byline ?? "Egigogo Newspaper"}
          {" · "}
          {story.publishedLabel}
          {" · "}
          {readMins} min read
          {" · "}
          {formatViews(story.viewCount)} views
        </p>

        <div className="article-hero">
          <Image
            src={story.imageUrl}
            alt={story.imageAlt}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 70vw"
            style={{ objectFit: "cover" }}
          />
        </div>

        {story.videoEmbedUrl ? (
          <div className="article-embed">
            <iframe
              src={embedSrc(story.videoEmbedUrl)}
              title="Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : null}

        {story.audioUrl ? (
          <div className="article-audio">
            <audio controls preload="metadata" src={story.audioUrl}>
              Your browser does not support audio.
            </audio>
          </div>
        ) : null}

        {story.bodyHtml ? (
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: story.bodyHtml }}
          />
        ) : (
          <div className="article-body">
            {(story.body ?? [story.dek]).map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        )}

        <ShareRow title={story.title} />

        <CommentBlock
          articleId={story.id}
          initialComments={approvedComments}
        />

        <section aria-labelledby="more-heading">
          <SectionHeading
            title={`More in ${story.category}`}
            href={`/category/${story.categorySlug}`}
          />
          <div className="story-grid">
            {related.slice(0, 4).map((s) => (
              <StoryCard key={s.id} story={s} />
            ))}
          </div>
        </section>
      </article>

      <aside>
        <div className="sidebar-block">
          <h2>Trending</h2>
          <div className="stack-gap">
            {trending.map((s) => (
              <StoryCard key={s.id} story={s} variant="compact" />
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
