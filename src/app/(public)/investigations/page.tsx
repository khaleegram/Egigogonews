import { StoryIndex } from "@/components/site/story-index";
import { listPublishedStories } from "@/lib/articles";

export const revalidate = 180;

export default async function InvestigationsIndexPage() {
  const stories = await listPublishedStories({
    type: "investigative",
    limit: 40,
  });
  return <StoryIndex title="Investigations" stories={stories} />;
}
