// app/dashboard/receipts/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useGroup } from '../../../context/GroupContext';

type Receipt = {
  id: string;
  storeName: string;
  date: string;
  amount: number;
  payers: string[];
};

export default function ReceiptsPage() {
  const { groupId } = useGroup();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;

    const q = query(
      collection(db, 'receipts'), 
      where('groupId', '==', groupId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Receipt[];
      
      // Sort in-memory (newest first) to avoid needing a Firestore composite index
      fetched.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setReceipts(fetched);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [groupId]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this receipt? This will update the monthly balances.')) return;
    try {
      await deleteDoc(doc(db, 'receipts', id));
    } catch (error) {
      console.error("Error deleting receipt:", error);
      alert("Failed to delete receipt.");
    }
  };

  if (isLoading) {
    return <div className="text-gray-500 animate-pulse">Loading history...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Receipts</h1>
          <p className="text-gray-500 mt-2">A complete ledger of your household expenses.</p>
        </div>
        <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {receipts.length} total entries
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {receipts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No receipts found. Time to go shopping!
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-medium text-gray-600">Date</th>
                <th className="p-4 font-medium text-gray-600">Store</th>
                <th className="p-4 font-medium text-gray-600">Paid By</th>
                <th className="p-4 font-medium text-gray-600">Amount</th>
                <th className="p-4 font-medium text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {receipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-500 whitespace-nowrap">
                    {receipt.date}
                  </td>
                  <td className="p-4 font-medium text-gray-900">
                    {receipt.storeName}
                  </td>
                  <td className="p-4 text-gray-600">
                    {receipt.payers?.join(', ') || 'Unknown'}
                  </td>
                  <td className="p-4 font-bold text-gray-900">
                    ${receipt.amount?.toFixed(2)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-4">
                      <Link 
                        href={`/dashboard/add?id=${receipt.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        Edit
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
        )}
      </div>
    </div>
  );
}