"use client";

import { useEffect, useState } from "react";
import {
  THEME_STORAGE_KEY,
  applyTheme,
  resolveTheme,
  type ThemeMode,
} from "@/lib/theme";

function IconSun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M5.2 18.8l1.6-1.6M17.2 6.8l1.6-1.6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16.5 3.5A8.5 8.5 0 1 0 20.5 14 7 7 0 0 1 16.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const current = resolveTheme(localStorage.getItem(THEME_STORAGE_KEY));
    applyTheme(current);
    setTheme(current);
    setReady(true);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystem = () => {
      if (localStorage.getItem(THEME_STORAGE_KEY)) return;
      const next = mq.matches ? "dark" : "light";
      applyTheme(next);
      setTheme(next);
    };
    mq.addEventListener("change", onSystem);

    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_STORAGE_KEY) return;
      const next = resolveTheme(e.newValue);
      applyTheme(next);
      setTheme(next);
    };
    window.addEventListener("storage", onStorage);

    return () => {
      mq.removeEventListener("change", onSystem);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  function toggle() {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
    setTheme(next);
  }

  const dark = theme === "dark";

  return (
    <button
      type="button"
      className={`site-icon-btn${dark ? " is-on" : ""}`}
      aria-pressed={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      onClick={toggle}
      style={ready ? undefined : { visibility: "hidden" }}
    >
      {dark ? <IconSun /> : <IconMoon />}
    </button>
  );
}
