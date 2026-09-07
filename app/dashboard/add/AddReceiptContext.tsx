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
  receiptId: string | null;
};

const AddReceiptContext = createContext<AddReceiptContextType | undefined>(undefined);

export function AddReceiptProvider({ children, initialData, receiptId }: { children: ReactNode; initialData?: ReceiptState; receiptId?: string; }) {
  const { user } = useAuth();
  const { groupId } = useGroup();
  
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
  }, [groupId]); // Fixed dependency array

  const simulateScan = async (file: File) => {
    setIsScanning(true);
    
    try {
      // 1. Convert the File to a Base64 string
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const result = reader.result?.toString();
          if (result) {
            // Strip off the "data:image/jpeg;base64," prefix
            resolve(result.split(',')[1]);
          } else {
            reject(new Error("Failed to read file"));
          }
        };
        reader.onerror = error => reject(error);
      });

      // 2. Send it to our Next.js API route
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image, mimeType: file.type || 'application/pdf' })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Backend Error:", errorData);
        throw new Error(errorData.error || `API returned ${res.status}`);
      }
      const parsedData = await res.json();

      // 3. Map the Gemini JSON output to our app's structure
      const itemsWithIds = (parsedData.items || []).map((item: any) => ({
        id: Date.now().toString() + Math.random().toString(),
        name: item.name || 'Unknown Item',
        qty: item.qty || 1,
        unitPrice: item.unitPrice || 0,
        isTaxed: item.isTaxed || false,
        taxPercent: 13 // Default to Ontario tax
      }));

      // 4. Update the state and move to Step 2
      setReceiptData({
        ...receiptData,
        storeName: parsedData.storeName || '',
        date: parsedData.date || new Date().toISOString().split('T')[0],
        time: parsedData.time || '12:00',
        items: itemsWithIds,
      });
      
      setStep(2);
      
    } catch (error) {
      console.error("Scan error:", error);
      alert("Failed to read receipt. Please enter the details manually.");
      setStep(2); // Bump them to manual entry if AI fails
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <AddReceiptContext.Provider value={{ step, setStep, receiptData, setReceiptData, isScanning, simulateScan, roommates, receiptId: receiptId || null }}>
      {children}
    </AddReceiptContext.Provider>
  );
}

export const useAddReceipt = () => {
  const context = useContext(AddReceiptContext);
  if (!context) throw new Error('useAddReceipt must be used within an AddReceiptProvider');
  return context;
};