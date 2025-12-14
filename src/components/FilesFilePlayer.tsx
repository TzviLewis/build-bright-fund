import { useEffect, useMemo } from 'react';

interface FilesFilePlayerProps {
  videoUrl?: string;
  fileId?: string;
  title?: string;
  className?: string;
}

/**
 * FilesFilePlayer Component
 * Embeds a video player from files.fm using their embed code
 * 
 * Usage with CMS URL:
 * <FilesFilePlayer videoUrl={campaign?.homepageVideo} title="Campaign Video" />
 * 
 * Usage with fileId:
 * <FilesFilePlayer fileId="4rmx75pxum" title="Campaign Video" />
 * 
 * The component automatically extracts the fileId from files.fm URLs
 * Example URL: https://files.fm/embed/4rmx75pxum
 */
export default function FilesFilePlayer({ videoUrl, fileId, title, className = '' }: FilesFilePlayerProps) {
  // Extract fileId from videoUrl if provided, otherwise use the fileId prop
  const extractedFileId = useMemo(() => {
    if (videoUrl) {
      // Extract fileId from files.fm URLs
      // Handles: https://files.fm/embed/4rmx75pxum or https://files.fm/u/4rmx75pxum
      const match = videoUrl.match(/files\.fm\/(embed\/|u\/)([a-zA-Z0-9]+)/);
      if (match && match[2]) {
        return match[2];
      }
      // If it's already just a fileId, return it
      if (videoUrl && !videoUrl.includes('/')) {
        return videoUrl;
      }
    }
    return fileId;
  }, [videoUrl, fileId]);

  useEffect(() => {
    // Load the files.fm embed script
    const script = document.createElement('script');
    script.src = 'https://files.fm/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  if (!extractedFileId) {
    return (
      <div className={`relative w-full bg-black rounded-lg overflow-hidden ${className}`}>
        <div className="w-full h-80 bg-black/50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white font-paragraph text-lg mb-2">No video available</p>
            <p className="text-white/60 font-paragraph text-sm">
              Please provide a valid video URL or file ID
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full bg-black rounded-lg overflow-hidden ${className}`}>
      {/* files.fm embed container */}
      <div 
        className="w-full"
        data-embed-type="files-fm"
        data-file-id={extractedFileId}
      >
        {/* Fallback content while embed loads */}
        <div className="w-full h-80 bg-black/50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white font-paragraph text-lg mb-2">Loading video...</p>
            <p className="text-white/60 font-paragraph text-sm">
              {title && `${title} - `}
              Powered by files.fm
            </p>
          </div>
        </div>
      </div>

      {/* Embed code using iframe approach */}
      <iframe
        src={`https://files.fm/embed/${extractedFileId}`}
        width="100%"
        height="480"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; encrypted-media"
        className="w-full"
        title={title || 'Video Player'}
      />
    </div>
  );
}
