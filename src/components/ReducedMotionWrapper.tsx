import { useEffect, useState } from 'react';

interface ReducedMotionWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper component that respects prefers-reduced-motion preference
 * Disables animations for users who prefer reduced motion
 */
export default function ReducedMotionWrapper({ children, className = '' }: ReducedMotionWrapperProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check initial preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div
      className={className}
      style={{
        animationDuration: prefersReducedMotion ? '0.01ms' : undefined,
        animationIterationCount: prefersReducedMotion ? '1' : undefined,
        transitionDuration: prefersReducedMotion ? '0.01ms' : undefined,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Hook to check if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}
