import { Building2, Map, Landmark, GraduationCap } from 'lucide-react';

const links = [
  { name: 'Central Govt Jobs', icon: Building2, color: 'bg-[#1e3a8a]' },
  { name: 'State Govt Jobs', icon: Map, color: 'bg-[#1e40af]' },
  { name: 'Bank Jobs', icon: Landmark, color: 'bg-[#1d4ed8]' },
  { name: 'SSC / UPSC', icon: GraduationCap, color: 'bg-[#1e3a8a]' },
];

export default function QuickLinks({ onSelect, activeCategory }: { onSelect: (cat: string) => void, activeCategory: string }) {
  return (
    <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {links.map((link) => (
          <button 
            key={link.name}
            onClick={() => onSelect(link.name)}
            className={`${link.color} text-white p-4 rounded shadow-lg flex items-center justify-center gap-3 hover:opacity-90 transition-opacity font-bold text-sm ${activeCategory === link.name ? 'ring-4 ring-white/30' : ''}`}
          >
            <link.icon size={20} />
            {link.name}
          </button>
        ))}
      </div>
    </div>
  );
}
