import Link from "next/link";
import { notFound } from "next/navigation";
import { TipStatusForm } from "@/components/cms/tip-status-form";
import { getTip } from "@/lib/tip-actions";

export const dynamic = "force-dynamic";

export default async function TipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tip = await getTip(id);
  if (!tip) notFound();

  return (
    <>
      <h1>Tip</h1>
      <p>
        <Link href="/cms/tips">← Tips</Link>
      </p>
      <dl style={{ margin: "1rem 0", lineHeight: 1.7 }}>
        <dt>Name</dt>
        <dd>{tip.name || "—"}</dd>
        <dt>Contact</dt>
        <dd>{tip.contact}</dd>
        <dt>Location</dt>
        <dd>{tip.location || "—"}</dd>
        <dt>Message</dt>
        <dd style={{ whiteSpace: "pre-wrap" }}>{tip.message}</dd>
        {tip.imageUrl ? (
          <>
            <dt>Image</dt>
            <dd>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={tip.imageUrl} alt="" style={{ maxWidth: "20rem" }} />
            </dd>
          </>
        ) : null}
      </dl>
      <TipStatusForm id={tip.id} initial={tip.status} />
      <p style={{ marginTop: "1.5rem" }}>
        <Link href={`/cms/articles/new?tipId=${tip.id}`} className="btn">
          Open new article
        </Link>
      </p>
    </>
  );
}
