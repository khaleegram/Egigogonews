"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { BrandLogo } from "@/components/site/brand-logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { SEED_CATEGORIES } from "@/lib/constants";
import {
  subscribePushAction,
  unsubscribePushAction,
} from "@/lib/push-actions";
import {
  ensurePushSubscription,
  getExistingPushSubscription,
} from "@/lib/pwa-client";

const SECTIONS = [
  { href: "/opinion", label: "Opinion" },
  { href: "/features", label: "Features" },
  { href: "/investigations", label: "Investigations" },
  { href: "/videos", label: "Videos" },
] as const;

function IconSearch({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M16.5 16.5 21 21"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconBell({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9.5a6 6 0 0 1 12 0c0 3.5 1.2 5 1.2 5H4.8S6 13 6 9.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M10 18.5a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMenu({ open, size = 18 }: { open: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      {open ? (
        <path
          d="M6 6l12 12M18 6 6 18"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path d="M4 7h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M4 12h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M4 17h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const searchId = useId();
  const navId = useId();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [lang, setLang] = useState("en");
  const [notifyOn, setNotifyOn] = useState(false);

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const saved = document.cookie.match(/(?:^|; )eg_lang=([^;]*)/);
    if (saved?.[1]) setLang(decodeURIComponent(saved[1]));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const w = window as Window & {
      googleTranslateElementInit?: () => void;
      google?: {
        translate?: {
          TranslateElement: new (
            opts: {
              pageLanguage: string;
              includedLanguages: string;
              autoDisplay: boolean;
            },
            id: string,
          ) => void;
        };
      };
    };

    w.googleTranslateElementInit = () => {
      if (!w.google?.translate) return;
      new w.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,ha,yo",
          autoDisplay: false,
        },
        "google_translate_element",
      );
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    if (lang && lang !== "en") {
      document.cookie = `googtrans=/en/${lang};path=/`;
      document.cookie = `googtrans=/en/${lang};path=/;domain=${window.location.hostname}`;
    } else {
      document.cookie = "googtrans=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = `googtrans=;path=/;domain=${window.location.hostname};expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }, [lang]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const sub = await getExistingPushSubscription();
        if (!cancelled) setNotifyOn(Boolean(sub));
      } catch {
        if (!cancelled) setNotifyOn(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleNotifications() {
    try {
      if (notifyOn) {
        const sub = await getExistingPushSubscription();
        if (sub) {
          await unsubscribePushAction(sub.endpoint);
          await sub.unsubscribe();
        }
        setNotifyOn(false);
        return;
      }
      const sub = await ensurePushSubscription();
      const json = sub.toJSON();
      const result = await subscribePushAction({
        endpoint: json.endpoint!,
        keys: {
          p256dh: json.keys!.p256dh!,
          auth: json.keys!.auth!,
        },
      });
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      setNotifyOn(true);
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Could not update notifications.",
      );
    }
  }

  function onLang(next: string) {
    setLang(next);
    document.cookie = `eg_lang=${encodeURIComponent(next)};path=/;max-age=31536000`;
    if (next === "en") {
      document.cookie = "googtrans=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } else {
      document.cookie = `googtrans=/en/${next};path=/`;
    }
    window.location.reload();
  }

  const links = [
    { href: "/", label: "Home", active: pathname === "/" },
    ...SEED_CATEGORIES.map((c) => ({
      href: `/category/${c.slug}`,
      label: c.name,
      active: pathname === `/category/${c.slug}`,
    })),
    ...SECTIONS.map((s) => ({
      href: s.href,
      label: s.label,
      active: pathname.startsWith(s.href),
    })),
  ];

  // Explicit two rows — keep every category visible, evenly split
  const mid = Math.ceil(links.length / 2);
  const rowOne = links.slice(0, mid);
  const rowTwo = links.slice(mid);

  return (
    <header
      className={
        open
          ? searchOpen
            ? "site-header is-searching is-menu-open"
            : "site-header is-menu-open"
          : searchOpen
            ? "site-header is-searching"
            : "site-header"
      }
    >
      <div className="site-header__bar">
        <BrandLogo variant="header" />

        <nav className="site-nav site-nav--rail" aria-label="Primary">
          <div className="site-nav__row">
            {rowOne.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={l.active ? "is-active" : undefined}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="site-nav__row">
            {rowTwo.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={l.active ? "is-active" : undefined}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="site-header__tools">
          <div id="google_translate_element" className="sr-only" aria-hidden />

          <label className="site-lang">
            <span className="sr-only">Language</span>
            <select
              value={lang}
              onChange={(e) => onLang(e.target.value)}
              aria-label="Language"
            >
              <option value="en">EN</option>
              <option value="ha">HA</option>
              <option value="yo">YO</option>
            </select>
          </label>

          <ThemeToggle />

          <button
            type="button"
            className={`site-icon-btn${notifyOn ? " is-on" : ""}`}
            aria-pressed={notifyOn}
            aria-label={
              notifyOn ? "Disable notifications" : "Enable notifications"
            }
            title={notifyOn ? "Disable notifications" : "Enable notifications"}
            onClick={() => {
              void toggleNotifications();
            }}
          >
            <IconBell />
          </button>

          <button
            type="button"
            className={`site-icon-btn${searchOpen ? " is-on" : ""}`}
            aria-expanded={searchOpen}
            aria-controls={searchId}
            aria-label={searchOpen ? "Close search" : "Open search"}
            onClick={() => {
              setSearchOpen((v) => !v);
              setOpen(false);
            }}
          >
            <IconSearch />
          </button>

          <button
            type="button"
            className={`site-icon-btn site-menu-btn${open ? " is-on" : ""}`}
            aria-expanded={open}
            aria-controls={navId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => {
              setOpen((v) => !v);
              setSearchOpen(false);
            }}
          >
            <IconMenu open={open} />
          </button>
        </div>
      </div>

      <div
        id={searchId}
        className={`site-search${searchOpen ? " is-open" : ""}`}
        hidden={!searchOpen}
      >
        <form
          className="site-search__form"
          action="/search"
          method="get"
          onSubmit={() => setSearchOpen(false)}
        >
          <IconSearch size={20} />
          <input
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search stories, topics, places…"
            aria-label="Search stories"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={searchOpen}
          />
          <button type="submit" className="btn">
            Search
          </button>
        </form>
      </div>

      <div
        id={navId}
        className={`site-nav-drawer${open ? " is-open" : ""}`}
        hidden={!open}
      >
        <nav className="site-nav-drawer__nav" aria-label="Mobile primary">
          <Link
            href="/login"
            className={
              pathname === "/login" || pathname.startsWith("/cms")
                ? "site-nav-drawer__login is-active"
                : "site-nav-drawer__login"
            }
          >
            Staff login
          </Link>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={l.active ? "is-active" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      {open ? (
        <button
          type="button"
          className="site-nav-scrim"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </header>
  );
}
