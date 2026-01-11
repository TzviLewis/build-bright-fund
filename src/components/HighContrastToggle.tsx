import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * High Contrast Mode Toggle Component
 * Provides enhanced contrast for users with visual impairments
 */
export default function HighContrastToggle() {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize high contrast mode from localStorage and system preference
  useEffect(() => {
    setMounted(true);

    // Check localStorage first
    const savedMode = localStorage.getItem('highContrast');
    if (savedMode !== null) {
      setIsHighContrast(savedMode === 'true');
      applyHighContrast(savedMode === 'true');
    } else {
      // Check system preference
      const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;
      setIsHighContrast(prefersHighContrast);
      applyHighContrast(prefersHighContrast);
    }
  }, []);

  const applyHighContrast = (enabled: boolean) => {
    const html = document.documentElement;
    if (enabled) {
      html.classList.add('high-contrast');
      html.style.setProperty('--contrast-multiplier', '1.5');
    } else {
      html.classList.remove('high-contrast');
      html.style.setProperty('--contrast-multiplier', '1');
    }
  };

  const toggleHighContrast = () => {
    const newMode = !isHighContrast;
    setIsHighContrast(newMode);
    localStorage.setItem('highContrast', String(newMode));
    applyHighContrast(newMode);
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <Button
      onClick={toggleHighContrast}
      variant="ghost"
      size="sm"
      className="rounded-lg p-2 hover:bg-primary/10 transition-colors"
      aria-label={isHighContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
      title={isHighContrast ? 'High Contrast: ON' : 'High Contrast: OFF'}
    >
      <Eye className={`w-5 h-5 ${isHighContrast ? 'text-secondary' : 'text-slate-600'}`} />
    </Button>
  );
}
