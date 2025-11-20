'use client';

import { useEffect, useState } from 'react';
import { getEvolutionStatus } from '@/lib/firebase/functions';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface EvolutionStatusData {
  latestVersion: {
    version: string;
    status: string;
    createdAt: Date;
  } | null;
  pendingApprovals: number;
  activeExperiments: number;
}

export function EvolutionStatus() {
  const [status, setStatus] = useState<EvolutionStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        setLoading(true);
        const data = await getEvolutionStatus();
        setStatus(data as EvolutionStatusData);
        setError(null);
      } catch (err: any) {
        // Check if Firebase is not configured
        if (err.message?.includes('invalid-api-key') || err.message?.includes('Firebase') || err.code === 'auth/invalid-api-key') {
          setError('Firebase is not configured. Please set up Firebase credentials in .env.local file. See FIREBASE_SETUP.md for instructions.');
        } else {
          setError(err.message || 'Failed to fetch evolution status');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
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

  if (!status) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        <p>No evolution data available</p>
      </div>
    );
  }

  const statusIcon = {
    completed: CheckCircleIcon,
    pending: ClockIcon,
    failed: XCircleIcon,
    approved: CheckCircleIcon,
    rejected: XCircleIcon,
  };

  const StatusIcon = status.latestVersion
    ? statusIcon[status.latestVersion.status as keyof typeof statusIcon] || ClockIcon
    : ClockIcon;

  const statusColor = {
    completed: 'text-green-600 dark:text-green-400',
    pending: 'text-yellow-600 dark:text-yellow-400',
    failed: 'text-red-600 dark:text-red-400',
    approved: 'text-blue-600 dark:text-blue-400',
    rejected: 'text-red-600 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Latest Version
          </h3>
          {status.latestVersion ? (
            <div className="flex items-center justify-center gap-2">
              <StatusIcon
                className={`w-6 h-6 ${statusColor[status.latestVersion.status as keyof typeof statusColor] || 'text-gray-600 dark:text-gray-400'}`}
              />
              <span className="text-2xl font-bold">
                v{status.latestVersion.version}
              </span>
            </div>
          ) : (
            <span className="text-2xl font-bold text-gray-400">N/A</span>
          )}
        </div>
        
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Pending Approvals
          </h3>
          <span className="text-2xl font-bold">{status.pendingApprovals}</span>
        </div>
        
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Active Experiments
          </h3>
          <span className="text-2xl font-bold">{status.activeExperiments}</span>
        </div>
      </div>
    </div>
  );
}
