import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Confetti {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
}

export default function ConfettiAnimation() {
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  useEffect(() => {
    // Generate confetti pieces
    const pieces: Confetti[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.3,
      duration: 2.5 + Math.random() * 0.5,
      color: ['#60a2ff', '#0B1E5B', '#FFFFFF'][Math.floor(Math.random() * 3)],
    }));

    setConfetti(pieces);

    // Clear confetti after animation completes
    const timer = setTimeout(() => {
      setConfetti([]);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            top: -10,
            left: `${piece.left}%`,
            opacity: 1,
            rotate: 0,
          }}
          animate={{
            top: '100vh',
            opacity: 0,
            rotate: 360 + Math.random() * 360,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeIn',
          }}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: piece.color }}
        />
      ))}
    </div>
  );
}
