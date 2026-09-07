'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useGroup } from '../context/GroupContext';

type MonthlySummaryProps = {
  userId: string;
};

export default function MonthlySummary() {
  const { groupId } = useGroup();
  const [totalSpent, setTotalSpent] = useState(0);
  const [netSettlements, setNetSettlements] = useState<{from: string, to: string, amount: number}[]>([]);
  
  // Default to the current month in YYYY-MM format
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  useEffect(() => {
    if (!groupId) return;
    const q = query(collection(db, 'receipts'), where('groupId', '==', groupId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let monthTotal = 0;
      const balances: Record<string, number> = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Filter in-memory based on the selected month
        if (data.date && data.date.startsWith(selectedMonth)) {
          monthTotal += data.amount || 0;

          if (data.settlements) {
            data.settlements.forEach((s: {from: string, to: string, amount: number}) => {
              balances[s.from] = (balances[s.from] || 0) - s.amount;
              balances[s.to] = (balances[s.to] || 0) + s.amount;
            });
          }
        }
      });

      const debtors = Object.entries(balances)
        .filter(([_, amount]) => amount < -0.01)
        .map(([person, amount]) => ({ person, amount: Math.abs(amount) }));
        
      const creditors = Object.entries(balances)
        .filter(([_, amount]) => amount > 0.01)
        .map(([person, amount]) => ({ person, amount }));

      const simplifiedSettlements = [];
      let i = 0; let j = 0;

      while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        const settleAmount = Math.min(debtor.amount, creditor.amount);

        simplifiedSettlements.push({ from: debtor.person, to: creditor.person, amount: settleAmount });

        debtor.amount -= settleAmount;
        creditor.amount -= settleAmount;

        if (debtor.amount < 0.01) i++;
        if (creditor.amount < 0.01) j++;
      }

      setTotalSpent(monthTotal);
      setNetSettlements(simplifiedSettlements);
    });

    return () => unsubscribe();
  }, [groupId, selectedMonth]); // Re-run when the month changes

  // Format YYYY-MM to a readable string (e.g., "September 2026")
  const formatMonth = (yyyyMm: string) => {
    if (!yyyyMm) return '';
    const [year, month] = yyyyMm.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="mb-8">
      {/* Header & Month Picker */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">Summary</h2>
        <input 
          type="month" 
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spending Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{formatMonth(selectedMonth)} Spending</h3>
          <p className="text-4xl font-black text-gray-900 mt-2">${totalSpent.toFixed(2)}</p>
        </div>

        {/* Settlements Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-48">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Net Balances</h3>
          <div className="flex-1 overflow-y-auto pr-2">
            {netSettlements.length === 0 ? (
              <p className="text-gray-400 text-sm mt-2">Everyone is settled up for this month.</p>
            ) : (
              <div className="space-y-3">
                {netSettlements.map((s, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0">
                    <div className="font-medium">
                      <span className="text-red-600">{s.from}</span>
                      <span className="text-gray-400 mx-2">owes</span>
                      <span className="text-green-600">{s.to}</span>
                    </div>
                    <div className="font-bold text-gray-900">${s.amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}