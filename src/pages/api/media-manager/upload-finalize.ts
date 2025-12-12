import type { APIRoute } from 'astro';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// Store upload sessions in memory (in production, use a database)
const uploadSessions = new Map<string, {
  fileName: string;
  fileSize: number;
  fileType: string;
  chunks: Map<number, Buffer>;
  createdAt: number;
}>();

/**
 * Finalize chunked upload
 * POST /_api/media-manager/upload-finalize
 * 
 * Request body:
 * {
 *   uploadId: string,
 *   fileName: string
 * }
 * 
 * Response:
 * {
 *   url: string,
 *   mediaUrl: string,
 *   fileId: string,
 *   id: string,
 *   fileName: string,
 *   fileSize: number
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
    const { uploadId, fileName } = body;

    if (!uploadId || !fileName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: uploadId, fileName' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get upload session
    const session = uploadSessions.get(uploadId);
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Upload session not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Combine all chunks
    const chunks: Buffer[] = [];
    for (let i = 0; i < session.chunks.size; i++) {
      const chunk = session.chunks.get(i);
      if (!chunk) {
        return new Response(
          JSON.stringify({ error: `Missing chunk ${i}` }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      chunks.push(chunk);
    }

    const finalBuffer = Buffer.concat(chunks);
    const fileSize = finalBuffer.length;

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = fileName.split('.').pop() || 'mp4';
    const finalFileName = `video_${timestamp}_${randomStr}.${ext}`;

    // Save to temporary location (in production, this would be uploaded to cloud storage)
    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, finalFileName);
    
    await fs.writeFile(filePath, finalBuffer);

    // Generate a media URL (in production, this would be the cloud storage URL)
    const mediaUrl = `https://static.wixstatic.com/media/12d367_${timestamp}_${randomStr}~mv2.${ext}?id=${finalFileName}`;

    // Clean up upload session
    uploadSessions.delete(uploadId);

    // Clean up temp file after a delay
    setTimeout(async () => {
      try {
        await fs.unlink(filePath);
      } catch (e) {
        console.error('Error cleaning up temp file:', e);
      }
    }, 5000);

    return new Response(
      JSON.stringify({
        url: mediaUrl,
        mediaUrl: mediaUrl,
        fileId: finalFileName,
        id: finalFileName,
        fileName: fileName,
        fileSize: fileSize,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Upload finalize error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to finalize upload' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
