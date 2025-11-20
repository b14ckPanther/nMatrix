'use client';

import { formatRelativeTime, getMutationTypeColor } from '@/lib/utils';
import type { VersionDNA } from '@/types/evolution';
import Link from 'next/link';

export function VersionsList({ versions: versionsList }: { versions: VersionDNA[] }) {
  if (versionsList.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center text-gray-600 dark:text-gray-400">
        <p>No versions available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {versionsList.map((version) => (
        <Link
          key={version.id}
          href={`/admin/versions/${version.id}`}
          className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold">Version {version.version}</h3>
            <span className={`px-2 py-1 rounded text-xs ${
              version.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              version.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
              version.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
              version.status === 'approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}>
              {version.status}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {version.reasoning}
          </p>

          {(Array.isArray(version.mutations) && version.mutations.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {version.mutations.slice(0, 3).map((mutation) => (
                <span
                  key={mutation.id}
                  className={`px-2 py-1 rounded text-xs ${getMutationTypeColor(mutation.type)}`}
                >
                  {mutation.type.replace(/_/g, ' ')}
                </span>
              ))}
              {version.mutations.length > 3 && (
                <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                  +{version.mutations.length - 3} more
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
            <span>{formatRelativeTime(version.createdAt)}</span>
            {version.costFunctionScore !== undefined && (
              <span>Cost: {(version.costFunctionScore * 100).toFixed(1)}%</span>
            )}
            <span>{Array.isArray(version.mutations) ? version.mutations.length : 0} mutations</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
