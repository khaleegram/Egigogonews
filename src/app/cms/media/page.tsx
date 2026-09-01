import { listMediaLibrary } from "@/lib/media-actions";
import { r2Configured } from "@/lib/r2";
import { MediaLibraryClient } from "@/components/cms/media-library-client";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const configured = r2Configured();
  const items = await listMediaLibrary({ limit: 100 });

  return (
    <>
      <h1>Media</h1>
      {!configured ? (
        <p className="form-error" style={{ marginBottom: "1rem" }}>
          Cloudflare R2 is not configured. Add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID,
          R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_ENDPOINT, and R2_PUBLIC_URL to
          .env.local, then restart the dev server.
        </p>
      ) : null}
      <MediaLibraryClient initialItems={items} />
    </>
  );
}
