import { StoryIndex } from "@/components/site/story-index";
import { listPublishedStories } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function OpinionIndexPage() {
  const stories = await listPublishedStories({ type: "opinion", limit: 40 });
  return <StoryIndex title="Opinion" stories={stories} />;
}
