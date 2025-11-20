'use client';

import { useState, useEffect } from 'react';
import { useTheme } from './theme-provider';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setMode } = useTheme(); // Now safe because useTheme returns defaults

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder during SSR/hydration
    return (
      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse">
        <SunIcon className="w-5 h-5" />
      </div>
    );
  }

  const cycles: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
  const currentIndex = cycles.indexOf(theme?.mode === 'auto' ? 'auto' : theme?.mode || 'auto');
  const nextMode = cycles[(currentIndex + 1) % cycles.length];

  const icons = {
    light: SunIcon,
    dark: MoonIcon,
    auto: ComputerDesktopIcon,
  };

  const Icon = icons[nextMode];

  return (
    <button
      onClick={() => setMode(nextMode)}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label={`Switch to ${nextMode} theme`}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
