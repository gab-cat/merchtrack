'use server';

import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { verifyPermission } from '@/utils/permissions';
import s3Client from '@/lib/s3';
import { CLOUDFLARE_R2_BUCKET_NAME, CLOUDFLARE_R2_PUBLIC_URL } from '@/config';

export async function deleteProductImages(userId: string, imageUrls: string[]): Promise<ActionsReturnType<void>> {
  if (!await verifyPermission({
    userId,
    permissions: {
      inventory: { canUpdate: true },
    }
  })) {
    return {
      success: false,
      message: "You are not authorized to delete product images."
    };
  }

  try {
    // Extract file keys from image URLs
    const keys = imageUrls.map(url => {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1];
    });

    // Delete all images in parallel
    await Promise.all(
      keys.map(key => 
        s3Client.send(new DeleteObjectCommand({
          Bucket: CLOUDFLARE_R2_BUCKET_NAME,
          Key: key,
        }))
      )
    );

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete image files'
    };
  }
}

export async function uploadProductImages(userId: string, files: File[]): Promise<ActionsReturnType<string[]>> {
  if (!await verifyPermission({
    userId,
    permissions: {
      inventory: { canCreate: true, canUpdate: true },
    }
  })) {
    return {
      success: false,
      message: "You are not authorized to upload product images."
    };
  }

  try {
    const uploadPromises = files.map(async (file) => {
      const key = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;
      const arrayBuffer = await file.arrayBuffer();
      
      await s3Client.send(new PutObjectCommand({
        Bucket: CLOUDFLARE_R2_BUCKET_NAME,
        Key: key,
        Body: Buffer.from(arrayBuffer),
        ContentType: file.type,
      }));

      return `${CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
    });

    const uploadedUrls = await Promise.all(uploadPromises);

    return {
      success: true,
      data: uploadedUrls
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to upload image files'
    };
  }
}