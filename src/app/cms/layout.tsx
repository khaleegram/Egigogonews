import { redirect } from "next/navigation";
import { CmsNav } from "@/components/cms/nav";
import { getStaff } from "@/lib/cms-auth";

export default async function CmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await getStaff();
  if (!staff) {
    redirect("/login?callbackUrl=/cms");
  }

  return (
    <div className="cms-shell">
      <CmsNav role={staff.role} staffName={staff.name} />
      <div className="cms-main">{children}</div>
    </div>
  );
}
