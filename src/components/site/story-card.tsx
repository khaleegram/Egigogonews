import Image from "next/image";
import Link from "next/link";
import { formatViews, type Story } from "@/lib/story";

type Props = {
  story: Story;
  variant?: "standard" | "compact" | "rail";
};

export function StoryCard({ story, variant = "standard" }: Props) {
  if (variant === "compact" || variant === "rail") {
    return (
      <article className={`story-card story-card--${variant}`}>
        <Link href={story.href} className="story-card__link">
          {variant === "rail" ? (
            <div className="story-card__thumb">
              <Image
                src={story.imageUrl}
                alt={story.imageAlt}
                fill
                sizes="120px"
                style={{ objectFit: "cover" }}
              />
            </div>
          ) : null}
          <div>
            <p className="story-card__meta">
              <span>{story.category}</span>
              <span aria-hidden>·</span>
              <span>{story.publishedLabel}</span>
            </p>
            <h3 className="story-card__title">{story.title}</h3>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="story-card">
      <Link href={story.href} className="story-card__link">
        <div className="story-card__media">
          <Image
            src={story.imageUrl}
            alt={story.imageAlt}
            fill
            sizes="(max-width: 700px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
          />
        </div>
        <p className="story-card__meta">
          <span>{story.category}</span>
          <span aria-hidden>·</span>
          <span>{story.publishedLabel}</span>
          <span aria-hidden>·</span>
          <span>{formatViews(story.viewCount)} views</span>
        </p>
        <h3 className="story-card__title">{story.title}</h3>
        <p className="story-card__dek">{story.dek}</p>
      </Link>
    </article>
  );
}
