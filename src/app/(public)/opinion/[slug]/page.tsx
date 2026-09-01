import { ArticleView } from "@/components/site/article-view";
import {
  getPublishedByTypeAndSlug,
  incrementArticleViews,
  listPublishedStories,
} from "@/lib/articles";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export default async function OpinionArticlePage({ params }: Props) {
  const { slug } = await params;
  const story = await getPublishedByTypeAndSlug("opinion", slug);
  if (!story) notFound();
  void incrementArticleViews(story.id);
  const related = (
    await listPublishedStories({ type: "opinion", limit: 5 })
  ).filter((s) => s.id !== story.id);
  return <ArticleView story={story} related={related} />;
}
