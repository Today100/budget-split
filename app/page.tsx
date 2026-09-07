// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext'; // Adjust path if necessary

export default function SignInPage() {
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const { user } = useAuth();

  // Watch for the user object to populate after the Google redirect
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // This will redirect the browser away from your app
      await signInWithRedirect(auth, provider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-sm border border-gray-200 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Receipt Manager</h1>
        <p className="text-sm text-gray-500">Sign in to sync your data</p>
        
        <button 
          onClick={handleGoogleSignIn}
          className="w-full py-2.5 px-4 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Sign in with Google
        </button>
        
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </main>
  );
}