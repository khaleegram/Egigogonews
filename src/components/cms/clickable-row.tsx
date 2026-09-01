"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent, ReactNode } from "react";

export function CmsClickableRow({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const router = useRouter();

  function go() {
    router.push(href);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTableRowElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      go();
    }
  }

  return (
    <tr
      className="cms-table__row-link"
      tabIndex={0}
      role="link"
      onClick={go}
      onKeyDown={onKeyDown}
    >
      {children}
    </tr>
  );
}
