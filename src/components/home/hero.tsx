'use client';

import { EvolutionStatus } from '@/components/evolution/evolution-status';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import Link from 'next/link';

export function Hero() {
  return (
    <header className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          nmMatrix
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          A fully autonomous, self-evolving web application
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
          Watch as this living digital organism continuously improves itself through AI-driven evolution loops
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/admin"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Admin Dashboard / Login
          </Link>
          <Link
            href="/evolution"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            View Evolution
          </Link>
        </div>

        <div className="mt-12">
          <EvolutionStatus />
        </div>
      </div>
    </header>
  );
}
