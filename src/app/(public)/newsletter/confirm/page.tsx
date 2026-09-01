import { confirmNewsletter } from "@/lib/newsletter-actions";

export const dynamic = "force-dynamic";

export default async function NewsletterConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token
    ? await confirmNewsletter(token)
    : { ok: false as const, error: "Missing token" };

  return (
    <div className="page-wrap prose-page">
      <h1 className="page-title">
        {result.ok ? "You are subscribed" : "Confirmation failed"}
      </h1>
      <p>
        {result.ok
          ? "Thanks for confirming. You will receive the Egigogo Newspaper briefing."
          : result.error ||
            "If this link is invalid or expired, request a new confirmation from the footer form."}
      </p>
    </div>
  );
}
