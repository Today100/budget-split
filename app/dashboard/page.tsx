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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Welcome back, {user.displayName?.split(' ')[0]}!
      </h1>
      
      {/* Monthly Summary Cards */}
      <MonthlySummary />

      {/* Real-time Data Grid */}
      <ReceiptGrid />
    </div>
  );
}