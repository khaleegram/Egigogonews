export type StaffRole = "admin" | "editor" | "reporter";

/** Client-safe CMS nav visibility (no auth/db imports). */
export function canSeeCmsLink(role: StaffRole, href: string): boolean {
  if (role === "admin") return true;
  if (role === "editor") {
    return ![
      "/cms/users",
      "/cms/settings",
      "/cms/categories",
      "/cms/ads",
      "/cms/newsletter",
    ].includes(href);
  }
  return ["/cms", "/cms/articles", "/cms/articles/new", "/cms/media"].includes(
    href,
  );
}
