import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createHash } from "crypto";

const s3 = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT ?? "http://localhost:9000",
  region: process.env.MINIO_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY ?? "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY ?? "minioadmin",
  },
  forcePathStyle: true,
});

const BUCKET = process.env.MINIO_BUCKET ?? "n8nify-workflows";

export function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

export async function uploadWorkflow(
  key: string,
  content: string,
): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: content,
      ContentType: "application/json",
    }),
  );
}

export async function downloadWorkflow(key: string): Promise<string> {
  const response = await s3.send(
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
  );
  return (await response.Body?.transformToString()) ?? "";
}

export function workflowStorageKey(listingId: string): string {
  return `workflows/${listingId}.json`;
}
