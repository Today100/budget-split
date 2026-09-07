// app/dashboard/edit/[id]/page.tsx
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { AddReceiptProvider, useAddReceipt } from '../../add/AddReceiptContext';
import Step2Manual from '../../add/Step2Manual';
import Step3Allocation from '../../add/Step3Allocation';
import Step4Summary from '../../add/Step4Summary';

// The router function that was missing
function EditStepRouter() {
  const { step } = useAddReceipt();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
        <span className={step >= 2 ? 'font-bold text-black' : ''}>1. Details</span>
        <span>→</span>
        <span className={step >= 3 ? 'font-bold text-black' : ''}>2. Allocation</span>
        <span>→</span>
        <span className={step >= 4 ? 'font-bold text-black' : ''}>3. Summary</span>
      </div>

      {step === 2 && <Step2Manual />}
      {step === 3 && <Step3Allocation />}
      {step === 4 && <Step4Summary />}
    </div>
  );
}

export default function EditReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const docRef = doc(db, 'receipts', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setInitialData(docSnap.data());
        } else {
          router.push('/dashboard'); 
        }
      } catch (error) {
        console.error("Error fetching receipt:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [id, router]);

  if (loading) {
    return <div className="py-24 text-center text-gray-500">Loading receipt data...</div>;
  }

  return (
    <AddReceiptProvider initialData={initialData} receiptId={id}>
      <EditStepRouter />
    </AddReceiptProvider>
  );
}