// app/dashboard/add/Step1Method.tsx
'use client';

import { useAddReceipt } from './AddReceiptContext';

export default function Step1Method() {
  const { setStep, simulateScan, isScanning } = useAddReceipt();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) simulateScan(file);
  };

  if (isScanning) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        <p className="text-lg font-medium text-gray-900">Scanning receipt...</p>
        <p className="text-gray-500 text-sm">Extracting items and prices via AI</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Camera Option */}
      <label className="relative flex flex-col items-center justify-center p-8 bg-white border-2 border-gray-200 border-dashed rounded-xl cursor-pointer hover:border-black hover:bg-gray-50 transition-colors group">
        <div className="text-4xl mb-4 opacity-50 group-hover:opacity-100">📷</div>
        <h3 className="font-semibold text-gray-900">Use Camera</h3>
        <p className="text-sm text-gray-500 text-center mt-2">Take a photo of a physical receipt</p>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          className="hidden" 
          onChange={handleFileUpload} 
        />
      </label>

      {/* Upload Option */}
      <label className="relative flex flex-col items-center justify-center p-8 bg-white border-2 border-gray-200 border-dashed rounded-xl cursor-pointer hover:border-black hover:bg-gray-50 transition-colors group">
        <div className="text-4xl mb-4 opacity-50 group-hover:opacity-100">📁</div>
        <h3 className="font-semibold text-gray-900">Upload Image</h3>
        <p className="text-sm text-gray-500 text-center mt-2">Upload a saved screenshot or photo</p>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileUpload} 
        />
      </label>

      {/* Manual Option */}
      <button 
        onClick={() => setStep(2)}
        className="flex flex-col items-center justify-center p-8 bg-white border-2 border-gray-200 border-dashed rounded-xl cursor-pointer hover:border-black hover:bg-gray-50 transition-colors group"
      >
        <div className="text-4xl mb-4 opacity-50 group-hover:opacity-100">⌨️</div>
        <h3 className="font-semibold text-gray-900">Manual Input</h3>
        <p className="text-sm text-gray-500 text-center mt-2">Type everything out yourself</p>
      </button>
    </div>
  );
}