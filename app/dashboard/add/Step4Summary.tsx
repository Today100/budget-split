// app/dashboard/add/Step4Summary.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../lib/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAddReceipt, LineItem } from './AddReceiptContext';
import { useGroup } from '../../../context/GroupContext';

export default function Step4Summary() {
  const { receiptData, setStep, roommates, receiptId } = useAddReceipt();
  const { user } = useAuth();
  const { groupId } = useGroup();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateFinalPrice = (item: LineItem) => {
    const base = item.qty * item.unitPrice;
    return item.isTaxed ? base * (1 + (item.taxPercent / 100)) : base;
  };

  const totalCost = receiptData.items.reduce((sum, item) => sum + calculateFinalPrice(item), 0);

  // 3. Determine Balances (Paid - Share = Balance)
  const balances: Record<string, number> = {};
  roommates.forEach(rm => (balances[rm] = 0));

  // Add payments safely using (balances[payer] || 0)
  const payers = receiptData.payers.length > 0 ? receiptData.payers : ["Grace (Me)"];
  const splitPayment = totalCost / payers.length;
  payers.forEach(payer => {
    balances[payer] = (balances[payer] || 0) + splitPayment;
  });

  // Subtract shares safely
  receiptData.items.forEach((item) => {
    const finalPrice = calculateFinalPrice(item);
    const allocatedTo = receiptData.allocations[item.id]?.[0];

    if (allocatedTo) {
      balances[allocatedTo] = (balances[allocatedTo] || 0) - finalPrice;
    } else {
      const splitDivisor = Math.max(roommates.length, 1);
      const splitAmount = finalPrice / splitDivisor;
      roommates.forEach(rm => { 
        balances[rm] = (balances[rm] || 0) - splitAmount; 
      });
    }
  });

  // 4. Match Debtors to Creditors
  const debtors = Object.entries(balances)
    .filter(([_, amount]) => amount < -0.01)
    .map(([person, amount]) => ({ person, amount: Math.abs(amount) }));
    
  const creditors = Object.entries(balances)
    .filter(([_, amount]) => amount > 0.01)
    .map(([person, amount]) => ({ person, amount }));

  const settlements: { from: string; to: string; amount: number }[] = [];
  
  let i = 0; let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const settleAmount = Math.min(debtor.amount, creditor.amount);

    settlements.push({ from: debtor.person, to: creditor.person, amount: settleAmount });

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  // 5. Handle Save to Firestore
  const handleGenerate = async () => {
    if (!user || !groupId) return;
    setIsSubmitting(true);
    
    const payload = {
      groupId,
      createdBy: user.uid,
      storeName: receiptData.storeName || 'Unknown Store',
      date: receiptData.date,
      time: receiptData.time,
      amount: totalCost,
      items: receiptData.items,
      allocations: receiptData.allocations,
      settlements,
      payers: receiptData.payers
    };

    try {
      if (receiptId) {
        await updateDoc(doc(db, 'receipts', receiptId), payload);
      } else {
        await addDoc(collection(db, 'receipts'), {
          ...payload,
          createdAt: serverTimestamp()
        });
      }
      router.push('/dashboard');
    } catch (error) {
      console.error("Error saving receipt:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Summary Header Card */}
      <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 break-words">{receiptData.storeName || 'Unnamed Receipt'}</h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1">{receiptData.date} • Paid by {payers.join(', ')}</p>
        </div>
        <div className="text-2xl md:text-3xl font-black text-gray-900 self-end md:self-auto">
          ${totalCost.toFixed(2)}
        </div>
      </div>

      {/* Settlements Box */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 text-sm md:text-base">Who owes who</h3>
        </div>
        <div className="p-4 md:p-6">
          {settlements.length === 0 ? (
            <p className="text-gray-500 text-center text-sm md:text-base">Everything is settled equally!</p>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {settlements.map((settlement, idx) => (
                <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-100 gap-2">
                  <div className="font-medium text-gray-900 text-sm md:text-base">
                    <span className="text-red-600 break-words">{settlement.from}</span>
                    <span className="text-gray-400 mx-2 text-xs md:text-sm">owes</span>
                    <span className="text-green-600 break-words">{settlement.to}</span>
                  </div>
                  <div className="font-bold text-gray-900 ml-auto text-sm md:text-base">
                    ${settlement.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Final Action Buttons */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-3 md:gap-0 pt-2">
        <button 
          onClick={() => setStep(3)}
          className="w-full md:w-auto px-6 py-3.5 md:py-3 text-gray-600 font-medium hover:text-black hover:bg-gray-100 md:hover:bg-transparent rounded-lg md:rounded-none transition-colors disabled:opacity-50"
          disabled={isSubmitting}
        >
          ← Back to Allocation
        </button>
        <button 
          onClick={handleGenerate}
          disabled={isSubmitting}
          className="w-full md:w-auto px-8 py-3.5 md:py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 shadow-sm flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            'Generate & Save ✓'
          )}
        </button>
      </div>
    </div>
  );
}