"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { logoutAction } from "@/lib/auth-actions";
import { canSeeCmsLink, type StaffRole } from "@/lib/cms-access";

type NavItem = {
  href: string;
  label: string;
  icon: "home" | "articles" | "new" | "media" | "tips" | "more";
};

const PRIMARY: NavItem[] = [
  { href: "/cms", label: "Home", icon: "home" },
  { href: "/cms/articles", label: "Articles", icon: "articles" },
  { href: "/cms/media", label: "Media", icon: "media" },
  { href: "/cms/tips", label: "Tips", icon: "tips" },
];

const SECONDARY = [
  ["/cms/articles/new", "New article"],
  ["/cms/breaking", "Breaking"],
  ["/cms/comments", "Comments"],
  ["/cms/ads", "Ads"],
  ["/cms/newsletter", "Newsletter"],
  ["/cms/categories", "Categories"],
  ["/cms/users", "Users"],
  ["/cms/settings", "Settings"],
] as const;

const DESKTOP_LINKS = [
  ["/cms", "Dashboard"],
  ["/cms/articles", "Articles"],
  ["/cms/articles/new", "New article"],
  ["/cms/breaking", "Breaking"],
  ["/cms/tips", "Tips"],
  ["/cms/comments", "Comments"],
  ["/cms/media", "Media"],
  ["/cms/ads", "Ads"],
  ["/cms/newsletter", "Newsletter"],
  ["/cms/categories", "Categories"],
  ["/cms/users", "Users"],
  ["/cms/settings", "Settings"],
] as const;

function NavIcon({ name }: { name: NavItem["icon"] }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
        </svg>
      );
    case "articles":
      return (
        <svg {...common}>
          <path d="M7 4h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2Z" />
          <path d="M9 9h6M9 13h6" />
        </svg>
      );
    case "new":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "media":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="11" r="1.5" />
          <path d="m21 16-4.5-4.5L9 19" />
        </svg>
      );
    case "tips":
      return (
        <svg {...common}>
          <path d="M12 3a6 6 0 0 0-3.5 10.8V16h7v-2.2A6 6 0 0 0 12 3Z" />
          <path d="M10 19h4M11 22h2" />
        </svg>
      );
    case "more":
      return (
        <svg {...common}>
          <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}

function isPrimaryActive(pathname: string, href: string) {
  if (href === "/cms") return pathname === "/cms";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CmsNav({
  role,
  staffName,
}: {
  role?: StaffRole | null;
  staffName?: string | null;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const sheetId = useId();

  const primary = PRIMARY.filter((item) =>
    role ? canSeeCmsLink(role, item.href) : true,
  );
  const secondary = SECONDARY.filter(([href]) =>
    role ? canSeeCmsLink(role, href) : true,
  );
  const desktopLinks = role
    ? DESKTOP_LINKS.filter(([href]) => canSeeCmsLink(role, href))
    : DESKTOP_LINKS;

  const moreActive =
    moreOpen ||
    secondary.some(
      ([href]) => pathname === href || pathname.startsWith(`${href}/`),
    );

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [moreOpen]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="cms-nav cms-nav--desktop">
        <p className="cms-nav__brand">Egigogo CMS</p>

        {staffName ? (
          <p className="cms-nav__meta">
            Signed in as {staffName}
            {role ? ` (${role})` : ""}
          </p>
        ) : null}

        <nav aria-label="CMS">
          {desktopLinks.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? "is-active" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="cms-nav__foot">
          <div className="cms-nav__theme">
            <ThemeToggle />
            <span>Theme</span>
          </div>
          <Link href="/">View site</Link>
          <span aria-hidden> · </span>
          <form action={logoutAction}>
            <button type="submit" className="cms-nav__logout">
              Log out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile app chrome */}
      <header className="cms-appbar">
        <p className="cms-appbar__brand">Egigogo CMS</p>
        <div className="cms-appbar__end">
          <ThemeToggle />
          {staffName ? (
            <p className="cms-appbar__meta">
              {staffName}
              {role ? ` · ${role}` : ""}
            </p>
          ) : null}
        </div>
      </header>

      <nav className="cms-tabbar" aria-label="CMS">
        {primary.map((item) => {
          const active = isPrimaryActive(pathname, item.href) && !moreOpen;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`cms-tabbar__item${active ? " is-active" : ""}`}
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          className={`cms-tabbar__item${moreActive ? " is-active" : ""}`}
          aria-expanded={moreOpen}
          aria-controls={sheetId}
          onClick={() => setMoreOpen((v) => !v)}
        >
          <NavIcon name="more" />
          <span>More</span>
        </button>
      </nav>

      <div
        className={`cms-sheet${moreOpen ? " is-open" : ""}`}
        aria-hidden={!moreOpen}
      >
        <button
          type="button"
          className="cms-sheet__backdrop"
          aria-label="Close menu"
          tabIndex={moreOpen ? 0 : -1}
          onClick={() => setMoreOpen(false)}
        />
        <div
          id={sheetId}
          className="cms-sheet__panel"
          role="dialog"
          aria-modal="true"
          aria-label="More CMS tools"
        >
          <div className="cms-sheet__handle" aria-hidden />
          <p className="cms-sheet__title">More</p>
          <div className="cms-sheet__links">
            {secondary.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={
                  pathname === href || pathname.startsWith(`${href}/`)
                    ? "is-active"
                    : undefined
                }
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="cms-sheet__foot">
            <Link href="/">View site</Link>
            <form action={logoutAction}>
              <button type="submit" className="cms-nav__logout">
                Log out
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
