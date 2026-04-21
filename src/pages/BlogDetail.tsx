import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Sidebar from '../components/Sidebar';
import RelatedPosts from '../components/RelatedPosts';
import PopupAd from '../components/PopupAd';
import { Calendar, MapPin, Share2, ArrowLeft, Check } from 'lucide-react';

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<any>(null);
  const [allBlogs, setAllBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: blog.title,
      text: blog.metaDescription || blog.title,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    // Fetch current blog
    fetch(`/api/blogs/${slug}`)
      .then(res => res.json())
      .then(data => {
        setBlog(data);
        // Increment view count
        if (data.id) {
          fetch(`/api/blogs/${data.id}/view`, { method: 'POST' }).catch(console.error);
        }
        // Fetch all blogs for related section
        return fetch('/api/blogs');
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllBlogs(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  const relatedPosts = allBlogs
    .filter(b => b.slug !== slug && (b.category === blog?.category || b.state === blog?.state))
    .slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <Link to="/" className="text-red-600 font-bold hover:underline">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Helmet>
        <title>{blog.title} - Sarkari Update</title>
        <meta name="description" content={blog.metaDescription || blog.content.substring(0, 160).replace(/[#*]/g, '')} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.metaDescription || blog.content.substring(0, 160).replace(/[#*]/g, '')} />
        <meta property="og:image" content={blog.thumbnail} />
        <meta property="og:type" content="article" />
        <meta name="keywords" content={`${blog.category}, ${blog.state} jobs, sarkari result, ${blog.title.split(' ').slice(0, 5).join(', ')}`} />
      </Helmet>
      <PopupAd location="blog" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-red-600 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header Image */}
            <div className="w-full h-[250px] md:h-[450px] bg-gray-50 border-b border-gray-100 overflow-hidden">
              <img 
                src={blog.thumbnail} 
                alt={blog.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-6 md:p-10">
              <div className="flex flex-wrap items-center gap-4 mb-6 text-xs font-bold uppercase tracking-wider">
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded">{blog.category}</span>
                <div className="flex items-center gap-1 text-gray-500">
                  <MapPin size={14} /> {blog.state}
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Calendar size={14} /> {new Date((blog.createdAt?.seconds || blog.createdAt?._seconds || Date.now() / 1000) * 1000).toLocaleDateString()}
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 leading-tight">
                {blog.title}
              </h1>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-10 pb-6 border-b border-gray-100">
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-sm"
                >
                  {copied ? <Check size={16} /> : <Share2 size={16} />}
                  {copied ? 'Copied Link!' : 'Share Post'}
                </button>
              </div>

              {/* Blog Content */}
              <div className="prose prose-red max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    a: ({ node, ...props }) => (
                      <a 
                        {...props} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-red-600 font-bold hover:underline"
                      />
                    )
                  }}
                >
                  {blog.content}
                </ReactMarkdown>
              </div>

              {/* Related Posts */}
              <RelatedPosts posts={relatedPosts} />

              {/* Official Link */}
              {blog.jobSourceUrl && (
                <div className="mt-12 p-6 bg-red-50 rounded-xl border border-red-100 text-center">
                  <h3 className="font-bold text-red-900 mb-4">Ready to Apply?</h3>
                  <a 
                    href={blog.jobSourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105"
                  >
                    Visit Official Website
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <Sidebar blogs={allBlogs} />
        </div>
      </div>
    </div>
  );
}
