import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/email";

function origin() {
  return siteUrl("/").replace(/\/$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const base = origin();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/cms/",
          "/cms",
          "/login",
          "/forgot-password",
          "/reset-password",
          "/api/",
          "/newsletter/",
          "/offline.html",
          "/sw.js",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/cms/", "/api/", "/login"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base.replace(/^https?:\/\//, ""),
  };
}
