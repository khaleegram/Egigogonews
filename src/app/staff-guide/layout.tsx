import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff manual",
  description:
    "Internal guide for publishing on Egigogo Newspaper — login, roles, articles, photos, and the CMS.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function StaffGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="staff-guide-root">{children}</div>;
}
