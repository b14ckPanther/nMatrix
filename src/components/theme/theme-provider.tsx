'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { applyTheme, getStoredTheme, storeTheme, type ThemeConfig, type ThemeMode } from '@/lib/theme';

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>(() => {
    if (typeof window !== 'undefined') {
      return getStoredTheme() || {
        mode: 'auto',
        colors: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#ec4899',
          background: '#ffffff',
          foreground: '#0f172a',
        },
        fonts: {
          sans: 'system-ui, -apple-system, sans-serif',
          serif: 'Georgia, serif',
          mono: 'Menlo, monospace',
        },
        borderRadius: '0.5rem',
        spacing: {
          unit: 4,
        },
      };
    }
    return {
      mode: 'auto',
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#ec4899',
        background: '#ffffff',
        foreground: '#0f172a',
      },
      fonts: {
        sans: 'system-ui, -apple-system, sans-serif',
        serif: 'Georgia, serif',
        mono: 'Menlo, monospace',
      },
      borderRadius: '0.5rem',
      spacing: {
        unit: 4,
      },
    };
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeConfig) => {
    setThemeState(newTheme);
    storeTheme(newTheme);
  };

  const setMode = (mode: ThemeMode) => {
    const newTheme = { ...theme, mode };
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return default theme instead of throwing to prevent crashes
    return {
      theme: {
        mode: 'auto' as ThemeMode,
        colors: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#ec4899',
          background: '#ffffff',
          foreground: '#0f172a',
        },
        fonts: {
          sans: 'system-ui, -apple-system, sans-serif',
          serif: 'Georgia, serif',
          mono: 'Menlo, monospace',
        },
        borderRadius: '0.5rem',
        spacing: {
          unit: 4,
        },
      },
      setTheme: () => {},
      setMode: () => {},
    };
  }
  return context;
}
