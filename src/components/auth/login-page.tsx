'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import toast from 'react-hot-toast';
import Link from 'next/link';

export function LoginPage() {
  const { signIn, loading, user } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setSigningIn(true);
      setError(null);
      await signIn();
      toast.success('Signed in successfully!');
      // Redirect will happen automatically via auth state change
    } catch (error: any) {
      console.error('Sign in error:', error);
      const errorMessage = error.message || 'Please check your connection and try again';
      setError(errorMessage);
      toast.error(`Sign in failed: ${errorMessage}`);
    } finally {
      setSigningIn(false);
    }
  };

  // If already signed in, show a message (shouldn't happen but just in case)
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">You are already signed in. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            nmMatrix
          </h1>
          <h2 className="text-2xl font-semibold mb-2">Admin Login</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Sign in to access the admin dashboard
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-500 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
            <p className="font-medium mb-1">⚠️ Admin Access Note:</p>
            <p>After signing in anonymously, you'll need to update your user document in Firestore with <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">role: "admin"</code></p>
          </div>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSignIn}
            disabled={signingIn || loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
          >
            {signingIn || loading ? (
              <>
                <LoadingSpinner />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                <span>Sign In Anonymously</span>
              </>
            )}
          </button>

          <div className="text-sm text-center text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="mb-2">
              You'll be signed in anonymously. An admin can grant you admin privileges later.
            </p>
            <Link
              href="/"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
