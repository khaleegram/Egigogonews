import { AdSlotForm } from "@/components/cms/ad-slot-form";
import { listAdSlots } from "@/lib/ad-actions";
import { requireCmsPage } from "@/lib/cms-auth";

export const dynamic = "force-dynamic";

export default async function AdsPage() {
  await requireCmsPage(["admin"]);
  const slots = await listAdSlots();
  return (
    <>
      <h1>Ads</h1>
      <p style={{ color: "var(--ink-muted)", marginBottom: "1rem" }}>
        Four inventory slots. Leave inactive to hide.
      </p>
      {slots.map((slot) => (
        <AdSlotForm key={slot.slotKey} slot={slot} />
      ))}
    </>
  );
}
