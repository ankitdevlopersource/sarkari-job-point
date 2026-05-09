import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Seo from '../components/Seo';
import Breadcrumbs from '../components/Breadcrumbs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Sidebar from '../components/Sidebar';
import RelatedPosts from '../components/RelatedPosts';
import PopupAd from '../components/PopupAd';
import { Calendar, MapPin, Share2, ArrowLeft, Check } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  category: string;
  state: string;
  content: string;
  metaDescription?: string;
  jobSourceUrl?: string;
  createdAt?: { seconds?: number; _seconds?: number; nanoseconds?: number } | null;
  updatedAt?: { seconds?: number; _seconds?: number; nanoseconds?: number } | null;
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="animate-pulse rounded-[28px] bg-white/80 p-6 shadow-xl shadow-slate-200/40 border border-slate-200">
          <div className="h-72 rounded-[24px] bg-slate-200" />
          <div className="mt-6 space-y-4">
            <div className="h-4 w-40 rounded-full bg-slate-200" />
            <div className="h-12 w-full rounded-2xl bg-slate-200" />
            <div className="space-y-3">
              <div className="h-4 w-full rounded-full bg-slate-200" />
              <div className="h-4 w-5/6 rounded-full bg-slate-200" />
              <div className="h-4 w-3/4 rounded-full bg-slate-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_0.95fr] gap-8">
          <div className="animate-pulse rounded-[28px] bg-white/80 p-6 shadow-xl shadow-slate-200/40 border border-slate-200 space-y-4">
            <div className="h-6 w-48 rounded-full bg-slate-200" />
            <div className="h-4 w-full rounded-full bg-slate-200" />
            <div className="h-4 w-full rounded-full bg-slate-200" />
            <div className="h-4 w-4/5 rounded-full bg-slate-200" />
            <div className="h-4 w-3/4 rounded-full bg-slate-200" />
          </div>
          <div className="animate-pulse rounded-[28px] bg-white/80 p-6 shadow-xl shadow-slate-200/40 border border-slate-200 space-y-4">
            <div className="h-6 w-40 rounded-full bg-slate-200" />
            <div className="h-4 w-full rounded-full bg-slate-200" />
            <div className="h-4 w-4/5 rounded-full bg-slate-200" />
            <div className="h-4 w-3/4 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [allBlogs, setAllBlogs] = useState<BlogPost[]>([]);
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
    fetch(`/api/blogs/${slug}`)
      .then(res => res.json())
      .then(data => {
        setBlog(data);
        if (data.id) {
          fetch(`/api/blogs/${data.id}/view`, { method: 'POST' }).catch(console.error);
        }
        return fetch('/api/blogs');
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAllBlogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  const relatedPosts = useMemo(() => {
    if (!blog) return [];

    return allBlogs
      .filter((candidate) => candidate.slug !== slug)
      .map((candidate) => {
        let score = 0;
        if (candidate.category === blog.category) score += 30;
        if (candidate.state === blog.state) score += 20;
        if (candidate.placement === blog.placement) score += 10;
        if (candidate.title.includes(blog.title.split(' ')[0] || '')) score += 5;
        return { candidate, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ candidate }) => candidate)
      .slice(0, 4);
  }, [allBlogs, blog, slug]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-slate-50">
        <h1 className="text-3xl font-black text-slate-900 mb-4">Post Not Found</h1>
        <Link to="/" className="text-red-600 font-semibold hover:underline">Back to Home</Link>
      </div>
    );
  }

  const summary = blog.metaDescription || blog.content.substring(0, 140).replace(/[#*]/g, '');
  const canonicalUrl = typeof window !== 'undefined' && slug ? `${window.location.origin}/blog/${slug}` : '';
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: blog.title,
    description: summary,
    image: blog.thumbnail ? [blog.thumbnail] : [],
    author: {
      '@type': 'Organization',
      name: 'Sarkari Update',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Sarkari Update',
    },
    datePublished: blog.createdAt ? new Date(blog.createdAt.seconds * 1000).toISOString() : undefined,
    dateModified: blog.updatedAt ? new Date(blog.updatedAt.seconds * 1000).toISOString() : undefined,
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: typeof window !== 'undefined' ? window.location.origin : '',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: blog.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Seo
        title={`${blog.title} - Sarkari Update`}
        description={summary}
        type="article"
        url={canonicalUrl}
        image={blog.thumbnail}
        keywords={`${blog.category}, ${blog.state} jobs, sarkari result, ${blog.title.split(' ').slice(0, 5).join(', ')}`}
        jsonLd={[articleSchema, breadcrumbSchema]}
      />
      <PopupAd location="blog" />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: blog?.category || 'Blog', to: blog?.category ? `/latest-jobs` : '/' },
            { label: blog?.title || 'Post', current: true },
          ]}
        />

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-red-600 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-[1.6fr_0.95fr] gap-8">
          <div className="space-y-8">
            <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white/95 shadow-[0_32px_90px_-48px_rgba(15,23,42,0.4)]">
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-red-50 via-transparent to-transparent pointer-events-none" />
              <div className="relative h-[280px] sm:h-[360px] md:h-[420px] lg:h-[480px] overflow-hidden rounded-[32px]">
                <img
                  src={blog.thumbnail}
                  alt={blog.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3">
                  <span className="inline-flex items-center justify-center rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600 shadow-sm backdrop-blur-md">
                    Exam Update & Education News
                  </span>
                </div>
              </div>

              <div className="px-6 pb-8 pt-8 md:px-10 md:pt-10">
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600">
                  <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-red-700">{blog.category}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                    <MapPin size={14} /> {blog.state}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                    <Calendar size={14} /> {new Date((blog.createdAt?.seconds || blog.createdAt?._seconds || Date.now() / 1000) * 1000).toLocaleDateString()}
                  </span>
                </div>

                <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  {blog.title}
                </h1>

                <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                  {summary}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center gap-2 rounded-3xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-red-700"
                    >
                      {copied ? <Check size={16} /> : <Share2 size={16} />}
                      {copied ? 'Copied Link' : 'Share'}
                    </button>

                    {blog.jobSourceUrl && (
                      <a
                        href={blog.jobSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-transform duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:text-red-600"
                      >
                        Visit Official Website
                      </a>
                    )}
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
                    Trusted exam update coverage with clarity and speed.
                  </div>
                </div>
              </div>
            </section>

            <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.2)] md:p-8">
              <div className="prose prose-red prose-headings:text-slate-900 prose-headings:font-semibold prose-a:text-red-600 prose-a:font-semibold prose-a:no-underline prose-a:hover:underline prose-p:leading-8 prose-strong:text-slate-900 max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 font-semibold hover:underline"
                      />
                    ),
                  }}
                >
                  {blog.content}
                </ReactMarkdown>
              </div>
            </article>

            <RelatedPosts posts={relatedPosts} />
          </div>

          <aside className="space-y-8">
            <div className="sticky top-8 space-y-6">
              <Sidebar blogs={allBlogs} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
