export type StaffRole = "admin" | "editor" | "reporter";

const EDITOR_BLOCKED = [
  "/cms/users",
  "/cms/settings",
  "/cms/categories",
  "/cms/ads",
  "/cms/newsletter",
] as const;

/** Client-safe CMS nav visibility (no auth/db imports). */
export function canSeeCmsLink(role: StaffRole, href: string): boolean {
  return canAccessCmsPath(role, href);
}

/**
 * Server + client path guard. Matches nav rules and blocks deep links.
 * Article detail/preview/new are under /cms/articles/*.
 */
export function canAccessCmsPath(role: StaffRole, pathname: string): boolean {
  const path = pathname.split("?")[0]?.replace(/\/$/, "") || "/";
  if (path === "/cms") return true;

  if (role === "admin") return true;

  if (role === "editor") {
    return !EDITOR_BLOCKED.some(
      (blocked) => path === blocked || path.startsWith(`${blocked}/`),
    );
  }

  // reporter: dashboard, own articles workflow, media library only
  if (path === "/cms/articles" || path.startsWith("/cms/articles/")) {
    return true;
  }
  if (path === "/cms/media" || path.startsWith("/cms/media/")) {
    return true;
  }
  return false;
}

export function roleCanPublish(role: StaffRole): boolean {
  return role === "admin" || role === "editor";
}

export function roleCanManageStaff(role: StaffRole): boolean {
  return role === "admin";
}
