/** Brevo (Sendinblue) transactional email via REST API. */

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

/** Branded HTML shell for transactional mail (confirm, reset, etc.). */
export function brandedEmailHtml(opts: {
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}) {
  const brand = "Egigogo Newspaper";
  const cta =
    opts.ctaLabel && opts.ctaUrl
      ? `<p style="margin:28px 0 8px">
          <a href="${opts.ctaUrl}" style="display:inline-block;background:#1b5c45;color:#fff;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:0.02em;padding:14px 22px;border-radius:4px">${opts.ctaLabel}</a>
        </p>
        <p style="margin:0;font-size:13px;color:#5a635e;word-break:break-all">Or open this link:<br/><a href="${opts.ctaUrl}" style="color:#1b5c45">${opts.ctaUrl}</a></p>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#eef1ef;font-family:Georgia,'Times New Roman',serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1ef;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #d5dcd7;border-radius:6px;overflow:hidden">
        <tr><td style="background:#1b5c45;padding:18px 24px">
          <p style="margin:0;font-family:system-ui,-apple-system,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#e8f2ed">${brand}</p>
        </td></tr>
        <tr><td style="padding:28px 24px 32px;color:#1a1f1c">
          <h1 style="margin:0 0 14px;font-size:22px;line-height:1.25;font-weight:600">${opts.title}</h1>
          <div style="font-family:system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.55;color:#3a433e">${opts.bodyHtml}</div>
          ${cta}
        </td></tr>
      </table>
      <p style="margin:16px 0 0;font-family:system-ui,-apple-system,sans-serif;font-size:12px;color:#7a857f">Truth. Integrity. Impact.</p>
    </td></tr>
  </table>
</body>
</html>`;
}
