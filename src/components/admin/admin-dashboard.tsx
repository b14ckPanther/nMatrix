'use client';

import { useEffect, useState } from 'react';
import { triggerEvolution } from '@/lib/firebase/functions';
import { approvals, versions } from '@/lib/firebase/firestore';
import { orderBy, limit, where } from 'firebase/firestore';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ApprovalList } from './approval-list';
import { VersionsList } from './versions-list';
import toast from 'react-hot-toast';
import type { Approval, VersionDNA } from '@/types/evolution';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import Link from 'next/link';

export function AdminDashboard() {
  const [pendingApprovals, setPendingApprovals] = useState<Approval[]>([]);
  const [versionsList, setVersionsList] = useState<VersionDNA[]>([]);
  const [loading, setLoading] = useState(true);
  const [evolving, setEvolving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [approvalsData, versionsData] = await Promise.all([
          approvals.getPending(),
          versions.getAll([orderBy('createdAt', 'desc'), limit(10)]),
        ]);
        setPendingApprovals(approvalsData);
        setVersionsList(versionsData);
      } catch (error: any) {
        toast.error(`Failed to fetch data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleTriggerEvolution = async () => {
    try {
      setEvolving(true);
      const result = await triggerEvolution();
      toast.success(result.message || 'Evolution cycle started');
      // Refresh data after a delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      toast.error(`Failed to trigger evolution: ${error.message}`);
    } finally {
      setEvolving(false);
    }
  };

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
              <span className="text-sm text-gray-600 dark:text-gray-400">Admin Dashboard</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={handleTriggerEvolution}
            disabled={evolving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {evolving ? 'Starting Evolution...' : 'Trigger Evolution Cycle'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Pending Approvals ({pendingApprovals.length})</h2>
            <ApprovalList approvals={pendingApprovals} />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Versions</h2>
            <VersionsList versions={versionsList} />
          </div>
        </div>
      </main>
    </div>
  );
}
