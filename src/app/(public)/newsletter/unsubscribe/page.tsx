import { unsubscribeNewsletter } from "@/lib/newsletter-actions";

export const dynamic = "force-dynamic";

export default async function NewsletterUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token
    ? await unsubscribeNewsletter(token)
    : { ok: false as const, error: "Missing token" };

  return (
    <div className="page-wrap prose-page">
      <h1 className="page-title">
        {result.ok ? "You have been unsubscribed" : "Unsubscribe failed"}
      </h1>
      <p>
        {result.ok
          ? "You will no longer receive the Egigogo Newspaper briefing."
          : result.error || "This unsubscribe link is invalid or expired."}
      </p>
    </div>
  );
}
