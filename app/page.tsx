// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function SignInPage() {
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(true); // Start in loading state
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // 1. If AuthContext already has the user, go straight to dashboard
    if (user) {
      router.push('/dashboard');
      return;
    }

    // 2. Otherwise, explicitly check if we just returned from a Google redirect
    const resolveRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          router.push('/dashboard');
        } else {
          // No redirect result and no user, safe to show the login button
          setIsProcessing(false);
        }
      } catch (err: any) {
        console.error("Redirect Error:", err);
        setError(err.message);
        setIsProcessing(false);
      }
    };

    resolveRedirect();
  }, [user, router]);

  const handleGoogleSignIn = async () => {
    try {
      setIsProcessing(true);
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (err: any) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-sm border border-gray-200 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Receipt Manager</h1>
        <p className="text-sm text-gray-500">Sign in to sync your data</p>
        
        {isProcessing ? (
          <div className="py-2.5 px-4 w-full text-sm font-medium text-gray-500 bg-gray-100 rounded-lg animate-pulse">
            Authenticating...
          </div>
        ) : (
          <button 
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Sign in with Google
          </button>
        )}
        
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </main>
  );
}