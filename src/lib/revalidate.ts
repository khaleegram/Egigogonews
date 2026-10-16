import { revalidatePath } from "next/cache";
import { articleHref } from "@/lib/story";

/**
 * Invalidate every cached page an article create/update/publish/delete affects.
 *
 * Public pages are cached indefinitely (`revalidate = false`) so that crawler
 * and reader traffic never regenerates them — which kept waking the Neon
 * database and burning its compute quota. Nothing refreshes on its own: every
 * write path must call this.
 */
export function revalidateArticlePaths(
  categorySlug: string,
  slug: string,
  type: string,
) {
  revalidatePath("/");
  revalidatePath(`/category/${categorySlug}`);
  revalidatePath(articleHref(categorySlug, slug));
  revalidatePath("/cms/articles");
  revalidatePath("/archive");
  revalidatePath("/videos");
  if (type === "opinion") revalidatePath("/opinion");
  if (type === "feature") revalidatePath("/features");
  if (type === "investigative") revalidatePath("/investigations");
}
