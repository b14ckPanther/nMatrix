'use client';

import { useState } from 'react';
import { approvals } from '@/lib/firebase/firestore';
import { formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Approval } from '@/types/evolution';
import Link from 'next/link';

export function ApprovalList({ approvals: approvalsList }: { approvals: Approval[] }) {
  const [processing, setProcessing] = useState<string | null>(null);

  const handleApproval = async (approvalId: string, status: 'approved' | 'rejected', feedback?: string) => {
    try {
      setProcessing(approvalId);
      await approvals.update(approvalId, {
        status,
        reviewedAt: new Date(),
        feedback,
      });
      toast.success(`Approval ${status}`);
      // Reload to refresh list
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      toast.error(`Failed to update approval: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  if (approvalsList.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center text-gray-600 dark:text-gray-400">
        <p>No pending approvals</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {approvalsList.map((approval) => (
        <div
          key={approval.id}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <Link
                href={`/admin/versions/${approval.versionId}`}
                className="text-lg font-semibold hover:underline"
              >
                Version {approval.versionId.slice(0, 8)}
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {formatRelativeTime(approval.requestedAt)}
              </p>
              <p className="text-sm mt-2">
                {approval.mutationIds.length} mutation{approval.mutationIds.length !== 1 ? 's' : ''} pending
              </p>
            </div>
            <span className={`px-2 py-1 rounded text-xs ${
              approval.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
              approval.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {approval.status}
            </span>
          </div>
          
          {approval.feedback && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Feedback: {approval.feedback}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => handleApproval(approval.id, 'approved')}
              disabled={processing === approval.id}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {processing === approval.id ? 'Processing...' : 'Approve'}
            </button>
            <button
              onClick={() => handleApproval(approval.id, 'rejected')}
              disabled={processing === approval.id}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {processing === approval.id ? 'Processing...' : 'Reject'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
