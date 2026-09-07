// app/dashboard/add/AddReceiptContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { useGroup } from '../../../context/GroupContext';

export type LineItem = {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
  isTaxed: boolean;
  taxPercent: number;
};

export type ReceiptState = {
  storeName: string;
  date: string;
  time: string;
  payers: string[];
  items: LineItem[];
  allocations: Record<string, string[]>; // Will be used in Step 3
};

const emptyState: ReceiptState = {
  storeName: '',
  date: '',
  time: '',
  payers: [],
  items: [],
  allocations: {}
};

type AddReceiptContextType = {
  step: number;
  setStep: (step: number) => void;
  receiptData: ReceiptState;
  setReceiptData: React.Dispatch<React.SetStateAction<ReceiptState>>;
  isScanning: boolean;
  simulateScan: (file: File) => void;
  roommates: string[];
  receiptId: string | null; // <-- NEW
};

const AddReceiptContext = createContext<AddReceiptContextType | undefined>(undefined);

// Update the Provider props to accept initialData and receiptId
export function AddReceiptProvider({ 
  children, 
  initialData, 
  receiptId 
}: { 
  children: ReactNode; 
  initialData?: ReceiptState; 
  receiptId?: string; 
}) {
  const { user } = useAuth();
  const { groupId } = useGroup();
  
  // If we pass in initialData, skip to Step 2!
  const [step, setStep] = useState(initialData ? 2 : 1);
  const [receiptData, setReceiptData] = useState<ReceiptState>({
    ...emptyState,
    ...(initialData || {}),
    payers: initialData?.payers || [],
    allocations: initialData?.allocations || {},
    items: initialData?.items || []
    });
  const [isScanning, setIsScanning] = useState(false);
  const [roommates, setRoommates] = useState<string[]>([]);

  // Fetch dynamic roommates
  useEffect(() => {
    if (!groupId) return;
    const q = query(collection(db, 'roommates'), where('groupId', '==', groupId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const names: string[] = [];
      snapshot.forEach((doc) => names.push(doc.data().name));
      names.sort();
      setRoommates(names);
    });
    return () => unsubscribe();
  }, [user]);

  const simulateScan = (file: File) => {
    setIsScanning(true);
    // Simulate a 2-second AI OCR processing delay
    setTimeout(() => {
      setReceiptData({
        ...receiptData,
        storeName: 'Mock Grocery Store',
        date: new Date().toISOString().split('T')[0],
        time: '14:30',
        items: [
          { id: '1', name: 'Apples', qty: 1, unitPrice: 4.99, isTaxed: false, taxPercent: 13 },
          { id: '2', name: 'Paper Towels', qty: 2, unitPrice: 8.99, isTaxed: true, taxPercent: 13 }
        ]
      });
      setIsScanning(false);
      setStep(2); // Move to manual input automatically
    }, 2000);
  };

  return (
    <AddReceiptContext.Provider value={{ 
      step, setStep, receiptData, setReceiptData, isScanning, simulateScan, roommates, 
      receiptId: receiptId || null // <-- Pass it down
    }}>
      {children}
    </AddReceiptContext.Provider>
  );
}

export const useAddReceipt = () => {
  const context = useContext(AddReceiptContext);
  if (!context) throw new Error('useAddReceipt must be used within an AddReceiptProvider');
  return context;
};