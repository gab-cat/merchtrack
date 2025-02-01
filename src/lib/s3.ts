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
