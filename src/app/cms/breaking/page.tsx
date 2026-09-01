import { getBreaking } from "@/lib/breaking-actions";
import { BreakingForm } from "@/components/cms/breaking-form";

export const dynamic = "force-dynamic";

export default async function BreakingPage() {
  const row = await getBreaking();
  return (
    <>
      <h1>Breaking</h1>
      <p style={{ color: "var(--ink-muted)", marginBottom: "1rem" }}>
        Singleton sitewide bar. Activating sends one push when configured.
      </p>
      <BreakingForm
        initial={{
          headline: row?.headline ?? "",
          url: row?.url ?? "",
          active: row?.active ?? false,
        }}
      />
      {row?.updatedAt ? (
        <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "var(--ink-muted)" }}>
          Last updated {row.updatedAt.toISOString()}
        </p>
      ) : null}
    </>
  );
}
