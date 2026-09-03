/** Map DB / unknown errors to short, non-technical UI messages. Never leak SQL. */
export function publicActionError(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  const parts: string[] = [];
  let cur: unknown = err;
  for (let i = 0; i < 4 && cur; i++) {
    if (cur instanceof Error) {
      parts.push(cur.message);
      cur = (cur as Error & { cause?: unknown }).cause;
    } else if (typeof cur === "string") {
      parts.push(cur);
      break;
    } else {
      break;
    }
  }
  const blob = parts.join("\n").toLowerCase();

  if (
    blob.includes("articles_slug") ||
    blob.includes("unique") ||
    blob.includes("duplicate key")
  ) {
    return "Could not save because of a URL conflict. Try saving again.";
  }
  if (
    blob.includes("foreign key") ||
    blob.includes("author_id") ||
    blob.includes("uploaded_by")
  ) {
    return "Your session is out of date. Sign out, sign back in, then try again.";
  }
  if (blob.includes("value too long") || blob.includes("varchar")) {
    return "One of the fields is too long. Shorten the title or summary and try again.";
  }
  if (
    blob.includes("etimedout") ||
    blob.includes("enetunreach") ||
    blob.includes("econnreset") ||
    blob.includes("fetch failed") ||
    blob.includes("connecting to database") ||
    blob.includes("timeout")
  ) {
    return "The database is waking up. Wait a few seconds and try again.";
  }

  // Never return raw query / params / stack to the UI.
  if (
    blob.includes("failed query") ||
    blob.includes("insert into") ||
    blob.includes("update ") ||
    blob.includes(" params:")
  ) {
    return fallback;
  }

  const top = err instanceof Error ? err.message.trim() : "";
  if (top && top.length < 140 && !/select |insert |update |delete /i.test(top)) {
    return top;
  }
  return fallback;
}
