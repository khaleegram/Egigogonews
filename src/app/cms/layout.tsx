import { CmsNav } from "@/components/cms/nav";
import { getStaff } from "@/lib/cms-auth";

export default async function CmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await getStaff();

  return (
    <div className="cms-shell">
      <CmsNav role={staff?.role ?? null} staffName={staff?.name ?? null} />
      <div className="cms-main">{children}</div>
    </div>
  );
}
