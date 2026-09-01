import { emailConfigured } from "@/lib/email";
import { pushConfigured } from "@/lib/push";
import { r2Configured } from "@/lib/r2";
import { getSiteSettings, saveSiteSettings } from "@/lib/settings-actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { settings, configured } = await getSiteSettings();

  async function saveAction(formData: FormData) {
    "use server";
    await saveSiteSettings({
      siteName: String(formData.get("siteName") ?? ""),
      tagline: String(formData.get("tagline") ?? ""),
      whatsappChannelUrl: String(formData.get("whatsappChannelUrl") ?? ""),
      facebookUrl: String(formData.get("facebookUrl") ?? ""),
      twitterUrl: String(formData.get("twitterUrl") ?? ""),
      instagramUrl: String(formData.get("instagramUrl") ?? ""),
      youtubeUrl: String(formData.get("youtubeUrl") ?? ""),
      contactEmail: String(formData.get("contactEmail") ?? ""),
      aboutHtml: String(formData.get("aboutHtml") ?? ""),
    });
  }

  return (
    <>
      <h1>Settings</h1>
      <ul style={{ marginBottom: "1.25rem", color: "var(--ink-muted)" }}>
        <li>Email: {configured.email || emailConfigured() ? "configured" : "not configured"}</li>
        <li>R2: {configured.r2 || r2Configured() ? "configured" : "not configured"}</li>
        <li>Push: {configured.push || pushConfigured() ? "configured" : "not configured"}</li>
        <li>
          Last backup:{" "}
          {settings?.lastBackupAt
            ? settings.lastBackupAt.toISOString()
            : "configure host backup — required"}
        </li>
      </ul>
      <form action={saveAction} className="auth-form">
        <label>
          Site name
          <input name="siteName" defaultValue={settings?.siteName ?? "Egigogo Newspaper"} required />
        </label>
        <label>
          Tagline
          <input name="tagline" defaultValue={settings?.tagline ?? ""} required />
        </label>
        <label>
          WhatsApp channel URL
          <input name="whatsappChannelUrl" defaultValue={settings?.whatsappChannelUrl ?? ""} />
        </label>
        <label>
          Facebook
          <input name="facebookUrl" defaultValue={settings?.facebookUrl ?? ""} />
        </label>
        <label>
          Twitter / X
          <input name="twitterUrl" defaultValue={settings?.twitterUrl ?? ""} />
        </label>
        <label>
          Instagram
          <input name="instagramUrl" defaultValue={settings?.instagramUrl ?? ""} />
        </label>
        <label>
          YouTube
          <input name="youtubeUrl" defaultValue={settings?.youtubeUrl ?? ""} />
        </label>
        <label>
          Contact email
          <input name="contactEmail" defaultValue={settings?.contactEmail ?? ""} />
        </label>
        <label>
          About HTML
          <textarea name="aboutHtml" rows={8} defaultValue={settings?.aboutHtml ?? ""} />
        </label>
        <button type="submit" className="btn">
          Save
        </button>
      </form>
      <div style={{ marginTop: "2rem", color: "var(--ink-muted)", fontSize: "0.9rem" }}>
        <h2 style={{ fontFamily: "var(--font-display), Georgia, serif" }}>Restore</h2>
        <p>
          Restore from your host backup or R2 dump using your provider&apos;s Postgres restore
          tooling. This CMS does not run destructive restores from the browser.
        </p>
      </div>
    </>
  );
}
