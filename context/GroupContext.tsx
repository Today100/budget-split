// context/GroupContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, arrayUnion, getDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

type GroupContextType = {
  groupId: string | null;
  groupName: string | null;
  joinGroup: (id: string) => Promise<void>;
  createGroup: (name: string) => Promise<void>;
};

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [groupId, setGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    // Check if the user's UID is in any group's 'members' array
    const q = query(collection(db, 'groups'), where('members', 'array-contains', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setGroupId(snapshot.docs[0].id);
        setGroupName(snapshot.docs[0].data().name);
      } else {
        setGroupId(null);
        setGroupName(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createGroup = async (name: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'groups'), { name, members: [user.uid] });
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  };

  const joinGroup = async (id: string) => {
    if (!user) return;
    
    try {
      const groupRef = doc(db, 'groups', id.trim()); // trim to remove accidental spaces
      
      // 1. Check if the group actually exists first
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) {
        throw new Error("Invalid code. No group found with that ID.");
      }

      // 2. Add the user to the array
      await updateDoc(groupRef, { members: arrayUnion(user.uid) });
      
    } catch (error: any) {
      console.error("Error joining group:", error);
      // Re-throw so the UI component can catch it and show an error message
      throw new Error(error.message || "Failed to join group"); 
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading group data...</div>;

  return (
    <GroupContext.Provider value={{ groupId, groupName, joinGroup, createGroup }}>
      {children}
    </GroupContext.Provider>
  );
}

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (!context) throw new Error('useGroup must be used within a GroupProvider');
  return context;
};