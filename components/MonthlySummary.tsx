// components/MonthlySummary.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useGroup } from '../context/GroupContext';

export default function MonthlySummary() {
  const { groupId } = useGroup();
  const [totalSpent, setTotalSpent] = useState(0);
  const [netSettlements, setNetSettlements] = useState<{from: string, to: string, amount: number}[]>([]);
  
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  useEffect(() => {
    if (!groupId) return;
    const q = query(collection(db, 'receipts'), where('groupId', '==', groupId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let monthTotal = 0;
      const balances: Record<string, number> = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        
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
  }, [groupId, selectedMonth]);

  const formatMonth = (yyyyMm: string) => {
    if (!yyyyMm) return '';
    const [year, month] = yyyyMm.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Header & Month Picker: Stacked on mobile */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h2 className="text-lg font-bold text-gray-900">Summary</h2>
        <input 
          type="month" 
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <h3 className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">{formatMonth(selectedMonth)} Spending</h3>
          <p className="text-3xl md:text-4xl font-black text-gray-900 mt-2">${totalSpent.toFixed(2)}</p>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-[12rem] md:h-48">
          <h3 className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Net Balances</h3>
          <div className="flex-1 overflow-y-auto pr-2">
            {netSettlements.length === 0 ? (
              <p className="text-gray-400 text-sm mt-2">Everyone is settled up for this month.</p>
            ) : (
              <div className="space-y-3">
                {netSettlements.map((s, idx) => (
                  <div key={idx} className="flex flex-wrap sm:flex-nowrap justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 gap-2">
                    <div className="font-medium break-words">
                      <span className="text-red-600">{s.from}</span>
                      <span className="text-gray-400 mx-2">owes</span>
                      <span className="text-green-600">{s.to}</span>
                    </div>
                    <div className="font-bold text-gray-900 ml-auto">${s.amount.toFixed(2)}</div>
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