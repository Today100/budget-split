// app/dashboard/add/page.tsx
'use client';

import { AddReceiptProvider, useAddReceipt } from './AddReceiptContext';
import Step1Method from './Step1Method';
import Step2Manual from './Step2Manual';
import Step3Allocation from './Step3Allocation';
import Step4Summary from './Step4Summary'; // <-- Import

function StepRouter() {
  const { step } = useAddReceipt();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
        <span className={step >= 1 ? 'font-bold text-black' : ''}>1. Method</span>
        <span>→</span>
        <span className={step >= 2 ? 'font-bold text-black' : ''}>2. Details</span>
        <span>→</span>
        <span className={step >= 3 ? 'font-bold text-black' : ''}>3. Allocation</span>
        <span>→</span>
        <span className={step >= 4 ? 'font-bold text-black' : ''}>4. Summary</span>
      </div>

      {step === 1 && <Step1Method />}
      {step === 2 && <Step2Manual />}
      {step === 3 && <Step3Allocation />}
      {step === 4 && <Step4Summary />}      {/* <-- Connect Step 4 */}
    </div>
  );
}

export default function AddReceiptPage() {
  return (
    <AddReceiptProvider>
      <StepRouter />
    </AddReceiptProvider>
  );
}