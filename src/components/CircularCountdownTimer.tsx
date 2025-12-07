import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CircularCountdownTimerProps {
  endDate: Date | string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
}

export default function CircularCountdownTimer({ endDate }: CircularCountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date(endDate).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
          isExpired: true,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      const totalSeconds = Math.floor(difference / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        totalSeconds,
        isExpired: false,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  // Calculate total seconds for a full campaign (30 days for example)
  const maxTotalSeconds = 30 * 24 * 60 * 60;
  const progressPercentage = Math.min((timeLeft.totalSeconds / maxTotalSeconds) * 100, 100);

  if (timeLeft.isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center"
      >
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-destructive/10 border-4 border-destructive"></div>
          <div className="text-center z-10">
            <p className="font-heading text-3xl font-bold text-destructive">
              Campaign Ended
            </p>
            <p className="font-paragraph text-base text-destructive/80 mt-2">
              Thank you for your support!
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center"
    >
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Outer circle background */}
        <svg className="absolute inset-0 w-full h-full fill-secondary opacity-[1] my-0 mx-[5px]" viewBox="0 0 320 320">
          {/* Background circle */}
          <motion.circle
          cx="160"
          cy="160"
          r="150"
          fill="none"
          stroke="#E31B23"
          strokeWidth="8"
          strokeDasharray={`${2 * Math.PI * 150}`}
          strokeDashoffset={`${2 * Math.PI * 150 * (1 - progressPercentage / 100)}`}
          strokeLinecap="round"
          transform="rotate(-90 160 160)"
          transition={{ strokeDashoffset: { duration: 1, ease: 'linear' } }}
        />
        <circle
              cx="160"
              cy="160"
              r="150"
              fill="none"
              stroke="#0B1E5B"
              strokeWidth="2"
              opacity="0.1"
            />
          {/* Progress circle */}
          </svg>

        {/* Center content */}
        <div className="relative z-10 text-center space-y-4">
          <p className="font-paragraph text-lg text-primary/70 uppercase tracking-wider">
            Campaign Ends In
          </p>
          
          <div className="space-y-2">
            <p className="font-paragraph text-sm text-primary/60 uppercase tracking-wider">
              Days
            </p>
          <div className="font-heading text-5xl font-bold text-primary">
              {String(timeLeft.days).padStart(2, '0')}
            </div>
            </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <div className="text-center">
              <div className="font-heading text-2xl font-bold text-secondary">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <p className="font-paragraph text-xs text-primary/60 uppercase">hrs</p>
            </div>
            <div className="text-primary/30 text-2xl">:</div>
            <div className="text-center">
              <p className="font-paragraph text-xs text-primary/60 uppercase">min</p>
            <div className="font-heading text-2xl font-bold text-secondary">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              </div>
            <div className="text-primary/30 text-2xl">:</div>
            <div className="text-center">
              <div className="font-heading text-2xl font-bold text-secondary">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <p className="font-paragraph text-xs text-primary/60 uppercase">sec</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
