import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function About() {
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pages/about')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setPageData(data);
      })
      .catch(err => console.error('Failed to fetch About page', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white py-16">
      <Helmet>
        <title>{pageData?.metaTitle || 'About Us - Sarkari job point'}</title>
        <meta name="description" content={pageData?.metaDescription || "Learn about Sarkari job point, your destination for latest govt job updates, sarkari result, and admit cards."} />
      </Helmet>
      
      <div className="max-w-4xl mx-auto px-4">
        {loading ? (
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-black tracking-tighter text-gray-900 mb-8 uppercase">
              {pageData?.title?.includes(' ') ? (
                <>
                  {pageData.title.split(' ')[0]}{' '}
                  <span className="text-red-600">{pageData.title.split(' ').slice(1).join(' ')}</span>
                </>
              ) : (
                <span className="text-red-600">{pageData?.title || 'ABOUT US'}</span>
              )}
            </h1>
            
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              {pageData?.content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {pageData.content}
                </ReactMarkdown>
              ) : (
                <>
                  <p>
                    Welcome to <span className="font-bold text-gray-900">Sarkari job point</span>, your number one source for all things related to Government Job updates. We're dedicated to providing you the very best of informational updates, with an emphasis on Latest Jobs, Results, Admit Cards, and Syllabus.
                  </p>

                  <p>
                    Founded in 2026, Sarkari job point has come a long way from its beginnings. Our passion for helping students and job seekers find reliable and fast information drove us to start this professional resource.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-12">Our Purpose</h2>
                  <p>
                    The primary goal of this website is to simplify the complex landscape of Indian Government examinations. We provide:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Instant updates on Central and State Government Jobs.</li>
                    <li>Direct links to download Admit Cards and check Sarkari Results.</li>
                    <li>Detailed Syllabus and Exam Pattern analysis.</li>
                    <li>Latest Notifications and News related to academic and competitive exams.</li>
                  </ul>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
