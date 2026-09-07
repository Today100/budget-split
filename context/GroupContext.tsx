// context/GroupContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, arrayUnion } from 'firebase/firestore';
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
    if (!user) return;
    
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
    await addDoc(collection(db, 'groups'), { name, members: [user.uid] });
  };

  const joinGroup = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'groups', id), { members: arrayUnion(user.uid) });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading group data...</div>;

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