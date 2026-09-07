// app/dashboard/roommates/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useGroup } from '../../../context/GroupContext';

type Roommate = {
  id: string;
  name: string;
};

export default function RoommatesPage() {
  const { user } = useAuth();
  const { groupId } = useGroup();
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!groupId) return;
    
    const q = query(collection(db, 'roommates'), where('groupId', '==', groupId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rmData: Roommate[] = [];
      snapshot.forEach((doc) => {
        rmData.push({ id: doc.id, ...doc.data() } as Roommate);
      });
      rmData.sort((a, b) => a.name.localeCompare(b.name));
      setRoommates(rmData);
    });

    return () => unsubscribe();
  }, [groupId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !user) return;

    setIsAdding(true);
    try {
      await addDoc(collection(db, 'roommates'), {
        groupId,
        name: newName.trim(),
        createdAt: serverTimestamp()
      });
      setNewName('');
    } catch (error) {
      console.error("Error adding roommate: ", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Remove this roommate?')) {
      await deleteDoc(doc(db, 'roommates', id));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4 md:p-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Roommates</h1>
        <p className="text-gray-500 text-sm mt-1">Add the people you split expenses with.</p>
      </div>

      <form onSubmit={handleAdd} className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <input 
          type="text" 
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Roommate's name (e.g. Xueqi)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          required
        />
        <button 
          type="submit" 
          disabled={isAdding}
          className="w-full sm:w-auto px-6 py-2 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
        >
          {isAdding ? 'Adding...' : 'Add'}
        </button>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {roommates.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No roommates added yet. Add yourself and your housemates above!
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {roommates.map((rm) => (
              <li key={rm.id} className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-900">{rm.name}</span>
                <button 
                  onClick={() => handleDelete(rm.id)}
                  className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}