import { useEffect, useState } from 'react';
import { useDonationStore } from '@/stores/donationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';

export default function DonationNotificationPopup() {
  const { notifications, removeNotification } = useDonationStore();
  const [showVideo, setShowVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (notifications.length === 0) return;

    const latestNotification = notifications[notifications.length - 1];
    
    // If there's a video, show it immediately
    if (latestNotification.videoUrl) {
      setVideoUrl(latestNotification.videoUrl);
      setShowVideo(true);
      // Auto-close video after 10 seconds
      const videoTimer = setTimeout(() => {
        setShowVideo(false);
        setVideoUrl(null);
      }, 10000);
      return () => clearTimeout(videoTimer);
    } else {
      // Otherwise show notification for 5 seconds
      const timer = setTimeout(() => {
        removeNotification(latestNotification._id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications, removeNotification]);

  return (
    <AnimatePresence>
      {/* Video Popup */}
      {showVideo && videoUrl && (
        <motion.div
          key="video-popup"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div className="relative w-full max-w-2xl">
            <button
              onClick={() => {
                setShowVideo(false);
                setVideoUrl(null);
              }}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>
            <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
              <video
                src={videoUrl}
                autoPlay
                controls
                className="w-full h-auto"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Donation Notification Cards */}
      {notifications.map((notification) => (
        <motion.div
          key={notification._id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3 }}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-40 w-96 max-w-[calc(100vw-2rem)]"
        >
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-primary">
                  New Donation!
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {notification.pageName || 'Donation received'}
                </p>
              </div>
              <button
                onClick={() => removeNotification(notification._id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Donor Info */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Donor
                </p>
                <p className="text-base font-semibold text-foreground mt-1">
                  {notification.isAnonymous ? 'Anonymous' : notification.donorName}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Amount
                </p>
                <p className="text-2xl font-bold text-secondary mt-1">
                  ${notification.amount?.toFixed(2) || '0.00'}
                </p>
              </div>

              {notification.donorMessage && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Message
                  </p>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                    "{notification.donorMessage}"
                  </p>
                </div>
              )}

              {notification.videoUrl && (
                <button
                  onClick={() => {
                    setVideoUrl(notification.videoUrl || null);
                    setShowVideo(true);
                  }}
                  className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors font-semibold text-sm"
                >
                  <Play size={16} />
                  Watch Video
                </button>
              )}
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 5, ease: 'linear' }}
              className="h-1 bg-secondary mt-4 origin-left rounded-full"
            />
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
