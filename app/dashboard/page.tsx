// app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import ReceiptGrid from '../../components/ReceiptGrid';
import MonthlySummary from '../../components/MonthlySummary';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    // Added responsive padding (p-4 for mobile, md:p-8 for desktop) and a max-width container
    <div className="space-y-6 p-4 md:p-8 w-full max-w-7xl mx-auto">
      
      {/* Scaled text to 2xl on mobile, 3xl on medium+ screens. Added break-words for long names. */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 break-words">
        Welcome back, {user.displayName?.split(' ')[0]}!
      </h1>
      
      {/* Monthly Summary Cards */}
      <MonthlySummary />

      {/* Real-time Data Grid */}
      <ReceiptGrid />
    </div>
  );
}