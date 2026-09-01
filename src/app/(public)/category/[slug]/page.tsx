import { StoryIndex } from "@/components/site/story-index";
import { SEED_CATEGORIES } from "@/lib/constants";
import { listPublishedStories } from "@/lib/articles";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = SEED_CATEGORIES.find((c) => c.slug === slug);
  if (!cat) notFound();
  const stories = await listPublishedStories({
    categorySlug: slug,
    limit: 40,
  });
  return <StoryIndex title={cat.name} stories={stories} />;
}
