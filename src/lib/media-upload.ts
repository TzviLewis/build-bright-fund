/**
 * Media Upload Utility
 * Handles uploading video and image files to Wix Media Manager
 */

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  VIDEO_MAX_MB: 500, // 500 MB max for videos
  IMAGE_MAX_MB: 50,  // 50 MB max for images
};

export const VIDEO_MAX_BYTES = FILE_SIZE_LIMITS.VIDEO_MAX_MB * 1024 * 1024;
export const IMAGE_MAX_BYTES = FILE_SIZE_LIMITS.IMAGE_MAX_MB * 1024 * 1024;

interface UploadResponse {
  url: string;
  fileId: string;
}

/**
 * Uploads a video file to Wix Media Manager
 * @param file - The video file to upload
 * @returns Promise with the uploaded file URL and ID
 */
export async function uploadVideoFile(file: File): Promise<UploadResponse> {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);

    // Upload to Wix Media Manager endpoint
    // This uses the Wix Media Manager API available in the Wix environment
    const response = await fetch('/_api/media-manager/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    
    return {
      url: data.url || data.mediaUrl,
      fileId: data.fileId || data.id,
    };
  } catch (error) {
    console.error('Error uploading video:', error);
    throw new Error(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Uploads an image file to Wix Media Manager
 * @param file - The image file to upload
 * @returns Promise with the uploaded file URL and ID
 */
export async function uploadImageFile(file: File): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/_api/media-manager/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    
    return {
      url: data.url || data.mediaUrl,
      fileId: data.fileId || data.id,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates if a file is a supported video format
 * @param file - The file to validate
 * @returns true if the file is a valid video format
 */
export function isValidVideoFile(file: File): boolean {
  const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
  const validExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  return validVideoTypes.includes(file.type) || validExtensions.includes(fileExtension);
}

/**
 * Validates if a video file is within the size limit
 * @param file - The file to validate
 * @returns { isValid: boolean, error?: string }
 */
export function validateVideoFileSize(file: File): { isValid: boolean; error?: string } {
  if (file.size > VIDEO_MAX_BYTES) {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `Video file is too large (${fileSizeMB} MB). Maximum size is ${FILE_SIZE_LIMITS.VIDEO_MAX_MB} MB.`,
    };
  }
  return { isValid: true };
}

/**
 * Validates if a file is a supported image format
 * @param file - The file to validate
 * @returns true if the file is a valid image format
 */
export function isValidImageFile(file: File): boolean {
  const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  return validImageTypes.includes(file.type) || validExtensions.includes(fileExtension);
}
