import Link from "next/link";
import { listCmsArticles } from "@/lib/articles";
import { auth } from "@/lib/auth";
import { formatPublishedLabel } from "@/lib/story";

export default async function CmsArticlesPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const authorId =
    role === "reporter" ? session?.user?.id : undefined;

  const rows = await listCmsArticles({ authorId });

  return (
    <>
      <h1>Articles</h1>
      <p style={{ marginBottom: "1rem" }}>
        <Link href="/cms/articles/new" className="btn">
          New article
        </Link>
      </p>
      <div className="cms-table-wrap"><table className="cms-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Status</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4}>No articles yet.</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <Link href={`/cms/articles/${row.id}`}>{row.title}</Link>
                </td>
                <td>{row.type}</td>
                <td>{row.status}</td>
                <td>{formatPublishedLabel(row.updatedAt)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table></div>
    </>
  );
}
