import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function Disclaimer() {
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pages/disclaimer')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setPageData(data);
      })
      .catch(err => console.error('Failed to fetch Disclaimer page', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white py-16">
      <Helmet>
        <title>{pageData?.metaTitle || 'Disclaimer - Sarkari job point'}</title>
        <meta name="description" content={pageData?.metaDescription || "Disclaimer for Sarkari job point. Information regarding government affiliation and accuracy."} />
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
                <span className="text-red-600">{pageData?.title || 'DISCLAIMER'}</span>
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
                    All the information on this website - https://sarkarijobpoint.com - is published in good faith and for general information purpose only. Sarkari job point does not make any warranties about the completeness, reliability and accuracy of this information.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-12">Not a Government Entity</h2>
                  <p>
                    <span className="font-bold text-red-600">Sarkari job point is NOT a government organization and is not affiliated with any government body.</span> We are a private informational portal.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-12">Consent</h2>
                  <p>By using our website, you hereby consent to our disclaimer and agree to its terms.</p>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
