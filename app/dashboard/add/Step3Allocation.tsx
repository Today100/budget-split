// app/dashboard/add/Step3Allocation.tsx
'use client';

import { useAddReceipt, LineItem } from './AddReceiptContext';

export default function Step3Allocation() {
  const { receiptData, setReceiptData, setStep, roommates } = useAddReceipt();

  const calculateFinalPrice = (item: LineItem) => {
    const base = item.qty * item.unitPrice;
    return item.isTaxed ? base * (1 + (item.taxPercent / 100)) : base;
  };

  const toggleAllocation = (itemId: string, person: string) => {
    const currentAllocations = receiptData.allocations[itemId] || [];
    
    let newAllocation: string[] = [];
    if (!currentAllocations.includes(person)) {
      newAllocation = [person];
    }

    setReceiptData({
      ...receiptData,
      allocations: {
        ...receiptData.allocations,
        [itemId]: newAllocation
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Horizontal scroll container for mobile */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[650px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-medium text-gray-600">Item</th>
                <th className="p-4 font-medium text-gray-600 w-44">Final Price</th>
                <th className="p-4 font-medium text-gray-600">Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {receiptData.items.map((item) => {
                const finalPrice = calculateFinalPrice(item);
                const selectedPerson = receiptData.allocations[item.id]?.[0];
                
                const splitDivisor = selectedPerson ? 1 : Math.max(roommates.length, 1);
                const perPersonShare = finalPrice / splitDivisor;

                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-medium text-gray-900 mb-1">
                        {item.name || 'Unnamed Item'}
                        {item.isTaxed && (
                          <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-bold tracking-wide">
                            T{item.taxPercent}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        ({item.qty} @ ${item.unitPrice.toFixed(2)})
                      </div>
                    </td>
                    
                    <td className="p-4 align-middle">
                      <div className="font-semibold text-gray-900">
                        ${finalPrice.toFixed(2)}
                      </div>
                      <div className="text-xs font-medium text-emerald-600 mt-0.5">
                        {selectedPerson ? (
                          `$${finalPrice.toFixed(2)} for ${selectedPerson}`
                        ) : (
                          `$${perPersonShare.toFixed(2)} / person`
                        )}
                      </div>
                    </td>
                    
                    <td className="p-4 align-middle">
                      <div className="flex flex-wrap items-center gap-2">
                        {roommates.map((person) => {
                          const isSelected = selectedPerson === person;
                          return (
                            <button
                              type="button"
                              key={person}
                              onClick={() => toggleAllocation(item.id, person)}
                              // Increased vertical padding (py-2) for mobile touch targets
                              className={`px-4 py-2 md:px-3 md:py-1.5 text-sm md:text-xs font-medium rounded-full transition-all border ${
                                isSelected 
                                  ? 'bg-black text-white border-black shadow-sm' 
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                              }`}
                            >
                              {person}
                            </button>
                          );
                        })}
                        
                        {!selectedPerson && (
                          <span className="text-xs text-gray-400 italic ml-2 mt-1 md:mt-0">
                            (Splitting equally)
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation buttons: stacked on mobile, row on desktop */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4 md:gap-0">
        <button 
          type="button"
          onClick={() => setStep(2)}
          className="w-full md:w-auto px-6 py-3 text-gray-600 font-medium hover:text-black hover:bg-gray-50 md:hover:bg-transparent rounded-lg md:rounded-none transition-colors"
        >
          ← Back to Edit
        </button>
        <button 
          type="button"
          onClick={() => setStep(4)}
          className="w-full md:w-auto px-8 py-3.5 md:py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          Review Summary →
        </button>
      </div>
    </div>
  );
}