// components/AddReceiptForm.tsx
'use client';

import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function AddReceiptForm({ userId }: { userId: string }) {
  const [store, setStore] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store || !amount || !date) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'receipts'), {
        userId,
        storeName: store,
        amount: parseFloat(amount),
        date, // Stored as YYYY-MM-DD string for easy sorting
        createdAt: serverTimestamp()
      });
      
      // Reset form
      setStore('');
      setAmount('');
      setDate('');
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Add New Receipt</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Store</label>
          <input 
            type="text" 
            required
            value={store}
            onChange={(e) => setStore(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="e.g. Loblaws"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
          <input 
            type="number" 
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input 
            type="date" 
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="px-4 py-2 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {isSubmitting ? 'Adding...' : 'Add Receipt'}
      </button>
    </form>
  );
}