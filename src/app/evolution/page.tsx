'use client';

import { useEffect, useState } from 'react';
import { versions, reviews } from '@/lib/firebase/firestore';
import { orderBy, limit } from 'firebase/firestore';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatRelativeTime, getMutationTypeColor } from '@/lib/utils';
import type { VersionDNA, Review } from '@/types/evolution';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export default function EvolutionPage() {
  const [versionsList, setVersionsList] = useState<VersionDNA[]>([]);
  const [reviewsList, setReviewsList] = useState<Record<string, Review[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const versionsData = await versions.getAll([orderBy('createdAt', 'desc'), limit(20)]);
        setVersionsList(versionsData);

        // Fetch reviews for each version
        const reviewsMap: Record<string, Review[]> = {};
        for (const version of versionsData) {
          try {
            const versionReviews = await reviews.getByVersion(version.id);
            reviewsMap[version.id] = versionReviews;
          } catch (err) {
            // Ignore errors for individual reviews
          }
        }
        setReviewsList(reviewsMap);

        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch evolution data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold">
                nmMatrix
              </Link>
              <span className="text-sm text-gray-600 dark:text-gray-400">Evolution History</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Admin
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Evolution History</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View the complete evolution lineage of nmMatrix - every mutation, critique, and improvement
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
            <p>Error: {error}</p>
          </div>
        )}

        {versionsList.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">
              No evolution versions yet. The system will start evolving automatically!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {versionsList.map((version) => (
              <div
                key={version.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      Version {version.version}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500 mb-2">
                      <span>{formatRelativeTime(version.createdAt)}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        version.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        version.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        version.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        version.status === 'approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}>
                        {version.status}
                      </span>
                      {version.costFunctionScore !== undefined && (
                        <span className="text-xs">
                          Cost Score: {(version.costFunctionScore * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {version.reasoning}
                </p>

                {Array.isArray(version.mutations) && version.mutations.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Mutations ({version.mutations.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {version.mutations.map((mutation) => (
                        <span
                          key={mutation.id}
                          className={`px-2 py-1 rounded text-xs ${getMutationTypeColor(mutation.type)}`}
                        >
                          {mutation.type.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {reviewsList[version.id] && reviewsList[version.id].length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Critiques ({reviewsList[version.id].length})
                    </h3>
                    <div className="space-y-2">
                      {reviewsList[version.id].slice(0, 3).map((review) => (
                        <div
                          key={review.id}
                          className="text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded"
                        >
                          <span className={`inline-block px-2 py-1 rounded text-xs mr-2 ${
                            review.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            review.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                            review.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {review.severity}
                          </span>
                          <span className="font-medium">{review.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {version.parentVersionId && (
                  <div className="mt-4 text-xs text-gray-500 dark:text-gray-500">
                    Parent: <span className="font-mono">{version.parentVersionId.slice(0, 8)}...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
