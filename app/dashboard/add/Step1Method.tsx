// app/dashboard/add/Step1Method.tsx
'use client';

import { useRef } from 'react';
import { useAddReceipt } from './AddReceiptContext';

export default function Step1Method() {
  const { setStep, simulateScan, isScanning } = useAddReceipt();
  
  // We use refs to trigger the hidden file inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      simulateScan(file);
    }
    // Reset the input value so the same file/photo can be uploaded again if needed
    e.target.value = '';
  };

  return (
    // Added px-4 for mobile horizontal padding and adjusted top margin for smaller screens
    <div className="max-w-2xl mx-auto mt-6 md:mt-12 px-4 md:px-0 space-y-8 text-center">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Add a Receipt</h2>
        <p className="text-gray-500">How would you like to enter the details?</p>
      </div>

      {isScanning ? (
        <div className="py-12 px-4 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
          <p className="text-gray-900 font-medium tracking-tight">Gemini is reading your receipt...</p>
          <p className="text-sm text-gray-500">This usually takes about 3-5 seconds.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Camera Option (Mobile Native) */}
          <button 
            onClick={() => cameraInputRef.current?.click()}
            className="p-6 md:p-8 bg-white border border-gray-200 rounded-xl hover:border-black hover:shadow-md transition-all group flex flex-col items-center"
          >
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-black group-hover:text-white transition-colors">
              📷
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Take Photo</h3>
            <p className="text-xs text-gray-500">Use your camera</p>
          </button>
          
          {/* Hidden input for Camera: capture="environment" forces the rear camera on mobile */}
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            className="hidden" 
            ref={cameraInputRef} 
            onChange={handleFileChange} 
          />

          {/* 2. Upload Option */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-6 md:p-8 bg-white border border-gray-200 rounded-xl hover:border-black hover:shadow-md transition-all group flex flex-col items-center"
          >
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-black group-hover:text-white transition-colors">
              📁
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Upload</h3>
            <p className="text-xs text-gray-500">From gallery</p>
          </button>

          {/* Hidden input for File Upload: allows images and PDFs */}
          <input 
            type="file" 
            accept="image/*,application/pdf" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
          />

          {/* 3. Manual Option */}
          <button 
            onClick={() => setStep(2)}
            className="p-6 md:p-8 bg-white border border-gray-200 rounded-xl hover:border-black hover:shadow-md transition-all group flex flex-col items-center"
          >
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-black group-hover:text-white transition-colors">
              ⌨️
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Type it in</h3>
            <p className="text-xs text-gray-500">Manual entry</p>
          </button>
        </div>
      )}
    </div>
  );
}