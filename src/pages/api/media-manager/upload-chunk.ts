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

// Clean up old sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  const maxAge = 30 * 60 * 1000; // 30 minutes
  
  for (const [uploadId, session] of uploadSessions.entries()) {
    if (now - session.createdAt > maxAge) {
      uploadSessions.delete(uploadId);
    }
  }
}, 5 * 60 * 1000);

/**
 * Upload a chunk of a large file
 * POST /_api/media-manager/upload-chunk
 * 
 * Form data:
 * - file: File (chunk)
 * - uploadId: string
 * - chunkIndex: number
 * - totalChunks: number
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadId = formData.get('uploadId') as string;
    const chunkIndex = parseInt(formData.get('chunkIndex') as string);
    const totalChunks = parseInt(formData.get('totalChunks') as string);

    if (!file || !uploadId || isNaN(chunkIndex) || isNaN(totalChunks)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get or create upload session
    let session = uploadSessions.get(uploadId);
    if (!session) {
      session = {
        fileName: `chunk_${uploadId}`,
        fileSize: 0,
        fileType: 'video/mp4',
        chunks: new Map(),
        createdAt: Date.now(),
      };
      uploadSessions.set(uploadId, session);
    }

    // Store chunk
    const buffer = await file.arrayBuffer();
    session.chunks.set(chunkIndex, Buffer.from(buffer));

    // Check if all chunks are received
    const allChunksReceived = session.chunks.size === totalChunks;

    return new Response(
      JSON.stringify({
        uploadId,
        chunkIndex,
        totalChunks,
        receivedChunks: session.chunks.size,
        complete: allChunksReceived,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Chunk upload error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to upload chunk' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
