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
 * Uploads a video file to Wix Media Manager with chunked upload support
 * @param file - The video file to upload
 * @param onProgress - Optional callback for upload progress (0-100)
 * @returns Promise with the uploaded file URL and ID
 */
export async function uploadVideoFile(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
  try {
    // Check file size before uploading
    if (file.size > VIDEO_MAX_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      throw new Error(`File size (${fileSizeMB} MB) exceeds maximum allowed size of ${FILE_SIZE_LIMITS.VIDEO_MAX_MB} MB`);
    }

    // For files larger than 50MB, use chunked upload
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
    
    if (file.size > CHUNK_SIZE) {
      return await uploadVideoFileChunked(file, CHUNK_SIZE, onProgress);
    }

    // For smaller files, use direct upload
    return await uploadVideoFileDirect(file, onProgress);
  } catch (error) {
    console.error('Error uploading video:', error);
    
    // Provide specific error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes('413')) {
        throw new Error('File is too large. Please compress your video and try again. Maximum size is ' + FILE_SIZE_LIMITS.VIDEO_MAX_MB + ' MB.');
      }
      if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        throw new Error('Upload timed out. Please try again with a smaller file or better internet connection.');
      }
      if (error.message.includes('network') || error.message.includes('Network')) {
        throw new Error('Network error during upload. Please check your connection and try again.');
      }
      throw error;
    }
    
    throw new Error('Failed to upload video: Unknown error');
  }
}

/**
 * Direct upload for smaller files
 */
async function uploadVideoFileDirect(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const xhr = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({
            url: data.url || data.mediaUrl,
            fileId: data.fileId || data.id,
          });
        } catch (e) {
          reject(new Error('Invalid response from server'));
        }
      } else if (xhr.status === 413) {
        reject(new Error('413: File too large. Please compress your video.'));
      } else if (xhr.status === 408) {
        reject(new Error('Request timeout. Please try again.'));
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was cancelled'));
    });

    xhr.timeout = 300000; // 5 minute timeout for large files
    xhr.ontimeout = () => {
      reject(new Error('Upload timeout: Request took too long'));
    };

    xhr.open('POST', '/_api/media-manager/upload');
    xhr.send(formData);
  });
}

/**
 * Chunked upload for large files
 */
async function uploadVideoFileChunked(
  file: File,
  chunkSize: number,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> {
  const totalChunks = Math.ceil(file.size / chunkSize);
  let uploadedBytes = 0;

  // Initialize upload session
  const initResponse = await fetch('/_api/media-manager/upload-init', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    }),
  });

  if (!initResponse.ok) {
    throw new Error(`Failed to initialize upload: ${initResponse.status}`);
  }

  const { uploadId } = await initResponse.json();

  // Upload chunks
  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    const chunkFormData = new FormData();
    chunkFormData.append('file', chunk);
    chunkFormData.append('uploadId', uploadId);
    chunkFormData.append('chunkIndex', i.toString());
    chunkFormData.append('totalChunks', totalChunks.toString());

    const chunkResponse = await fetch('/_api/media-manager/upload-chunk', {
      method: 'POST',
      body: chunkFormData,
    });

    if (!chunkResponse.ok) {
      throw new Error(`Failed to upload chunk ${i + 1}/${totalChunks}: ${chunkResponse.status}`);
    }

    uploadedBytes += chunk.size;
    if (onProgress) {
      onProgress((uploadedBytes / file.size) * 100);
    }
  }

  // Finalize upload
  const finalizeResponse = await fetch('/_api/media-manager/upload-finalize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uploadId,
      fileName: file.name,
    }),
  });

  if (!finalizeResponse.ok) {
    throw new Error(`Failed to finalize upload: ${finalizeResponse.status}`);
  }

  const data = await finalizeResponse.json();
  return {
    url: data.url || data.mediaUrl,
    fileId: data.fileId || data.id,
  };
}

/**
 * Uploads an image file to Wix Media Manager
 * @param file - The image file to upload
 * @param onProgress - Optional callback for upload progress (0-100)
 * @returns Promise with the uploaded file URL and ID
 */
export async function uploadImageFile(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
  try {
    // Check file size before uploading
    if (file.size > IMAGE_MAX_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      throw new Error(`File size (${fileSizeMB} MB) exceeds maximum allowed size of ${FILE_SIZE_LIMITS.IMAGE_MAX_MB} MB`);
    }

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({
              url: data.url || data.mediaUrl,
              fileId: data.fileId || data.id,
            });
          } catch (e) {
            reject(new Error('Invalid response from server'));
          }
        } else if (xhr.status === 413) {
          reject(new Error('413: File too large. Please compress your image.'));
        } else if (xhr.status === 408) {
          reject(new Error('Request timeout. Please try again.'));
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was cancelled'));
      });

      xhr.timeout = 60000; // 1 minute timeout for images
      xhr.ontimeout = () => {
        reject(new Error('Upload timeout: Request took too long'));
      };

      xhr.open('POST', '/_api/media-manager/upload');
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // Provide specific error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes('413')) {
        throw new Error('File is too large. Please compress your image and try again. Maximum size is ' + FILE_SIZE_LIMITS.IMAGE_MAX_MB + ' MB.');
      }
      if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        throw new Error('Upload timed out. Please try again with a smaller file or better internet connection.');
      }
      if (error.message.includes('network') || error.message.includes('Network')) {
        throw new Error('Network error during upload. Please check your connection and try again.');
      }
      throw error;
    }
    
    throw new Error('Failed to upload image: Unknown error');
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
