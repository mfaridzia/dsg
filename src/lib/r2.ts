import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || "kodeva-uploads";
const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

export const isR2Configured = Boolean(
  accountId && accessKeyId && secretAccessKey && bucketName
);

export const r2Client = isR2Configured
  ? new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
    })
  : null;

export async function uploadToR2({
  fileBuffer,
  fileName,
  contentType,
}: {
  fileBuffer: Buffer;
  fileName: string;
  contentType: string;
}): Promise<string> {
  if (!r2Client || !bucketName) {
    throw new Error("R2 is not configured. Please set R2 credentials.");
  }

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
    })
  );

  if (publicUrl) {
    return `${publicUrl}/${fileName}`;
  }

  // If no custom/dev public domain specified, default to R2 endpoint format
  return `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${fileName}`;
}
