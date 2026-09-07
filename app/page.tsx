// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function SignInPage() {
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // If AuthContext already has the user, go straight to dashboard
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    
    try {
      // 1. Fire the popup immediately to bypass strict mobile browser blockers
      const signInPromise = signInWithPopup(auth, provider);
      
      // 2. Process React state updates after the popup is successfully triggered
      setIsProcessing(true);
      setError('');
      
      // 3. Await resolution
      await signInPromise;
      
      router.push('/dashboard');
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message);
      setIsProcessing(false);
    }
  };

  return (
    // Added p-4 so the container doesn't touch the screen edges on small phones
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-6 md:p-8 space-y-6 bg-white rounded-xl shadow-sm border border-gray-200 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Receipt Manager</h1>
        <p className="text-sm text-gray-500">Sign in to sync your data</p>
        
        {isProcessing ? (
          // Increased vertical padding (py-3) for mobile consistency
          <div className="py-3 px-4 w-full text-sm font-medium text-gray-500 bg-gray-100 rounded-lg animate-pulse">
            Authenticating...
          </div>
        ) : (
          <button 
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Sign in with Google
          </button>
        )}
        
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </main>
  );
}