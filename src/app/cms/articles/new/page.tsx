import { ArticleEditorForm } from "@/components/cms/article-editor-form";
import { requireCmsPage } from "@/lib/cms-auth";

export default async function NewArticlePage() {
  const staff = await requireCmsPage();

  return (
    <>
      <h1>New article</h1>
      <ArticleEditorForm mode="new" role={staff.role} />
    </>
  );
}
