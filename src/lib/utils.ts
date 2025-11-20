/**
 * Utility Functions
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(date);
}

export function calculateCostFunctionScore(
  performanceDelta: number,
  uxDelta: number,
  seoDelta: number,
  accessibilityDelta: number,
  stabilityDelta: number,
  bundleSizeDelta: number
): number {
  // Normalize deltas to 0-1 range
  // Positive deltas are improvements, negative are degradations
  const normalize = (delta: number, weight: number): number => {
    // Assume delta is -1 to 1, convert to 0-1 with weight
    return Math.max(0, Math.min(1, (delta + 1) / 2)) * weight;
  };

  const weights = {
    performance: 0.25,
    ux: 0.25,
    seo: 0.15,
    accessibility: 0.15,
    stability: 0.15,
    bundleSize: 0.05, // Smaller bundle is better, so invert
  };

  const bundleScore = bundleSizeDelta < 0 ? 1 : Math.max(0, 1 - bundleSizeDelta);
  
  return (
    normalize(performanceDelta, weights.performance) +
    normalize(uxDelta, weights.ux) +
    normalize(seoDelta, weights.seo) +
    normalize(accessibilityDelta, weights.accessibility) +
    normalize(stabilityDelta, weights.stability) +
    bundleScore * weights.bundleSize
  );
}

export function generateVersionString(parentVersion?: string): string {
  if (!parentVersion) return '1.0.0';
  
  const parts = parentVersion.split('.').map(Number);
  parts[2] = (parts[2] || 0) + 1; // Increment patch version
  return parts.join('.');
}

export async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function getMutationTypeColor(type: string): string {
  const colors: Record<string, string> = {
    ui_improvement: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    performance_optimization: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    seo_enhancement: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    accessibility_fix: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    content_update: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    styling_refinement: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    component_refactor: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    bug_fix: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    feature_addition: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    theme_evolution: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  };
  return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
}
