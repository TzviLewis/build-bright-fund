import { useState, useEffect } from 'react';
import { BaseCrudService } from '@/integrations';

export interface ThemeSettings {
  _id: string;
  themeName?: string;
  primaryColorHex?: string;
  secondaryColorHex?: string;
  accentColorHex?: string;
  backgroundColorHex?: string;
}

const DEFAULT_THEME: ThemeSettings = {
  _id: 'default',
  themeName: 'Default',
  primaryColorHex: '#1a1a1a',
  secondaryColorHex: '#0066ff',
  accentColorHex: '#0066ff',
  backgroundColorHex: '#fafafa',
};

export function useThemeSettings() {
  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      setLoading(true);
      const result = await BaseCrudService.getAll<ThemeSettings>('themesettings', {}, { limit: 1 });
      if (result.items && result.items.length > 0) {
        setTheme(result.items[0]);
      } else {
        setTheme(DEFAULT_THEME);
      }
    } catch (error) {
      console.error('Error loading theme settings:', error);
      setTheme(DEFAULT_THEME);
    } finally {
      setLoading(false);
    }
  };

  const updateTheme = async (updates: Partial<ThemeSettings>) => {
    try {
      const updatedTheme = { ...theme, ...updates };
      if (theme._id === 'default') {
        // Create new theme if using default
        const newTheme = await BaseCrudService.create('themesettings', {
          ...updatedTheme,
          _id: crypto.randomUUID(),
        });
        setTheme(newTheme as ThemeSettings);
      } else {
        // Update existing theme
        await BaseCrudService.update('themesettings', {
          _id: theme._id,
          ...updates,
        });
        setTheme(updatedTheme);
      }
    } catch (error) {
      console.error('Error updating theme settings:', error);
    }
  };

  return {
    theme,
    loading,
    updateTheme,
    loadTheme,
  };
}
