import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export function r2Configured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET &&
      process.env.R2_PUBLIC_URL &&
      process.env.R2_ENDPOINT,
  );
}

function getClient() {
  if (!r2Configured()) {
    throw new Error("R2 is not configured");
  }
  return new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export function publicObjectUrl(key: string) {
  const base = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");
  return `${base}/${key.replace(/^\//, "")}`;
}

export async function uploadToR2(opts: {
  key: string;
  body: Buffer;
  contentType: string;
}) {
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: opts.key,
      Body: opts.body,
      ContentType: opts.contentType,
    }),
  );
  return publicObjectUrl(opts.key);
}
