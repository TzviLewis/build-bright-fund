import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endDate: Date | string;
  startDate?: Date | string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  hasStarted: boolean;
}

export default function CountdownTimer({ endDate, startDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    hasStarted: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      
      // Check if campaign has started
      let targetDate: number;
      let campaignHasStarted = true;
      
      if (startDate) {
        const startTime = new Date(startDate).getTime();
        if (now < startTime) {
          // Campaign hasn't started yet
          targetDate = startTime;
          campaignHasStarted = false;
        } else {
          // Campaign has started, count down to end
          targetDate = new Date(endDate).getTime();
          campaignHasStarted = true;
        }
      } else {
        // No start date provided, just count to end date
        targetDate = new Date(endDate).getTime();
      }

      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          hasStarted: campaignHasStarted,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
        hasStarted: campaignHasStarted,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate, startDate]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <motion.div
      initial={{ scale: 1 }}
      animate={{ scale: 1 }}
      className="flex flex-col items-center"
    >
      <div className="bg-secondary text-secondary-foreground rounded-lg p-4 min-w-[80px] flex items-center justify-center">
        <span className="font-heading text-3xl font-bold">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="font-paragraph text-sm text-primary/70 mt-2 uppercase tracking-wider">
        {label}
      </span>
    </motion.div>
  );

  if (timeLeft.isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-destructive/10 border-2 border-destructive rounded-lg p-8 text-center"
      >
        <p className="font-heading text-2xl font-bold text-destructive">
          {timeLeft.hasStarted ? 'Campaign Has Ended' : 'Campaign Coming Soon'}
        </p>
        <p className="font-paragraph text-base text-destructive/80 mt-2">
          {timeLeft.hasStarted ? 'Thank you for your support!' : 'Stay tuned for updates!'}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-8 h-8 text-secondary" />
        <h3 className="font-heading text-2xl font-bold text-primary">
          {timeLeft.hasStarted ? 'Campaign Ends In' : 'Campaign Starts In'}
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <TimeUnit value={timeLeft.days} label="Days" />
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <TimeUnit value={timeLeft.minutes} label="Minutes" />
        <TimeUnit value={timeLeft.seconds} label="Seconds" />
      </div>
    </motion.div>
  );
}
