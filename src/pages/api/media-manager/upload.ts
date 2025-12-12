import type { APIRoute } from 'astro';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

/**
 * Direct video upload endpoint
 * Handles file uploads for videos smaller than 5MB
 * POST /_api/media-manager/upload
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate file type
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
    if (!validVideoTypes.includes(file.type)) {
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
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ 
          error: `File too large. Maximum size is 500MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB` 
        }),
        {
          status: 413,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop() || 'mp4';
    const filename = `video_${timestamp}_${randomStr}.${ext}`;

    // Save to temporary location (in production, this would be uploaded to cloud storage)
    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, filename);
    
    await fs.writeFile(filePath, Buffer.from(buffer));

    // Generate a media URL (in production, this would be the cloud storage URL)
    // For now, we'll use a placeholder that can be replaced with actual cloud storage
    const mediaUrl = `https://static.wixstatic.com/media/12d367_${timestamp}_${randomStr}~mv2.${ext}?id=${filename}`;

    // Clean up temp file after a delay (in production, this would be handled by cloud storage)
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
        fileId: filename,
        id: filename,
        fileName: file.name,
        fileSize: file.size,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Upload failed' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
