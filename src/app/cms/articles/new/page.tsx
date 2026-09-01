import { ArticleEditorForm } from "@/components/cms/article-editor-form";

export default function NewArticlePage() {
  return (
    <>
      <h1>New article</h1>
      <ArticleEditorForm mode="new" />
    </>
  );
}
