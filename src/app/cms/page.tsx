import Link from "next/link";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { CmsClickableRow } from "@/components/cms/clickable-row";
import { getDb } from "@/db";
import { articles, comments, tips } from "@/db/schema";
import { getStaff } from "@/lib/cms-auth";
import { formatPublishedLabel } from "@/lib/story";

export const dynamic = "force-dynamic";

export default async function CmsDashboardPage() {
  const staff = await getStaff();
  const db = getDb();

  const authorFilter =
    staff?.role === "reporter" && staff.id
      ? eq(articles.authorId, staff.id)
      : undefined;

  const [drafts] = await db
    .select({ n: count() })
    .from(articles)
    .where(
      authorFilter
        ? and(eq(articles.status, "draft"), authorFilter)
        : eq(articles.status, "draft"),
    );

  const [inReview] = await db
    .select({ n: count() })
    .from(articles)
    .where(
      authorFilter
        ? and(eq(articles.status, "in_review"), authorFilter)
        : eq(articles.status, "in_review"),
    );

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [publishedToday] = await db
    .select({ n: count() })
    .from(articles)
    .where(
      and(
        eq(articles.status, "published"),
        gte(articles.publishedAt, startOfDay),
      ),
    );

  const [newTips] = await db
    .select({ n: count() })
    .from(tips)
    .where(eq(tips.status, "new"));

  const [pendingComments] = await db
    .select({ n: count() })
    .from(comments)
    .where(eq(comments.status, "pending"));

  const recentQuery = db
    .select({
      id: articles.id,
      title: articles.title,
      status: articles.status,
      updatedAt: articles.updatedAt,
    })
    .from(articles)
    .orderBy(desc(articles.updatedAt))
    .limit(10);

  const recent = authorFilter
    ? await db
        .select({
          id: articles.id,
          title: articles.title,
          status: articles.status,
          updatedAt: articles.updatedAt,
        })
        .from(articles)
        .where(authorFilter)
        .orderBy(desc(articles.updatedAt))
        .limit(10)
    : await recentQuery;

  return (
    <>
      <h1>Dashboard</h1>
      <div className="cms-stat-grid">
        <div className="cms-stat">
          <strong>{drafts?.n ?? 0}</strong>
          <span>Drafts</span>
        </div>
        <div className="cms-stat">
          <strong>{inReview?.n ?? 0}</strong>
          <span>In review</span>
        </div>
        <div className="cms-stat">
          <strong>{publishedToday?.n ?? 0}</strong>
          <span>Published today</span>
        </div>
        {staff?.role !== "reporter" ? (
          <>
            <div className="cms-stat">
              <strong>{newTips?.n ?? 0}</strong>
              <span>New tips</span>
            </div>
            <div className="cms-stat">
              <strong>{pendingComments?.n ?? 0}</strong>
              <span>Pending comments</span>
            </div>
          </>
        ) : null}
      </div>
      <p>
        <Link href="/cms/articles/new" className="btn">
          New article
        </Link>
      </p>
      <h2
        style={{
          marginTop: "2rem",
          fontFamily: "var(--font-display), Georgia, serif",
        }}
      >
        Recent
      </h2>
      <div className="cms-table-wrap"><table className="cms-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {recent.length === 0 ? (
            <tr>
              <td colSpan={3}>No articles yet.</td>
            </tr>
          ) : (
            recent.map((row) => (
              <CmsClickableRow
                key={row.id}
                href={`/cms/articles/${row.id}`}
              >
                <td>{row.title}</td>
                <td>{row.status}</td>
                <td>{formatPublishedLabel(row.updatedAt)}</td>
              </CmsClickableRow>
            ))
          )}
        </tbody>
      </table></div>
    </>
  );
}
