import { BreakingBar } from "@/components/site/breaking";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { PwaInstallBanner } from "@/components/site/pwa-install";
import { getActiveBreaking } from "@/lib/articles";

// On-demand only: traffic must never regenerate a page — crawler hits were waking
// Neon ~75x/day and burning its compute quota. CMS and publish writes call
// revalidatePath(), which refreshes these pages instantly.
export const revalidate = false;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breaking = await getActiveBreaking();

  return (
    <>
      <SiteHeader />
      <BreakingBar
        headline={breaking?.headline ?? ""}
        href={breaking?.href ?? "/"}
        active={Boolean(breaking)}
      />
      <main>{children}</main>
      <SiteFooter />
      <PwaInstallBanner />
    </>
  );
}
