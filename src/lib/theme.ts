/**
 * Dynamic Theme System
 * AI-driven theme evolution support
 */

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeConfig {
  mode: ThemeMode;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  fonts: {
    sans: string;
    serif: string;
    mono: string;
  };
  borderRadius: string;
  spacing: {
    unit: number;
  };
}

export const defaultTheme: ThemeConfig = {
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

export function applyTheme(theme: ThemeConfig) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  
  // Apply color scheme
  if (theme.mode === 'dark' || (theme.mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Apply CSS variables
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-background', theme.colors.background);
  root.style.setProperty('--color-foreground', theme.colors.foreground);
  root.style.setProperty('--border-radius', theme.borderRadius);
}

export function getStoredTheme(): ThemeConfig | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('nmmatrix-theme');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load theme from storage:', error);
  }
  
  return null;
}

export function storeTheme(theme: ThemeConfig) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('nmmatrix-theme', JSON.stringify(theme));
    applyTheme(theme);
  } catch (error) {
    console.error('Failed to store theme:', error);
  }
}
