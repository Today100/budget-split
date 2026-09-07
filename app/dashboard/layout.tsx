// app/dashboard/layout.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { GroupProvider, useGroup } from '../../context/GroupContext';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { groupId, groupName, createGroup, joinGroup } = useGroup();
  
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  // 1. If not in a group, show the Create/Join UI
  if (!groupId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Create a Household</h2>
            <div className="flex gap-2">
              <input type="text" placeholder="e.g. 123 Main St" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" />
              <button onClick={() => createGroup(newGroupName)} className="px-4 py-2 bg-black text-white rounded-lg font-medium">Create</button>
            </div>
          </div>
          <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">OR</span></div></div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Join with a Code</h2>
            <div className="flex gap-2">
              <input type="text" placeholder="Paste Group ID here" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" />
              <button onClick={() => joinGroup(joinCode)} className="px-4 py-2 bg-black text-white rounded-lg font-medium">Join</button>
            </div>
          </div>
          <button onClick={() => signOut(auth)} className="w-full text-sm text-gray-500 hover:text-black">Sign out</button>
        </div>
      </div>
    );
  }

  // 2. If in a group, show the normal sidebar
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
        <div className="p-6 space-y-6">
          <div className="text-xl font-bold text-gray-900 tracking-tight">{groupName}</div>
          <Link href="/dashboard/add" className="block w-full py-3 px-4 bg-black hover:bg-gray-800 text-white text-center text-sm font-medium rounded-lg">
            + Add a Receipt
          </Link>
          <nav className="space-y-1">
            <Link href="/dashboard" className={`block px-3 py-2 rounded-md text-sm font-medium ${pathname === '/dashboard' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}>Dashboard</Link>
            <Link href="/dashboard/receipts" className={`block px-3 py-2 rounded-md text-sm font-medium ${pathname === '/dashboard/receipts' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}>All receipts</Link>
            <Link href="/dashboard/roommates" className={`block px-3 py-2 rounded-md text-sm font-medium ${pathname === '/dashboard/roommates' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}>Manage roommates</Link>
          </nav>
        </div>
        <div className="p-6 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-900 truncate">{user?.displayName}</div>
          <div className="text-xs text-gray-500 mt-1 cursor-pointer" onClick={() => navigator.clipboard.writeText(groupId)}>Group Code: {groupId.slice(0,6)}... (Click to copy)</div>
          <button onClick={() => signOut(auth)} className="text-sm text-red-500 hover:text-red-700 mt-4 font-medium">Sign Out</button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <GroupProvider>
      <DashboardContent>{children}</DashboardContent>
    </GroupProvider>
  );
}