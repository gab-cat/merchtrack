import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

if (!process.env.CLOUDFLARE_R2_BUCKET_NAME) {
  throw new Error('R2 bucket name is not configured');
}

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

/**
 * Uploads a file to Cloudflare R2 storage.
 *
 * This asynchronous function converts the provided file to an ArrayBuffer, wraps it in a Buffer,
 * and uploads it to a Cloudflare R2 bucket using a PutObjectCommand with the AWS SDK. The public URL
 * of the uploaded file is returned upon success.
 *
 * Required Environment Variables:
 * - CLOUDFLARE_R2_BUCKET_NAME: Name of the Cloudflare R2 bucket.
 * - CLOUDFLARE_R2_PUBLIC_URL: Base public URL used to access the uploaded file.
 * - CLOUDFLARE_R2_ENDPOINT, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY: Used for S3 client configuration.
 *
 * @param file - The File object to be uploaded.
 * @param key - The key under which the file will be stored in the bucket.
 * @returns A promise that resolves with the public URL of the uploaded file.
 * @throws Error if the upload operation fails.
 */
export async function uploadToR2(file: File, key: string) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: key,
      Body: Buffer.from(arrayBuffer),
      ContentType: file.type,
    });

    await s3Client.send(command);
    return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
  } catch (error) {
    // no-dd-sa:typescript-best-practices/no-console
    console.error('Error uploading to R2:', error);
    throw new Error('Failed to upload file');
  }
}
