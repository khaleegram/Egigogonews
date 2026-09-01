import { StoryIndex } from "@/components/site/story-index";
import { listPublishedStories } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function FeaturesIndexPage() {
  const stories = await listPublishedStories({ type: "feature", limit: 40 });
  return <StoryIndex title="Features" stories={stories} />;
}
