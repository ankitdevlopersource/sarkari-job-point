import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/Hero';
import QuickLinks from '../components/QuickLinks';
import TrendingJobs from '../components/TrendingJobs';
import Sidebar from '../components/Sidebar';
import StateGrid from '../components/StateGrid';
import PopupAd from '../components/PopupAd';
import { ChevronRight, MessageCircle, Send, Star } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Home() {
  const location = useLocation();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState({ whatsapp: '', telegram: '' });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: '', state: '', search: '' });
  const [showStateGrid, setShowStateGrid] = useState(false);

  useEffect(() => {
    // Fetch blogs
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBlogs(data);
        } else {
          console.error('Expected array of blogs, got:', data);
          setBlogs([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    // Fetch social links
    fetch('/api/settings/social')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setSocialLinks(data);
        }
      })
      .catch(err => console.error('Failed to fetch social links:', err));
  }, []);

  const handleCategorySelect = (category: string) => {
    if (category === 'State Govt Jobs') {
      setShowStateGrid(true);
      setFilter({ category: '', state: '', search: '' });
    } else {
      setShowStateGrid(false);
      setFilter({ category, state: '', search: '' });
    }
  };

  const handleStateSelect = (state: string) => {
    setFilter({ category: 'State Govt Jobs', state, search: '' });
    setShowStateGrid(false);
  };

  const handleSearch = (query: string) => {
    setFilter({ category: '', state: '', search: query });
    setShowStateGrid(false);
  };

  useEffect(() => {
    // Reset filters when location changes
    if (location.pathname === '/') {
      setFilter({ category: '', state: '', search: '' });
    } else if (location.pathname === '/latest-jobs') {
      setFilter({ category: '', state: '', search: '' });
    } else if (location.pathname === '/results') {
      setFilter({ category: 'Results', state: '', search: '' });
    } else if (location.pathname === '/admit-cards') {
      setFilter({ category: 'Admit Cards', state: '', search: '' });
    } else if (location.pathname === '/syllabus') {
      setFilter({ category: 'Syllabus', state: '', search: '' });
    } else if (location.pathname === '/notifications') {
      setFilter({ category: 'Notifications', state: '', search: '' });
    }
  }, [location.pathname]);

  const [activeTabSub, setActiveTabSub] = useState<'news' | 'latestJobs'>('news');

  const filteredBlogs = blogs.filter(blog => {
    // Specialized route logic
    if (location.pathname === '/latest-jobs') {
      return blog.placement === 'Trending Sarkari Jobs' || blog.placement === 'Latest Updates & News' || blog.placement === 'Normal Jobs';
    }

    // 1. Category Filter Compatibility
    const isCentralGovt = blog.state === 'India' && filter.category === 'Central Govt Jobs';
    const matchesCategory = filter.category ? (blog.category === filter.category || isCentralGovt) : true;
    
    // 2. State Filter
    const matchesState = filter.state ? blog.state === filter.state : true;
    
    // 3. Search Filter
    let matchesSearch = true;
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      const titleMatch = blog.title?.toLowerCase().includes(searchLower);
      const contentMatch = blog.content?.toLowerCase().includes(searchLower);
      matchesSearch = titleMatch || contentMatch;
    }

    // Default filters
    if (!matchesCategory || !matchesState || !matchesSearch) return false;

    // 4. Placement Logic for main list
    // If no specific filters (category/state), only show items with relevant placements
    if (!filter.category && !filter.state && !filter.search) {
       // "Normal Jobs" only show via category/state filter per request
       if (blog.placement === 'Normal Jobs') return false;
    }

    return true;
  });

  const trendingJobs = blogs.filter(b => b.placement === 'Trending Sarkari Jobs').slice(0, 10);
  const newsJobs = blogs.filter(b => b.placement === 'Latest Updates & News').slice(0, 10);
  const latestUpdates = blogs.filter(b => b.placement === 'Latest Updates').slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Helmet>
        <title>Sarkari Update - Latest Sarkari Jobs, Results & Admit Cards</title>
        <meta name="description" content="Get the latest updates on Sarkari Jobs, Results, Admit Cards, and Syllabus. Stay ahead with official government job updates and news." />
        <meta name="keywords" content="sarkari jobs, latest jobs, sarkari result, admit card, govt jobs 2024" />
        <meta property="og:title" content="Sarkari Update - Latest Sarkari Jobs" />
        <meta property="og:description" content="One stop for all government job updates." />
        <meta property="og:type" content="website" />
      </Helmet>
      <PopupAd location="home" />
      <Hero onSearch={handleSearch} />
      <QuickLinks onSelect={handleCategorySelect} activeCategory={filter.category || (showStateGrid ? 'State Govt Jobs' : '')} />

      <main className="max-w-7xl mx-auto px-4 mt-8 md:mt-12">
        {/* Social Links Section */}
        {location.pathname === '/' && !showStateGrid && !filter.category && !filter.state && !filter.search && (
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <a 
              href={socialLinks.whatsapp || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black py-3 px-4 rounded-xl shadow-lg shadow-green-200 transition-all active:scale-95 text-xs sm:text-sm uppercase tracking-wider"
            >
              <Star size={18} fill="currentColor" className="text-yellow-300" />
              JOIN WHATSAPP GROUP
            </a>
            <a 
              href={socialLinks.telegram || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 text-xs sm:text-sm uppercase tracking-wider"
            >
              <Star size={18} fill="currentColor" className="text-yellow-300" />
              JOIN TELEGRAM CHANNEL
            </a>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-12">
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
              </div>
            ) : (
              !showStateGrid && (
                <>
                  {/* Trending Jobs Section */}
                  {location.pathname === '/' && !filter.category && !filter.state && !filter.search && trendingJobs.length > 0 && (
                    <TrendingJobs jobs={trendingJobs} />
                  )}

                </>
              )
            )}

            {showStateGrid && <StateGrid onSelect={handleStateSelect} onBack={() => setShowStateGrid(false)} />}

            {/* Main Listing Section */}
            {!showStateGrid && (
              <div className="mt-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div className="flex border-b border-gray-200 w-full md:w-auto">
                    <button 
                      onClick={() => setActiveTabSub('news')}
                      className={`px-6 py-2 font-bold text-sm transition-all border-b-2 ${activeTabSub === 'news' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                      {filter.search ? `Search results` : 
                       filter.state ? `${filter.state} Jobs` : 
                       filter.category ? `${filter.category} Updates` : 
                       location.pathname === '/latest-jobs' ? 'Latest Jobs' :
                       'Latest Updates & News'}
                    </button>
                  </div>
                  {(filter.category || filter.state || filter.search) && (
                    <button 
                      onClick={() => setFilter({ category: '', state: '', search: '' })}
                      className="text-sm font-bold text-red-600 hover:underline px-2"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {(filter.category || filter.state || filter.search || location.pathname === '/latest-jobs'
                      ? filteredBlogs
                      : newsJobs
                  ).length > 0 ? (
                    (filter.category || filter.state || filter.search || location.pathname === '/latest-jobs'
                      ? filteredBlogs
                      : newsJobs
                    ).map((blog) => (
                      <Link 
                        key={blog.id} 
                        to={`/blog/${blog.slug}`}
                        className="bg-white p-4 rounded-lg border border-gray-200 flex gap-4 hover:shadow-md transition-shadow group"
                      >
                        <img 
                          src={blog.thumbnail} 
                          alt={blog.title} 
                          className="w-20 h-20 object-cover rounded"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                            {blog.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date((blog.createdAt?.seconds || blog.createdAt?._seconds || Date.now() / 1000) * 1000).toLocaleDateString()}
                          </p>
                          <div className="mt-2 flex items-center justify-end text-xs font-bold text-red-600">
                            Read More <ChevronRight size={14} />
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="bg-white p-12 rounded-lg border border-dashed border-gray-300 text-center text-gray-500">
                      No jobs found for this selection.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <Sidebar blogs={blogs} />
        </div>
      </main>
    </div>
  );
}
