// app/dashboard/add/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { AddReceiptProvider, useAddReceipt } from './AddReceiptContext';
import Step1Method from './Step1Method';
import Step2Manual from './Step2Manual';
import Step3Allocation from './Step3Allocation';
import Step4Summary from './Step4Summary';

// 1. Inner component that renders the correct step
function FormSteps() {
  const { step } = useAddReceipt();

  return (
    <div className="w-full">
      {step === 1 && <Step1Method />}
      {step === 2 && <Step2Manual />}
      {step === 3 && <Step3Allocation />}
      {step === 4 && <Step4Summary />}
    </div>
  );
}

// 2. Wrapper that checks the URL for an ID and fetches existing data
function ReceiptFormWrapper() {
  const searchParams = useSearchParams();
  const receiptId = searchParams.get('id');
  
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!!receiptId);

  useEffect(() => {
    if (!receiptId) {
      setIsLoading(false);
      return;
    }
    
    const fetchReceipt = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'receipts', receiptId));
        if (docSnap.exists()) {
          setInitialData(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching receipt:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReceipt();
  }, [receiptId]);

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading receipt details...</div>;
  }

  return (
    <AddReceiptProvider initialData={initialData} receiptId={receiptId || undefined}>
      <FormSteps />
    </AddReceiptProvider>
  );
}

// 3. Main export wrapped in Suspense (required by Next.js when using useSearchParams)
export default function AddReceiptPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500">Loading...</div>}>
      <ReceiptFormWrapper />
    </Suspense>
  );
}