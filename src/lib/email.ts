/** Brevo (Sendinblue) transactional email via REST API + branded HTML templates. */

export function emailConfigured() {
  return Boolean(process.env.BREVO_API_KEY && process.env.EMAIL_FROM);
}

export type SendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

function parseFrom(from: string): { name?: string; email: string } {
  const match = from.match(/^(.*?)\s*<([^>]+)>\s*$/);
  if (match) {
    const name = match[1]!.replace(/^["']|["']$/g, "").trim();
    return { name: name || undefined, email: match[2]!.trim() };
  }
  return { email: from.trim() };
}

function toRecipients(to: string | string[]): { email: string }[] {
  const list = Array.isArray(to) ? to : [to];
  return list.map((email) => ({ email: email.trim() })).filter((r) => r.email);
}

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}): Promise<SendEmailResult> {
  if (!emailConfigured()) {
    return {
      ok: false,
      error:
        "Email is not configured. Set BREVO_API_KEY and EMAIL_FROM in .env.local.",
    };
  }

  const recipients = toRecipients(opts.to);
  if (recipients.length === 0) {
    return { ok: false, error: "No recipients." };
  }

  const sender = parseFrom(process.env.EMAIL_FROM!);
  const body: Record<string, unknown> = {
    sender: sender.name
      ? { name: sender.name, email: sender.email }
      : { email: sender.email },
    to: recipients,
    subject: opts.subject,
    htmlContent: opts.html,
  };
  if (opts.text) body.textContent = opts.text;

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify(body),
    });

    const data = (await res.json().catch(() => ({}))) as {
      messageId?: string;
      message?: string;
      code?: string;
    };

    if (!res.ok) {
      return {
        ok: false,
        error: data.message || `Brevo error (${res.status})`,
      };
    }

    return { ok: true, id: data.messageId };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Email send failed",
    };
  }
}

export function siteUrl(path = "/") {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const fromVercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();
  const base = (
    fromEnv ||
    (fromVercel ? `https://${fromVercel}` : "http://localhost:3000")
  ).replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const GREEN = "#1b5c45";
const GREEN_DEEP = "#134536";
const PAPER = "#f7f4ef";
const INK = "#1a1f1c";
const MUTED = "#5a635e";
const LINE = "#d8ddd8";

function logoUrl() {
  return siteUrl("/brand/egigogo-mark.jpg");
}

function emailShell(opts: {
  preheader?: string;
  title: string;
  innerHtml: string;
  footerNote?: string;
  unsubscribeUrl?: string;
}) {
  const brand = "Egigogo Newspaper";
  const preheader = opts.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all">${escapeHtml(opts.preheader)}</div>`
    : "";
  const unsub = opts.unsubscribeUrl
    ? `<p style="margin:12px 0 0;font-size:12px;line-height:1.5;color:#8a938d">
        <a href="${escapeHtml(opts.unsubscribeUrl)}" style="color:${GREEN};text-decoration:underline">Unsubscribe</a>
        · Prefer fewer emails? You can leave the list anytime.
      </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:${PAPER};font-family:Georgia,'Times New Roman',serif">
  ${preheader}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};padding:28px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid ${LINE};border-radius:10px;overflow:hidden">
        <tr>
          <td style="background:linear-gradient(135deg,${GREEN} 0%,${GREEN_DEEP} 100%);background-color:${GREEN};padding:22px 28px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="52" valign="middle" style="padding-right:14px">
                  <img src="${logoUrl()}" width="44" height="44" alt="${brand}" style="display:block;border-radius:8px;border:0" />
                </td>
                <td valign="middle">
                  <p style="margin:0;font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#cfe6da">Egigogo</p>
                  <p style="margin:2px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:1.2;color:#ffffff;font-weight:600">Newspaper</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="height:4px;background:#c4a35a;font-size:0;line-height:0">&nbsp;</td>
        </tr>
        <tr>
          <td style="padding:28px 28px 8px;color:${INK}">
            ${opts.innerHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 28px 28px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${LINE}">
              <tr>
                <td style="padding-top:18px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:12px;line-height:1.55;color:${MUTED}">
                  <strong style="color:${INK}">${brand}</strong><br />
                  Truth. Integrity. Impact.
                  ${opts.footerNote ? `<br /><span style="display:inline-block;margin-top:6px">${opts.footerNote}</span>` : ""}
                  ${unsub}
                  <p style="margin:14px 0 0">
                    <a href="${siteUrl("/")}" style="color:${GREEN};text-decoration:none;font-weight:600">Read on the web →</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function ctaButton(label: string, url: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 10px">
  <tr>
    <td style="border-radius:6px;background:${GREEN}">
      <a href="${escapeHtml(url)}" style="display:inline-block;padding:14px 26px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.01em">${escapeHtml(label)}</a>
    </td>
  </tr>
</table>
<p style="margin:0;font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:12px;line-height:1.5;color:${MUTED};word-break:break-all">
  Or open this link:<br />
  <a href="${escapeHtml(url)}" style="color:${GREEN}">${escapeHtml(url)}</a>
</p>`;
}

/** Branded HTML shell for simple transactional mail (confirm, reset, etc.). */
export function brandedEmailHtml(opts: {
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  preheader?: string;
  footerNote?: string;
  unsubscribeUrl?: string;
}) {
  const cta =
    opts.ctaLabel && opts.ctaUrl
      ? ctaButton(opts.ctaLabel, opts.ctaUrl)
      : "";

  const inner = `
    <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;font-weight:600;color:${INK};font-family:Georgia,'Times New Roman',serif">${escapeHtml(opts.title)}</h1>
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.65;color:${MUTED}">${opts.bodyHtml}</div>
    ${cta}
  `;

  return emailShell({
    preheader: opts.preheader ?? opts.title,
    title: opts.title,
    innerHtml: inner,
    footerNote: opts.footerNote,
    unsubscribeUrl: opts.unsubscribeUrl,
  });
}

export type NewsletterStoryCard = {
  title: string;
  dek?: string | null;
  href: string;
  category?: string | null;
  byline?: string | null;
  imageUrl?: string | null;
};

/** Rich newsletter / morning brief layout with story cards. */
export function newsletterIssueHtml(opts: {
  subject: string;
  intro?: string;
  stories: NewsletterStoryCard[];
  unsubscribeUrl?: string;
}) {
  const intro = opts.intro?.trim()
    ? `<p style="margin:0 0 22px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:16px;line-height:1.65;color:${MUTED}">${escapeHtml(opts.intro.trim())}</p>`
    : "";

  const cards = opts.stories
    .map((story, i) => {
      const img = story.imageUrl
        ? `<td width="118" valign="top" style="padding-right:14px">
            <a href="${escapeHtml(story.href)}" style="text-decoration:none">
              <img src="${escapeHtml(story.imageUrl)}" width="104" height="78" alt="" style="display:block;width:104px;height:78px;object-fit:cover;border-radius:6px;border:1px solid ${LINE}" />
            </a>
          </td>`
        : "";
      const meta = [story.category, story.byline].filter(Boolean).join(" · ");
      return `<tr>
        <td style="padding:${i === 0 ? "0" : "18px"} 0 ${i === opts.stories.length - 1 ? "0" : "18px"};border-bottom:${i === opts.stories.length - 1 ? "0" : `1px solid ${LINE}`}">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              ${img}
              <td valign="top">
                ${meta ? `<p style="margin:0 0 6px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${GREEN}">${escapeHtml(meta)}</p>` : ""}
                <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:1.3;font-weight:600">
                  <a href="${escapeHtml(story.href)}" style="color:${INK};text-decoration:none">${escapeHtml(story.title)}</a>
                </p>
                ${
                  story.dek
                    ? `<p style="margin:0 0 10px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:14px;line-height:1.5;color:${MUTED}">${escapeHtml(story.dek)}</p>`
                    : ""
                }
                <a href="${escapeHtml(story.href)}" style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:13px;font-weight:700;color:${GREEN};text-decoration:none">Read story →</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
    })
    .join("");

  const storiesBlock = opts.stories.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 6px">${cards}</table>`
    : `<p style="margin:0;font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;color:${MUTED}">No stories in this brief.</p>`;

  const dateLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const inner = `
    <p style="margin:0 0 8px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${GREEN}">Daily briefing</p>
    <h1 style="margin:0 0 6px;font-size:28px;line-height:1.2;font-weight:600;color:${INK};font-family:Georgia,'Times New Roman',serif">${escapeHtml(opts.subject)}</h1>
    <p style="margin:0 0 20px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:13px;color:${MUTED}">${escapeHtml(dateLabel)}</p>
    ${intro}
    ${storiesBlock}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 0">
      <tr>
        <td style="border-radius:6px;background:${GREEN}">
          <a href="${siteUrl("/")}" style="display:inline-block;padding:13px 22px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none">Open Egigogo Newspaper</a>
        </td>
      </tr>
    </table>
  `;

  return emailShell({
    preheader:
      opts.intro?.trim() ||
      opts.stories[0]?.title ||
      "Your Egigogo Newspaper briefing",
    title: opts.subject,
    innerHtml: inner,
    footerNote: "You’re receiving this because you subscribed to our briefing.",
    unsubscribeUrl: opts.unsubscribeUrl,
  });
}
