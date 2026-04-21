import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function Hero({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('');
  const [bgImage, setBgImage] = useState('https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&q=80&w=1920');

  useEffect(() => {
    fetch('/api/settings/hero')
      .then(res => res.json())
      .then(data => {
        if (data.heroBgImage) setBgImage(data.heroBgImage);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="relative h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${bgImage}")` }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 w-full max-w-3xl">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
          Find Your Dream Govt Job!
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-8 font-medium">
          Daily Updates on Latest Sarkari Jobs & Exams
        </p>

        <form onSubmit={handleSubmit} className="flex bg-white rounded-lg overflow-hidden shadow-2xl mx-auto w-full max-w-[90vw] md:max-w-none">
          <input 
            type="text" 
            placeholder="Search..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 md:px-6 py-3 md:py-4 text-gray-800 focus:outline-none text-sm md:text-base min-w-0"
          />
          <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 md:px-8 py-3 md:py-4 font-bold transition-colors flex items-center gap-1 md:gap-2 shrink-0">
            <Search size={18} className="md:w-5 md:h-5" />
            <span className="text-sm md:text-base">Search</span>
          </button>
        </form>
      </div>
    </div>
  );
}
