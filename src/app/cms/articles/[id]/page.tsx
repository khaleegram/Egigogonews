import { notFound } from "next/navigation";
import { ArticleEditorForm } from "@/components/cms/article-editor-form";
import { CmsShare } from "@/components/cms/cms-share";
import { getArticleForCms } from "@/lib/articles";
import { requireCmsPage } from "@/lib/cms-auth";

type Props = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: Props) {
  const staff = await requireCmsPage();
  const { id } = await params;
  const row = await getArticleForCms(id);
  if (!row) notFound();

  const { article, category } = row;
  if (staff.role === "reporter" && article.authorId !== staff.id) {
    notFound();
  }

  return (
    <>
      <h1>Edit article</h1>
      <CmsShare
        title={article.title}
        categorySlug={category.slug}
        articleSlug={article.slug}
        status={article.status}
      />
      <ArticleEditorForm
        mode="edit"
        role={staff.role}
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
