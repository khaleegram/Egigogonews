"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { HeroStory } from "@/lib/demo-hero";

const INTERVAL_MS = 7000;

function formatViews(n: number) {
  if (n >= 10000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

const navBtnStyle: CSSProperties = {
  width: "2.5rem",
  height: "2.5rem",
  border: "1px solid var(--line)",
  background: "var(--paper)",
  color: "var(--ink)",
  fontSize: "1.35rem",
  lineHeight: 1,
  cursor: "pointer",
  borderRadius: 2,
};

export function HomeHero({ stories }: { stories: HeroStory[] }) {
  const slides = stories.slice(0, 5);
  const multi = slides.length > 1;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const regionId = useId();
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const go = useCallback(
    (next: number) => {
      const len = slides.length;
      if (len === 0) return;
      setIndex(((next % len) + len) % len);
    },
    [slides.length],
  );

  useEffect(() => {
    if (!multi || paused || reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [multi, paused, reduceMotion, slides.length]);

  if (slides.length === 0) {
    return (
      <section
        aria-label="Lead story"
        style={{
          padding: "3rem 1.25rem",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <p style={{ margin: 0, color: "var(--ink-muted)" }}>
          No featured stories yet.
        </p>
      </section>
    );
  }

  const story = slides[index]!;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured stories"
      id={regionId}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setPaused(false);
        }
      }}
      style={{ borderBottom: "1px solid var(--line)" }}
    >
      <div
        className="home-hero__media"
        onTouchStart={(e) => {
          touchX.current = e.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchX.current == null || !multi) return;
          const x = e.changedTouches[0]?.clientX;
          if (x == null) return;
          const delta = x - touchX.current;
          touchX.current = null;
          if (Math.abs(delta) < 48) return;
          go(index + (delta < 0 ? 1 : -1));
        }}
      >
        <Link
          href={story.href}
          aria-label={`Read: ${story.title}`}
          className="home-hero__media-link"
        >
          <Image
            key={story.id}
            src={story.imageUrl}
            alt={story.imageAlt}
            fill
            priority
            sizes="100vw"
            className={reduceMotion ? undefined : "hero-media-ken"}
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </Link>
      </div>

      <div className="home-hero__panel">
        <div
          key={story.id}
          className={
            reduceMotion
              ? "home-hero__copy"
              : "home-hero__copy hero-copy-enter"
          }
        >
          <p className="home-hero__meta">
            {story.category}
            <span className="home-hero__meta-sep" aria-hidden>
              ·
            </span>
            <span className="home-hero__meta-muted">
              {story.publishedLabel}
            </span>
            <span className="home-hero__meta-sep" aria-hidden>
              ·
            </span>
            <span className="home-hero__meta-muted">
              {formatViews(story.viewCount)} views
            </span>
          </p>

          <h2 className="home-hero__title">
            <Link href={story.href} className="hero-headline-link">
              {story.title}
            </Link>
          </h2>

          {story.byline ? (
            <p className="home-hero__byline">By {story.byline}</p>
          ) : null}

          <p className="home-hero__dek">{story.dek}</p>

          <div className="home-hero__actions">
            <Link href={story.href} className="hero-cta">
              Read story
              <span aria-hidden style={{ fontSize: "1.1em" }}>
                →
              </span>
            </Link>

            {multi ? (
              <div className="home-hero__nav">
                <button
                  type="button"
                  aria-label="Previous featured story"
                  onClick={() => go(index - 1)}
                  style={navBtnStyle}
                >
                  ‹
                </button>
                <div
                  role="tablist"
                  aria-label="Featured stories"
                  style={{ display: "flex", gap: "0.4rem" }}
                >
                  {slides.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      role="tab"
                      aria-selected={i === index}
                      aria-label={`Show story ${i + 1} of ${slides.length}`}
                      onClick={() => go(i)}
                      style={{
                        width: i === index ? "1.35rem" : "0.55rem",
                        height: "0.55rem",
                        border: "none",
                        borderRadius: 2,
                        padding: 0,
                        cursor: "pointer",
                        background:
                          i === index ? "var(--accent)" : "var(--line)",
                        transition:
                          "width 0.25s var(--ease-out), background 0.25s",
                      }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  aria-label="Next featured story"
                  onClick={() => go(index + 1)}
                  style={navBtnStyle}
                >
                  ›
                </button>
              </div>
            ) : null}
          </div>

          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {`Story ${index + 1} of ${slides.length}: ${story.title}`}
          </p>
        </div>
      </div>
    </section>
  );
}
