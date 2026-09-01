import { BreakingBar } from "@/components/site/breaking";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { PwaInstallBanner } from "@/components/site/pwa-install";
import { getActiveBreaking } from "@/lib/articles";

export const dynamic = "force-dynamic";

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
