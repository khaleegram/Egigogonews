import Link from "next/link";

/** Temporary bare chrome — replace when you design one real page. */
export function StubShell({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <main style={{ fontFamily: "system-ui", padding: 16, maxWidth: 720 }}>
      <p>
        <Link href="/">Egigogo Newspaper</Link> · stub · no UI skin yet
      </p>
      <h1>{title}</h1>
      {children}
    </main>
  );
}
