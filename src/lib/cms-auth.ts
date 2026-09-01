import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  canAccessCmsPath,
  canSeeCmsLink,
  roleCanPublish,
  type StaffRole,
} from "@/lib/cms-access";

export type { StaffRole };
export { canSeeCmsLink, canAccessCmsPath, roleCanPublish };

export type StaffUser = {
  id: string;
  role: StaffRole;
  name: string;
  email: string;
};

export async function getStaff(): Promise<StaffUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const role = (session.user as { role?: string }).role;
  if (!role || !["admin", "editor", "reporter"].includes(role)) return null;
  return {
    id: session.user.id,
    role: role as StaffRole,
    name: session.user.name ?? "Staff",
    email: session.user.email ?? "",
  };
}

export async function requireStaff(
  roles?: StaffRole[],
): Promise<StaffUser | { error: string }> {
  const staff = await getStaff();
  if (!staff) return { error: "Sign in required" };
  if (roles && !roles.includes(staff.role)) {
    return { error: "You do not have permission for this action" };
  }
  return staff;
}

export function isStaff(
  value: StaffUser | { error: string },
): value is StaffUser {
  return !("error" in value);
}

/** Redirect unauthenticated / wrong-role users away from a CMS page. */
export async function requireCmsPage(roles?: StaffRole[]): Promise<StaffUser> {
  const staff = await getStaff();
  if (!staff) redirect("/login?callbackUrl=/cms");
  if (roles && !roles.includes(staff.role)) redirect("/cms");
  return staff;
}
