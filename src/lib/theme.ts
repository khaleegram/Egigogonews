export const THEME_STORAGE_KEY = "egigogo-theme";

export type ThemeMode = "light" | "dark";

export function resolveTheme(stored: string | null): ThemeMode {
  if (stored === "light" || stored === "dark") return stored;
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
}

export function applyTheme(theme: ThemeMode) {
  document.documentElement.setAttribute("data-theme", theme);
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  const color = theme === "dark" ? "#0e1311" : "#1b5c45";
  metas.forEach((m) => m.setAttribute("content", color));
}

/** Inline boot script — runs before paint to avoid flash. */
export const themeBootScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);var c=t==="dark"?"#0e1311":"#1b5c45";var m=document.querySelectorAll('meta[name="theme-color"]');for(var i=0;i<m.length;i++)m[i].setAttribute("content",c);}catch(e){}})();`;
