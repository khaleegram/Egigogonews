"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  headline: string;
  href: string;
  active?: boolean;
};

export function BreakingBar({ headline, href, active = true }: Props) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!active) return;
    setHidden(sessionStorage.getItem("eg_breaking_hide") === "1");
  }, [active]);

  if (!active || hidden) return null;

  return (
    <div className="breaking" role="status">
      <div className="breaking__inner">
        <span className="breaking__label">Breaking</span>
        <Link href={href} className="breaking__headline">
          {headline}
        </Link>
        <button
          type="button"
          className="breaking__close"
          aria-label="Hide breaking news for this session"
          onClick={() => {
            sessionStorage.setItem("eg_breaking_hide", "1");
            setHidden(true);
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
