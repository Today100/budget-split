'use client';

import { useState } from 'react';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
      router.push('/dashboard');
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