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
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
