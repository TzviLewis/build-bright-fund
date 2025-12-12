import type { APIRoute } from 'astro';

/**
 * Initialize chunked upload session
 * POST /_api/media-manager/upload-init
 * 
 * Request body:
 * {
 *   fileName: string,
 *   fileSize: number,
 *   fileType: string
 * }
 * 
 * Response:
 * {
 *   uploadId: string
 * }
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { fileName, fileSize, fileType } = body;

    if (!fileName || !fileSize || !fileType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: fileName, fileSize, fileType' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate file type
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
    if (!validVideoTypes.includes(fileType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid video file type' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate file size (500MB max)
    const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
    if (fileSize > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ 
          error: `File too large. Maximum size is 500MB. Your file is ${(fileSize / (1024 * 1024)).toFixed(2)}MB` 
        }),
        {
          status: 413,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate unique upload ID
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // In production, you would:
    // 1. Create an upload session in cloud storage (e.g., AWS S3, Google Cloud Storage)
    // 2. Store metadata about the upload (fileName, fileSize, fileType, uploadId)
    // 3. Return the uploadId to the client

    return new Response(
      JSON.stringify({
        uploadId,
        fileName,
        fileSize,
        fileType,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Upload init error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to initialize upload' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
