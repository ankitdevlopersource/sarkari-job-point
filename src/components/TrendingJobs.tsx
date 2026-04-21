import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Job {
  id: string;
  title: string;
  slug: string;
  category: string;
  state: string;
  thumbnail: string;
  createdAt: any;
}

export default function TrendingJobs({ jobs }: { jobs: Job[] }) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Group jobs into pages of 4 for the carousel
  const pages = [];
  for (let i = 0; i < jobs.length; i += 4) {
    pages.push(jobs.slice(i, i + 4));
  }

  // Auto-scroll logic (scrolls by page)
  useEffect(() => {
    if (pages.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % pages.length);
    }, 5000); // 5 seconds per page

    return () => clearInterval(timer);
  }, [pages.length, isPaused]);

  const nextSlide = () => setIndex((prev) => (prev + 1) % pages.length);
  const prevSlide = () => setIndex((prev) => (prev - 1 + pages.length) % pages.length);

  if (!jobs || jobs.length === 0) return null;

  return (
    <div 
      className="relative mb-8 md:mb-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2 uppercase italic tracking-tighter">
          <span className="w-1.5 md:w-2 h-6 md:h-8 bg-red-600 inline-block"></span>
          Trending Sarkari Jobs
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={prevSlide}
            className="p-1.5 md:p-2 rounded-full border border-gray-200 bg-white hover:bg-red-600 hover:text-white transition-all shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={nextSlide}
            className="p-1.5 md:p-2 rounded-full border border-gray-200 bg-white hover:bg-red-600 hover:text-white transition-all shadow-sm"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      
      {/* Scrollable Container */}
      <div className="overflow-hidden rounded-xl md:rounded-2xl">
        <motion.div 
          className="flex"
          animate={{ x: `-${index * 100}%` }}
          transition={{ type: 'spring', damping: 25, stiffness: 100 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => {
            if (info.offset.x < -40) nextSlide();
            if (info.offset.x > 40) prevSlide();
          }}
        >
          {pages.map((page, pageIdx) => (
            <div key={pageIdx} className="w-full flex-shrink-0 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6 px-1 md:px-0">
              {page.map((job) => (
                <Link 
                  key={job.id} 
                  to={`/blog/${job.slug}`}
                  className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-red-50 transition-all duration-300 group flex flex-col h-full"
                >
                  <div className="aspect-[16/10] relative overflow-hidden bg-gray-50 border-b border-gray-100">
                    <img 
                      src={job.thumbnail} 
                      alt={job.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-1 left-1 md:top-3 md:left-3 bg-red-600 text-white text-[7px] md:text-[10px] font-black px-1.5 py-0.5 md:px-3 md:py-1 rounded-full uppercase shadow-lg">
                      {job.category.split(' ')[0]}
                    </div>
                  </div>
                  
                  <div className="p-1.5 md:p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 mb-1 md:mb-3 leading-tight group-hover:text-red-600 transition-colors text-sm md:text-lg">
                      {job.title}
                    </h3>
                    
                    <div className="mt-auto space-y-1 md:space-y-2">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between text-[7px] md:text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-1 md:gap-1.5">
                          <MapPin size={7} className="md:w-3 md:h-3 text-red-600" />
                          <span className="truncate max-w-[40px] md:max-w-none">{job.state}</span>
                        </div>
                        <div className="flex items-center gap-1 md:gap-1.5">
                          <Calendar size={7} className="md:w-3 md:h-3 text-red-600" />
                          <span>
                            {job.createdAt?.seconds 
                              ? new Date(job.createdAt.seconds * 1000).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })
                              : new Date().toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-1 md:pt-3 border-t border-gray-50 hidden md:flex items-center justify-end text-xs font-black text-red-600 group-hover:gap-2 transition-all uppercase tracking-tighter">
                        View Detail <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mt-6 md:mt-8">
        {pages.map((_, i) => (
          <button 
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${index === i ? 'w-8 bg-red-600' : 'w-2 bg-gray-200'}`}
          />
        ))}
      </div>
    </div>
  );
}
