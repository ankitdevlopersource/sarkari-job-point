import { Link } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';

interface RelatedPostsProps {
  posts: any[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <div className="mt-16 pt-10 border-t border-gray-100">
      <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
        <span className="w-2 h-8 bg-red-600 rounded-full" />
        Related Job Openings
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {posts.map((post) => (
          <Link 
            key={post.id} 
            to={`/blog/${post.slug}`}
            className="group bg-gray-50 rounded-xl p-4 border border-transparent hover:border-red-100 hover:bg-white hover:shadow-xl transition-all"
          >
            <div className="flex gap-4">
              <img 
                src={post.thumbnail} 
                alt={post.title} 
                className="w-24 h-24 object-cover rounded-lg shadow-sm group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black uppercase text-red-600 tracking-widest mb-1 block">
                  {post.category}
                </span>
                <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight group-hover:text-red-600 transition-colors">
                  {post.title}
                </h3>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-500 font-bold">
                  <Calendar size={12} className="text-red-600" />
                  {new Date((post.createdAt?.seconds || post.createdAt?._seconds || Date.now() / 1000) * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end text-[10px] font-black text-red-600 uppercase tracking-tighter group-hover:translate-x-1 transition-transform">
              View Details <ChevronRight size={12} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
