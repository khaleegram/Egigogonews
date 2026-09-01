"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SEED_CATEGORIES } from "@/lib/constants";
import { ArticleBodyEditor } from "@/components/cms/article-body-editor";
import { MediaPickerModal } from "@/components/cms/media-picker-modal";
import {
  addArticleUpdate,
  publishArticleNow,
  returnToReporter,
  saveArticleDraft,
  scheduleArticle,
  submitArticleForReview,
  unpublishArticle,
} from "@/lib/article-actions";

export type ArticleEditorValues = {
  id?: string;
  type: "news" | "opinion" | "feature" | "investigative";
  status?: string;
  title: string;
  slug: string;
  dek: string;
  location: string;
  byline: string;
  categorySlug: string;
  bodyHtml: string;
  videoEmbedUrl: string;
  audioUrl: string;
  heroImageUrl: string;
  heroImageAlt: string;
  featured: boolean;
  sponsored: boolean;
  seoTitle: string;
  seoDescription: string;
};

const empty: ArticleEditorValues = {
  type: "news",
  title: "",
  slug: "",
  dek: "",
  location: "",
  byline: "",
  categorySlug: "politics",
  bodyHtml: "",
  videoEmbedUrl: "",
  audioUrl: "",
  heroImageUrl: "",
  heroImageAlt: "",
  featured: false,
  sponsored: false,
  seoTitle: "",
  seoDescription: "",
};

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

export function ArticleEditorForm({
  initial,
  mode,
  role = "reporter",
}: {
  initial?: Partial<ArticleEditorValues>;
  mode: "new" | "edit";
  role?: "admin" | "editor" | "reporter";
}) {
  const canPublish = role === "admin" || role === "editor";
  const router = useRouter();
  const start = useMemo(() => ({ ...empty, ...initial }), [initial]);
  const [values, setValues] = useState(start);
  const [slugLocked, setSlugLocked] = useState(mode === "edit");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [picker, setPicker] = useState<"hero" | "audio" | "body" | null>(null);
  const [scheduleAt, setScheduleAt] = useState("");
  const [returnNote, setReturnNote] = useState("");
  const [updateBody, setUpdateBody] = useState("");
  const insertImageRef = useRef<((url: string, alt?: string) => void) | null>(
    null,
  );

  function set<K extends keyof ArticleEditorValues>(
    key: K,
    value: ArticleEditorValues[K],
  ) {
    setValues((v) => {
      const next = { ...v, [key]: value };
      if (key === "title" && !slugLocked && mode === "new") {
        next.slug = slugify(String(value));
      }
      return next;
    });
  }

  function flash(msg: string) {
    setToast(msg);
    setError("");
    window.setTimeout(() => setToast(""), 2500);
  }

  function payload() {
    return {
      id: values.id,
      type: values.type,
      title: values.title,
      slug: values.slug,
      dek: values.dek,
      location: values.location,
      byline: values.byline,
      categorySlug: values.categorySlug,
      bodyHtml: values.bodyHtml,
      videoEmbedUrl: values.videoEmbedUrl,
      audioUrl: values.audioUrl,
      heroImageUrl: values.heroImageUrl,
      heroImageAlt: values.heroImageAlt,
      featured: values.featured,
      sponsored: values.sponsored,
      seoTitle: values.seoTitle,
      seoDescription: values.seoDescription,
    };
  }

  function onSaveDraft() {
    startTransition(async () => {
      const result = await saveArticleDraft(payload());
      if (!result.ok) {
        setError(result.error);
        return;
      }
      flash("Draft saved");
      if (mode === "new") {
        router.push(`/cms/articles/${result.id}`);
        router.refresh();
      } else {
        router.refresh();
      }
    });
  }

  function onSubmitReview() {
    startTransition(async () => {
      let id = values.id;
      const saved = await saveArticleDraft(payload());
      if (!saved.ok) {
        setError(saved.error);
        return;
      }
      id = saved.id;
      const result = await submitArticleForReview(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      flash("Submitted for review");
      router.push(`/cms/articles/${id}`);
      router.refresh();
    });
  }

  function onPublish() {
    if (!values.id) return;
    startTransition(async () => {
      const saved = await saveArticleDraft(payload());
      if (!saved.ok) {
        setError(saved.error);
        return;
      }
      const result = await publishArticleNow(values.id!);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      flash("Published");
      router.refresh();
    });
  }

  function onSchedule() {
    if (!values.id || !scheduleAt) return;
    startTransition(async () => {
      const saved = await saveArticleDraft(payload());
      if (!saved.ok) {
        setError(saved.error);
        return;
      }
      const result = await scheduleArticle(
        values.id!,
        new Date(scheduleAt).toISOString(),
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      flash("Scheduled");
      router.refresh();
    });
  }

  function onReturn() {
    if (!values.id) return;
    startTransition(async () => {
      const result = await returnToReporter(values.id!, returnNote);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      flash("Returned to reporter");
      router.refresh();
    });
  }

  function onUnpublish() {
    if (!values.id) return;
    startTransition(async () => {
      const result = await unpublishArticle(values.id!);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      flash("Unpublished");
      router.refresh();
    });
  }

  function onAddUpdate() {
    if (!values.id || !updateBody.trim()) return;
    startTransition(async () => {
      const result = await addArticleUpdate(values.id!, updateBody.trim());
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setUpdateBody("");
      flash("Update added");
      router.refresh();
    });
  }

  return (
    <>
      <form
        className="article-editor"
        onSubmit={(e) => {
          e.preventDefault();
          onSaveDraft();
        }}
      >
        <div className="article-editor__grid">
          <div className="article-editor__main">
            <label>
              Type
              <select
                value={values.type}
                onChange={(e) =>
                  set("type", e.target.value as ArticleEditorValues["type"])
                }
              >
                <option value="news">News</option>
                <option value="opinion">Opinion</option>
                <option value="feature">Feature</option>
                <option value="investigative">Investigative</option>
              </select>
            </label>

            <label>
              Category
              <select
                value={values.categorySlug}
                onChange={(e) => set("categorySlug", e.target.value)}
              >
                {SEED_CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Title
              <input
                value={values.title}
                onChange={(e) => set("title", e.target.value)}
                required
                minLength={8}
              />
            </label>

            <label>
              Slug
              <input
                value={values.slug}
                onChange={(e) => {
                  setSlugLocked(true);
                  set("slug", e.target.value);
                }}
                disabled={mode === "edit"}
                required
              />
            </label>

            <label>
              Dek
              <input
                value={values.dek}
                onChange={(e) => set("dek", e.target.value)}
                maxLength={280}
              />
            </label>

            <label>
              Location
              <input
                value={values.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Minna, Niger State"
              />
            </label>

            <div>
              <p className="article-editor__label">Body</p>
              <ArticleBodyEditor
                initialHtml={values.bodyHtml}
                onChangeHtml={(html) => set("bodyHtml", html)}
                onRequestImage={() => setPicker("body")}
                insertImageRef={insertImageRef}
              />
            </div>
          </div>

          <aside className="article-editor__side">
            {values.status ? (
              <p className="article-editor__status">
                Status: <strong>{values.status}</strong>
              </p>
            ) : null}

            <label>
              Byline
              <input
                value={values.byline}
                onChange={(e) => set("byline", e.target.value)}
              />
            </label>

            <div className="article-editor__media-block">
              <p className="article-editor__label">Hero image</p>
              {values.heroImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={values.heroImageUrl}
                  alt={values.heroImageAlt || values.title || "Hero"}
                  className="article-editor__hero-preview"
                />
              ) : null}
              <div className="article-editor__actions">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setPicker("hero")}
                >
                  Upload / library
                </button>
                {values.heroImageUrl ? (
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => {
                      set("heroImageUrl", "");
                      set("heroImageAlt", "");
                    }}
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>

            <label>
              Video embed URL
              <input
                value={values.videoEmbedUrl}
                onChange={(e) => set("videoEmbedUrl", e.target.value)}
                placeholder="YouTube or Vimeo"
              />
            </label>

            <div className="article-editor__media-block">
              <p className="article-editor__label">Audio</p>
              {values.audioUrl ? (
                <p className="muted" style={{ margin: "0 0 0.5rem" }}>
                  {values.audioUrl.split("/").pop()}
                </p>
              ) : null}
              <div className="article-editor__actions">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setPicker("audio")}
                >
                  Upload / library
                </button>
                {values.audioUrl ? (
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => set("audioUrl", "")}
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>

            {canPublish ? (
              <>
                <label className="article-editor__check">
                  <input
                    type="checkbox"
                    checked={values.featured}
                    onChange={(e) => set("featured", e.target.checked)}
                  />
                  Featured on home
                </label>

                <label className="article-editor__check">
                  <input
                    type="checkbox"
                    checked={values.sponsored}
                    onChange={(e) => set("sponsored", e.target.checked)}
                  />
                  Sponsored
                </label>
              </>
            ) : null}

            <label>
              SEO title
              <input
                value={values.seoTitle}
                onChange={(e) => set("seoTitle", e.target.value)}
                placeholder="Defaults to title"
              />
            </label>

            <label>
              SEO description
              <textarea
                value={values.seoDescription}
                onChange={(e) => set("seoDescription", e.target.value)}
                rows={3}
              />
            </label>

            <div className="article-editor__actions">
              <button type="submit" className="btn" disabled={pending}>
                {mode === "new" ? "Save draft" : "Save"}
              </button>
              {mode === "new" || values.status === "draft" ? (
                <button
                  type="button"
                  className="btn btn--ghost"
                  disabled={pending}
                  onClick={onSubmitReview}
                >
                  Submit for review
                </button>
              ) : null}
              {mode === "edit" ? (
                <>
                  {canPublish ? (
                    <button
                      type="button"
                      className="btn"
                      disabled={pending || !values.id}
                      onClick={onPublish}
                    >
                      Publish now
                    </button>
                  ) : null}
                  <Link
                    href={`/cms/articles/${values.id}/preview`}
                    className="btn btn--ghost"
                  >
                    Preview
                  </Link>
                  {canPublish && values.status === "published" ? (
                    <button
                      type="button"
                      className="btn btn--ghost"
                      disabled={pending}
                      onClick={onUnpublish}
                    >
                      Unpublish
                    </button>
                  ) : null}
                </>
              ) : null}
            </div>

            {mode === "edit" && values.id && canPublish ? (
              <div className="article-editor__workflow">
                <label>
                  Schedule publish
                  <input
                    type="datetime-local"
                    value={scheduleAt}
                    onChange={(e) => setScheduleAt(e.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className="btn btn--ghost"
                  disabled={pending || !scheduleAt}
                  onClick={onSchedule}
                >
                  Schedule
                </button>

                {values.status === "in_review" ? (
                  <>
                    <label>
                      Return note
                      <textarea
                        value={returnNote}
                        onChange={(e) => setReturnNote(e.target.value)}
                        rows={2}
                        placeholder="What should the reporter fix?"
                      />
                    </label>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      disabled={pending}
                      onClick={onReturn}
                    >
                      Return to reporter
                    </button>
                  </>
                ) : null}

                {values.status === "published" ? (
                  <>
                    <label>
                      Add update
                      <textarea
                        value={updateBody}
                        onChange={(e) => setUpdateBody(e.target.value)}
                        rows={3}
                        placeholder="Timestamped update — body stays as-is"
                      />
                    </label>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      disabled={pending || !updateBody.trim()}
                      onClick={onAddUpdate}
                    >
                      Add update
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}

            {toast ? <p className="form-success">{toast}</p> : null}
            {error ? <p className="form-error">{error}</p> : null}
            {pending ? <p className="muted">Saving…</p> : null}
          </aside>
        </div>
      </form>

      <MediaPickerModal
        open={picker === "hero" || picker === "body"}
        kind="image"
        title={picker === "body" ? "Insert image" : "Hero image"}
        onClose={() => setPicker(null)}
        onPick={(item) => {
            if (picker === "hero") {
            set("heroImageUrl", item.url);
            set("heroImageAlt", values.title || item.alt || "");
          } else if (picker === "body") {
            insertImageRef.current?.(item.url, item.alt ?? "");
          }
        }}
      />
      <MediaPickerModal
        open={picker === "audio"}
        kind="audio"
        title="Article audio"
        onClose={() => setPicker(null)}
        onPick={(item) => set("audioUrl", item.url)}
      />
    </>
  );
}
