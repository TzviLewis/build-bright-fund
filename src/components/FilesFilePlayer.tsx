import { useEffect } from 'react';

interface FilesFilePlayerProps {
  fileId: string;
  title?: string;
  className?: string;
}

/**
 * FilesFilePlayer Component
 * Embeds a video player from files.fm using their embed code
 * 
 * Usage:
 * <FilesFilePlayer fileId="4rmx75pxum" title="Campaign Video" />
 * 
 * The fileId is extracted from the URL: https://files.fm/u/4rmx75pxum
 * In this case, the fileId is: 4rmx75pxum
 */
export default function FilesFilePlayer({ fileId, title, className = '' }: FilesFilePlayerProps) {
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

  return (
    <div className={`relative w-full bg-black rounded-lg overflow-hidden ${className}`}>
      {/* files.fm embed container */}
      <div 
        className="w-full"
        data-embed-type="files-fm"
        data-file-id={fileId}
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
        src={`https://files.fm/embed/${fileId}`}
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
