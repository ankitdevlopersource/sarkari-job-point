import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function PrivacyPolicy() {
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pages/privacy-policy')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setPageData(data);
      })
      .catch(err => console.error('Failed to fetch Privacy page', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white py-16">
      <Helmet>
        <title>{pageData?.metaTitle || 'Privacy Policy - Sarkari job point'}</title>
        <meta name="description" content={pageData?.metaDescription || "Privacy Policy for Sarkari job point. Information on data collection, cookies, and protection."} />
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
                <span className="text-red-600">{pageData?.title || 'PRIVACY POLICY'}</span>
              )}
            </h1>
            
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              {pageData?.content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {pageData.content}
                </ReactMarkdown>
              ) : (
                <>
                  <p>At Sarkari job point, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Sarkari job point and how we use it.</p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-12">Log Files</h2>
                  <p>Sarkari job point follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.</p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-12">Cookies and Web Beacons</h2>
                  <p>Like any other website, Sarkari job point uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience.</p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-12">Consent</h2>
                  <p>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
