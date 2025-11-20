'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { LoginPage } from '@/components/auth/login-page';
import Link from 'next/link';

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always show login page if not signed in (even during loading/mounting)
  if (!mounted || loading || !user) {
    return <LoginPage />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have admin privileges. Please contact an admin to grant you access.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-500 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mb-4 text-left">
            <p className="font-medium mb-2">To get admin access:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Your User ID: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs break-all">{user.uid}</code></li>
              <li>Go to <a href="https://console.firebase.google.com/project/nmmatrix-824a3/firestore" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">Firestore Console</a></li>
              <li>Update document: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">/users/{user.uid.substring(0, 20)}...</code></li>
              <li>Set <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">role</code> field to <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">"admin"</code></li>
              <li>Refresh this page</li>
            </ol>
          </div>
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}
