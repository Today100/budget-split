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

  // 1. Helper to calculate final price per item
  const calculateFinalPrice = (item: LineItem) => {
    const base = item.qty * item.unitPrice;
    return item.isTaxed ? base * (1 + (item.taxPercent / 100)) : base;
  };

  // 2. Calculate Total Receipt Cost
  const totalCost = receiptData.items.reduce((sum, item) => sum + calculateFinalPrice(item), 0);

  // 3. Determine Balances (Paid - Share = Balance)
  const balances: Record<string, number> = {};
  roommates.forEach(rm => (balances[rm] = 0));

  // Subtract shares (what people owe for their items)
  receiptData.items.forEach((item) => {
    const finalPrice = calculateFinalPrice(item);
    const allocatedTo = receiptData.allocations[item.id]?.[0];

    if (allocatedTo) {
      balances[allocatedTo] -= finalPrice;
    } else {
      const splitAmount = finalPrice / roommates.length;
      roommates.forEach(rm => { balances[rm] -= splitAmount; });
    }
  });

  // Add payments (what people already paid at the register)
  // If no payers selected, assume Grace paid for fallback
  const payers = receiptData.payers.length > 0 ? receiptData.payers : ["Grace (Me)"];
  const splitPayment = totalCost / payers.length;
  payers.forEach(payer => {
    balances[payer] += splitPayment;
  });

  // 4. Match Debtors (negative balance) to Creditors (positive balance)
  const debtors = Object.entries(balances)
    .filter(([_, amount]) => amount < -0.01)
    .map(([person, amount]) => ({ person, amount: Math.abs(amount) }));
    
  const creditors = Object.entries(balances)
    .filter(([_, amount]) => amount > 0.01)
    .map(([person, amount]) => ({ person, amount }));

  const settlements: { from: string; to: string; amount: number }[] = [];
  
  let i = 0;
  let j = 0;
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
        // If editing, UPDATE the existing document
        await updateDoc(doc(db, 'receipts', receiptId), payload);
      } else {
        // If creating new, ADD a new document
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
    <div className="space-y-6">
      {/* Receipt Overview */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{receiptData.storeName || 'Unnamed Receipt'}</h2>
          <p className="text-sm text-gray-500">{receiptData.date} • Paid by {payers.join(', ')}</p>
        </div>
        <div className="text-2xl font-black text-gray-900">
          ${totalCost.toFixed(2)}
        </div>
      </div>

      {/* Settlements Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Who owes who</h3>
        </div>
        <div className="p-6">
          {settlements.length === 0 ? (
            <p className="text-gray-500 text-center">Everything is settled equally!</p>
          ) : (
            <div className="space-y-4">
              {settlements.map((settlement, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="font-medium text-gray-900">
                    <span className="text-red-600">{settlement.from}</span>
                    <span className="text-gray-400 mx-2">owes</span>
                    <span className="text-green-600">{settlement.to}</span>
                  </div>
                  <div className="font-bold text-gray-900">
                    ${settlement.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button 
          onClick={() => setStep(3)}
          className="px-6 py-3 text-gray-600 font-medium hover:text-black transition-colors disabled:opacity-50"
          disabled={isSubmitting}
        >
          ← Back to Allocation
        </button>
        <button 
          onClick={handleGenerate}
          disabled={isSubmitting}
          className="px-8 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 shadow-sm"
        >
          {isSubmitting ? 'Saving...' : 'Generate & Save ✓'}
        </button>
      </div>
    </div>
  );
}