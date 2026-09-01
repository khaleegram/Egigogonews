import Link from "next/link";
import {
  approveComment,
  listCommentsForModeration,
  rejectComment,
} from "@/lib/comment-actions";
import { formatPublishedLabel } from "@/lib/story";

export const dynamic = "force-dynamic";

export default async function CommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status =
    sp.status === "approved" || sp.status === "rejected" || sp.status === "pending"
      ? sp.status
      : "pending";
  const rows = await listCommentsForModeration(status);

  async function approveAction(formData: FormData) {
    "use server";
    await approveComment(String(formData.get("id")));
  }
  async function rejectAction(formData: FormData) {
    "use server";
    await rejectComment(String(formData.get("id")));
  }

  return (
    <>
      <h1>Comments</h1>
      <p style={{ marginBottom: "1rem" }}>
        <Link href="/cms/comments?status=pending">Pending</Link>
        {" · "}
        <Link href="/cms/comments?status=approved">Approved</Link>
        {" · "}
        <Link href="/cms/comments?status=rejected">Rejected</Link>
      </p>
      <div className="cms-table-wrap"><table className="cms-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Article</th>
            <th>Name</th>
            <th>Snippet</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5}>No comments.</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                <td>{formatPublishedLabel(row.createdAt)}</td>
                <td>
                  <Link href={`/cms/articles/${row.articleId}`}>
                    {row.articleTitle}
                  </Link>
                </td>
                <td>{row.displayName}</td>
                <td>{row.body.slice(0, 80)}</td>
                <td>
                  {status === "pending" ? (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <form action={approveAction}>
                        <input type="hidden" name="id" value={row.id} />
                        <button type="submit" className="btn">
                          Approve
                        </button>
                      </form>
                      <form action={rejectAction}>
                        <input type="hidden" name="id" value={row.id} />
                        <button type="submit" className="btn btn--ghost">
                          Reject
                        </button>
                      </form>
                    </div>
                  ) : (
                    row.status
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table></div>
    </>
  );
}
