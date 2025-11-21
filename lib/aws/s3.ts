// ┌─────────────────────────────────────────────────────────┐
// │                   AWS S3 Configuration                  │
// │                                                         │
// │  S3 client and utilities for file upload/download      │
// └─────────────────────────────────────────────────────────┘

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const S3_BUCKET = process.env.AWS_S3_BUCKET || "";

/**
 * Upload a file to S3
 */
export async function uploadToS3(params: {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
  metadata?: Record<string, string>;
}): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: params.key,
    Body: params.body,
    ContentType: params.contentType,
    Metadata: params.metadata,
  });

  await s3Client.send(command);

  return `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.key}`;
}

/**
 * Get a file from S3
 */
export async function getFromS3(key: string): Promise<Uint8Array> {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  const response = await s3Client.send(command);
  const chunks: Uint8Array[] = [];

  if (!response.Body) {
    throw new Error("No body in S3 response");
  }

  for await (const chunk of response.Body as any) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

/**
 * Delete a file from S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Generate a presigned URL for file upload
 */
export async function getUploadPresignedUrl(params: {
  key: string;
  contentType?: string;
  expiresIn?: number; // seconds
}): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: params.key,
    ContentType: params.contentType,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: params.expiresIn || 3600, // 1 hour default
  });
}

/**
 * Generate a presigned URL for file download
 */
export async function getDownloadPresignedUrl(params: {
  key: string;
  expiresIn?: number; // seconds
}): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: params.key,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: params.expiresIn || 3600, // 1 hour default
  });
}

/**
 * Helper to generate a unique S3 key for file uploads
 */
export function generateS3Key(params: {
  organizationId: string;
  userId: string;
  fileName: string;
  prefix?: string;
}): string {
  const timestamp = Date.now();
  const sanitizedFileName = params.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const prefix = params.prefix || "uploads";

  return `${prefix}/${params.organizationId}/${params.userId}/${timestamp}-${sanitizedFileName}`;
}
