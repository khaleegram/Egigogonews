import { ArchiveBrowser } from "@/components/site/archive-browser";
import { listPublishedStories } from "@/lib/articles";

// On-demand only: traffic must not regenerate pages (crawlers were waking the
// DB); CMS/publish writes call revalidatePath() so content still updates instantly.
export const revalidate = false;

export default async function ArchivePage() {
  const stories = await listPublishedStories({ limit: 60 });

  return (
    <div className="page-wrap">
      <h1 className="page-title">Archive</h1>
      <ArchiveBrowser stories={stories} />
    </div>
  );
}
