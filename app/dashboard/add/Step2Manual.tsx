// app/dashboard/add/Step2Manual.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useAddReceipt, LineItem } from './AddReceiptContext';

export default function Step2Manual() {
  const { receiptData, setReceiptData, setStep, roommates } = useAddReceipt();

  const subtotal = receiptData.items.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
  const taxTotal = receiptData.items.reduce((acc, item) => acc + (item.isTaxed ? item.qty * item.unitPrice * (item.taxPercent / 100) : 0), 0);
  const grandTotal = subtotal + taxTotal;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...receiptData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setReceiptData({ ...receiptData, items: newItems });
  };

  const addItem = () => {
    setReceiptData({
      ...receiptData,
      items: [...receiptData.items, { id: Date.now().toString(), name: '', qty: 1, unitPrice: 0, isTaxed: false, taxPercent: 13 }]
    });
  };

  const calculateFinalPrice = (item: LineItem) => {
    const base = item.qty * item.unitPrice;
    return item.isTaxed ? base * (1 + (item.taxPercent / 100)) : base;
  };

  const togglePayer = (payerName: string) => {
    const currentPayers = receiptData.payers;
    const newPayers = currentPayers.includes(payerName)
      ? currentPayers.filter(p => p !== payerName)
      : [...currentPayers, payerName];
    
    setReceiptData({ ...receiptData, payers: newPayers });
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
          <input 
            type="text" 
            value={receiptData.storeName}
            onChange={(e) => setReceiptData({...receiptData, storeName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input 
            type="date" 
            value={receiptData.date}
            onChange={(e) => setReceiptData({...receiptData, date: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Custom Payers Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payers</label>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer flex justify-between items-center focus:ring-2 focus:ring-black min-h-[42px]"
          >
            <span className="truncate text-sm text-gray-900">
              {receiptData.payers.length === 0 
                ? <span className="text-gray-400">Select...</span>
                : receiptData.payers.join(', ')}
            </span>
            <span className="text-gray-400 text-xs ml-2">▼</span>
          </div>

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {roommates.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">No roommates found</div>
              ) : (
                roommates.map((rm) => (
                  <div 
                    key={rm} 
                    onClick={() => togglePayer(rm)}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input 
                      type="checkbox" 
                      readOnly
                      checked={receiptData.payers.includes(rm)}
                      className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-900">{rm}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[600px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-medium text-gray-600">Item Name</th>
              <th className="p-4 font-medium text-gray-600 w-24">Qty</th>
              <th className="p-4 font-medium text-gray-600 w-32">Unit Price</th>
              <th className="p-4 font-medium text-gray-600 w-20 text-center">Taxed</th>
              <th className="p-4 font-medium text-gray-600 w-24">Tax %</th>
              <th className="p-4 font-medium text-gray-600 w-32 text-right">Final Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {receiptData.items.map((item, i) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-3">
                  <input type="text" value={item.name} onChange={(e) => handleItemChange(i, 'name', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black" />
                </td>
                <td className="p-3">
                  <input type="number" min="1" value={item.qty} onChange={(e) => handleItemChange(i, 'qty', Number(e.target.value))} className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black" />
                </td>
                <td className="p-3">
                  <input type="number" step="0.01" value={item.unitPrice} onChange={(e) => handleItemChange(i, 'unitPrice', Number(e.target.value))} className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black" />
                </td>
                <td className="p-3 text-center">
                  <input type="checkbox" checked={item.isTaxed} onChange={(e) => handleItemChange(i, 'isTaxed', e.target.checked)} className="w-4 h-4 cursor-pointer text-black focus:ring-black border-gray-300 rounded" />
                </td>
                <td className="p-3">
                  <input type="number" disabled={!item.isTaxed} value={item.taxPercent} onChange={(e) => handleItemChange(i, 'taxPercent', Number(e.target.value))} className="w-full px-2 py-1 border border-gray-300 rounded disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black" />
                </td>
                <td className="p-3 text-right font-medium">
                  ${calculateFinalPrice(item).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-4 border-t border-gray-100">
          <button onClick={addItem} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
            + Add Line Item
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={() => setStep(3)}
          className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          Move on to allocation →
        </button>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2 text-sm mt-4">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Tax</span>
          <span>${taxTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg text-gray-900 border-t border-gray-200 pt-2 mt-2">
          <span>Total</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <button onClick={() => setStep(3)} className="w-full py-3 bg-black text-white rounded-lg font-bold mt-6">
        Next: Assign Items
      </button>
    </div>

    
  );
}