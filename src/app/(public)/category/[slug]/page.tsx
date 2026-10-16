import { StoryIndex } from "@/components/site/story-index";
import { SEED_CATEGORIES } from "@/lib/constants";
import { listPublishedStories } from "@/lib/articles";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

// On-demand only: traffic must not regenerate pages (crawlers were waking the
// DB); CMS/publish writes call revalidatePath() so content still updates instantly.
export const revalidate = false;

/** Required for ISR — without this every category view queries the DB. */
export function generateStaticParams() {
  return SEED_CATEGORIES.map((c) => ({ slug: c.slug }));
}

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
