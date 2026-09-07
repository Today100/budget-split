// components/ReceiptGrid.tsx
'use client';

import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import Link from 'next/link';
import { useGroup } from '../context/GroupContext';

type Receipt = {
  id: string;
  storeName: string;
  amount: number;
  date: string;
};

export default function ReceiptGrid() {
  const { groupId } = useGroup();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;
    const q = query(collection(db, 'receipts'), where('groupId', '==', groupId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const receiptData: Receipt[] = [];
      snapshot.forEach((doc) => {
        receiptData.push({ id: doc.id, ...doc.data() } as Receipt);
      });
      
      receiptData.sort((a, b) => b.date.localeCompare(a.date));
      
      setReceipts(receiptData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this receipt?')) {
      await deleteDoc(doc(db, 'receipts', id));
    }
  };

  if (loading) {
    return <div className="py-8 text-center text-gray-500">Loading your data...</div>;
  }

  if (receipts.length === 0) {
    return (
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 text-center mx-4 md:mx-0">
        <p className="text-gray-500">No receipts yet. Add your first one above!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Horizontal scroll container for mobile tables */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
              <th className="p-4">Date</th>
              <th className="p-4">Store</th>
              <th className="p-4">Amount</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm text-gray-900">
            {receipts.map((receipt) => (
              <tr key={receipt.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 whitespace-nowrap">{receipt.date}</td>
                <td className="p-4 font-medium">{receipt.storeName}</td>
                <td className="p-4 font-semibold">${receipt.amount.toFixed(2)}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-4">
                    <Link 
                      href={`/dashboard/edit/${receipt.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      View / Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(receipt.id)}
                      className="text-red-500 hover:text-red-700 font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}