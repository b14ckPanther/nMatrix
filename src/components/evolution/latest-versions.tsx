'use client';

import { useEffect, useState } from 'react';
import { versions } from '@/lib/firebase/firestore';
import { orderBy, limit } from 'firebase/firestore';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatRelativeTime } from '@/lib/utils';
import type { VersionDNA } from '@/types/evolution';
import Link from 'next/link';

export function LatestVersions() {
  const [versionsList, setVersionsList] = useState<VersionDNA[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVersions() {
      try {
        setLoading(true);
        const data = await versions.getAll([orderBy('createdAt', 'desc'), limit(5)]);
        setVersionsList(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch versions');
      } finally {
        setLoading(false);
      }
    }

    fetchVersions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600 dark:text-red-400">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (versionsList.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        <p>No versions available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {versionsList.map((version) => (
        <Link
          key={version.id}
          href={`/evolution/${version.id}`}
          className="block bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Version {version.version}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {version.reasoning}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                <span>{formatRelativeTime(version.createdAt)}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  version.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  version.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  version.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
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
            <div className="text-right">
              <p className="text-sm font-medium">
                {Array.isArray(version.mutations) ? version.mutations.length : 0} mutation{Array.isArray(version.mutations) && version.mutations.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
