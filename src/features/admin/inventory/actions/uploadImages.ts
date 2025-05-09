'use server';

import { verifyPermission } from "@/utils/permissions";
import { uploadToR2 } from "@/lib/s3";

/**
 * Asynchronously uploads images to R2 storage for a verified user.
 *
 * This function first checks if the user has the necessary permissions to upload images.
 * If the user is not authorized, it returns an error message. Upon successful authorization,
 * it retrieves all files from the provided FormData under the key 'files', uploads each file
 * to R2 storage using a unique key format "products/{timestamp}-{fileName}", and collects the URLs
 * of the uploaded images. If any error occurs during upload, it returns a failure response with 
 * the error message.
 *
 * @param userId - The identifier of the user performing the upload.
 * @param formData - The FormData object containing the image files (expected under the key 'files').
 * @returns A promise that resolves to an object indicating the success status. On success, the object
 *          includes an array of URL strings for the uploaded images; on failure, it contains an error message.
 */
export async function uploadImages(userId: string, formData: FormData): ActionsReturnType<string[]> {
  if (!await verifyPermission({
    userId: userId,
    permissions: {
      inventory: { canRead: true, canUpdate: true, canCreate: true },
    }
  })) {
    return {
      success: false,
      message: "You are not authorized to upload images."
    };
  }

  try {
    const files = formData.getAll('files') as File[];
    const uploadPromises = files.map(async (file) => {
      const key = `products/${Date.now()}-${file.name}`;
      const url = await uploadToR2(file, key);
      return url;
    });

    const urls = await Promise.all(uploadPromises);
    return {
      success: true,
      data: urls
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message
    };
  }
} 