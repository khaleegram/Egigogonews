import { StoryIndex } from "@/components/site/story-index";
import { listPublishedStories } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function VideosPage() {
  const stories = await listPublishedStories({ withVideo: true, limit: 40 });
  return (
    <StoryIndex
      title="Videos"
      stories={stories}
      empty="No video stories yet."
    />
  );
}
