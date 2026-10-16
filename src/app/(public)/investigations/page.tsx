import { StoryIndex } from "@/components/site/story-index";
import { listPublishedStories } from "@/lib/articles";

// On-demand only: traffic must not regenerate pages (crawlers were waking the
// DB); CMS/publish writes call revalidatePath() so content still updates instantly.
export const revalidate = false;

export default async function InvestigationsIndexPage() {
  const stories = await listPublishedStories({
    type: "investigative",
    limit: 40,
  });
  return <StoryIndex title="Investigations" stories={stories} />;
}
