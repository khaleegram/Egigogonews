import { notFound } from "next/navigation";
import { ArticleEditorForm } from "@/components/cms/article-editor-form";
import { getArticleForCms } from "@/lib/articles";

type Props = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  const row = await getArticleForCms(id);
  if (!row) notFound();

  const { article, category } = row;

  return (
    <>
      <h1>Edit article</h1>
      <ArticleEditorForm
        mode="edit"
        initial={{
          id: article.id,
          status: article.status,
          type: article.type,
          title: article.title,
          slug: article.slug,
          dek: article.dek ?? "",
          byline: article.bylineName ?? "",
          categorySlug: category.slug,
          bodyHtml: article.body ?? "",
          location: article.location ?? "",
          videoEmbedUrl: article.videoEmbedUrl ?? "",
          audioUrl: article.audioUrl ?? "",
          heroImageUrl: article.heroImageUrl ?? "",
          heroImageAlt: article.heroImageAlt ?? "",
          featured: article.featured,
          sponsored: article.sponsored,
          seoTitle: article.seoTitle ?? "",
          seoDescription: article.seoDescription ?? "",
        }}
      />
    </>
  );
}
