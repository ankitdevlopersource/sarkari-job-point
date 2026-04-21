const states = [
  "Uttar Pradesh", "Madhya Pradesh", "Maharashtra", "Delhi",
  "Rajasthan", "Bihar", "Haryana", "West Bengal",
  "Assam", "Gujarat", "Jharkhand", "Karnataka",
  "Kerala", "Punjab", "Tamil Nadu", "Uttarakhand"
];

export default function StateGrid({ onSelect, onBack }: { onSelect: (state: string) => void, onBack: () => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-8 border-b border-gray-200">
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-red-700 text-white font-bold rounded-t-lg text-sm">State Wise Jobs</button>
        </div>
        <button 
          onClick={onBack}
          className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {states.map((state) => (
          <button 
            key={state}
            onClick={() => onSelect(state)}
            className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md hover:border-red-200 transition-all group text-left"
          >
            <div className="w-10 h-10 bg-orange-50 rounded flex items-center justify-center text-orange-600 font-bold shrink-0 text-[10px] border border-orange-100">
              IN
            </div>
            <span className="font-bold text-gray-800 group-hover:text-red-600 truncate">{state}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
