import Link from "next/link";
import { listTips } from "@/lib/tip-actions";
import { formatPublishedLabel } from "@/lib/story";

export const dynamic = "force-dynamic";

export default async function TipsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status =
    sp.status === "new" || sp.status === "in_progress" || sp.status === "closed"
      ? sp.status
      : undefined;
  const rows = await listTips(status);

  return (
    <>
      <h1>Tips</h1>
      <p style={{ marginBottom: "1rem" }}>
        <Link href="/cms/tips">All</Link>
        {" · "}
        <Link href="/cms/tips?status=new">New</Link>
        {" · "}
        <Link href="/cms/tips?status=in_progress">In progress</Link>
        {" · "}
        <Link href="/cms/tips?status=closed">Closed</Link>
      </p>
      <div className="cms-table-wrap"><table className="cms-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Contact</th>
            <th>Snippet</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4}>No tips.</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                <td>{formatPublishedLabel(row.createdAt)}</td>
                <td>
                  <Link href={`/cms/tips/${row.id}`}>{row.contact}</Link>
                </td>
                <td>{row.message.slice(0, 80)}</td>
                <td>{row.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table></div>
    </>
  );
}
