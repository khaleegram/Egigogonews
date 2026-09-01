import { ArticleView } from "@/components/site/article-view";
import {
  getPublishedBySlug,
  incrementArticleViews,
  listPublishedStories,
} from "@/lib/articles";
import { RESERVED_PATH_SEGMENTS } from "@/lib/constants";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ category: string; slug: string }> };

export const dynamic = "force-dynamic";

export default async function NewsArticlePage({ params }: Props) {
  const { category, slug } = await params;
  if (RESERVED_PATH_SEGMENTS.has(category)) notFound();

  const story = await getPublishedBySlug(category, slug);
  if (!story) notFound();

  void incrementArticleViews(story.id);

  const related = (
    await listPublishedStories({
      categorySlug: story.categorySlug,
      limit: 5,
    })
  ).filter((s) => s.id !== story.id);

  return <ArticleView story={story} related={related} />;
}
