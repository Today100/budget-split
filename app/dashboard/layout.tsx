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
  
  // Setup Screen States
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Mobile Nav State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. Handlers for Create/Join to catch errors and prevent page refreshes
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    
    setIsCreating(true);
    setError('');
    try {
      await createGroup(newGroupName);
    } catch (err: any) {
      setError(err.message || 'Failed to create group.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    
    setIsJoining(true);
    setError('');
    try {
      await joinGroup(joinCode);
    } catch (err: any) {
      setError(err.message || 'Failed to join group. Please check the code.');
    } finally {
      setIsJoining(false);
    }
  };

  // 2. Setup UI (If not in a group)
  if (!groupId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 space-y-8">
          
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate}>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Create a Household</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="text" 
                placeholder="e.g. 123 Main St" 
                value={newGroupName} 
                onChange={(e) => setNewGroupName(e.target.value)} 
                className="flex-1 px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" 
                required
              />
              <button 
                type="submit" 
                disabled={isCreating || isJoining}
                className="px-6 py-3 sm:py-2 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>
          
          <form onSubmit={handleJoin}>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Join with a Code</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="text" 
                placeholder="Paste Group ID here" 
                value={joinCode} 
                onChange={(e) => setJoinCode(e.target.value)} 
                className="flex-1 px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" 
                required
              />
              <button 
                type="submit" 
                disabled={isJoining || isCreating}
                className="px-6 py-3 sm:py-2 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {isJoining ? 'Joining...' : 'Join'}
              </button>
            </div>
          </form>
          
          <button 
            onClick={() => signOut(auth)} 
            className="w-full text-sm text-gray-500 hover:text-black py-2"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // 3. Dashboard Layout UI (Mobile-friendly sidebar)
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4 sticky top-0 z-20">
        <div className="font-bold text-gray-900">{groupName}</div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 hover:text-black focus:outline-none"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        ${isMobileMenuOpen ? 'flex' : 'hidden'} 
        md:flex flex-col w-full md:w-64 bg-white md:border-r border-b md:border-b-0 border-gray-200 justify-between
        md:sticky md:top-0 md:h-screen
      `}>
        <div className="p-6 space-y-6">
          <div className="hidden md:block text-xl font-bold text-gray-900 tracking-tight break-words">{groupName}</div>
          <Link 
            href="/dashboard/add" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="block w-full py-3 px-4 bg-black hover:bg-gray-800 text-white text-center text-sm font-medium rounded-lg transition-colors"
          >
            + Add a Receipt
          </Link>
          <nav className="space-y-1">
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/dashboard" className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/dashboard' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}>Dashboard</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/dashboard/receipts" className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/dashboard/receipts' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}>All receipts</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/dashboard/roommates" className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/dashboard/roommates' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}>Manage roommates</Link>
          </nav>
        </div>
        <div className="p-6 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-900 truncate">{user?.displayName}</div>
          <div 
            className="text-xs text-gray-500 mt-1 cursor-pointer hover:text-gray-900 transition-colors" 
            onClick={() => navigator.clipboard.writeText(groupId)}
          >
            Code: {groupId.slice(0,6)}... (Copy)
          </div>
          <button 
            onClick={() => signOut(auth)} 
            className="text-sm text-red-500 hover:text-red-700 mt-4 font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 w-full max-w-full overflow-hidden">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
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