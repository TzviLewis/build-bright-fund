import { useEffect } from 'react';
import { useDonationStore } from '@/stores/donationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function DonationNotificationPopup() {
  const { notifications, removeNotification } = useDonationStore();

  useEffect(() => {
    if (notifications.length === 0) return;

    const latestNotification = notifications[notifications.length - 1];
    const timer = setTimeout(() => {
      removeNotification(latestNotification._id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notifications, removeNotification]);

  return (
    <AnimatePresence>
      {notifications.map((notification) => (
        <motion.div
          key={notification._id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3 }}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-50 w-96 max-w-[calc(100vw-2rem)]"
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
