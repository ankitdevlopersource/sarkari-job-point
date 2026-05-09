import { Helmet } from 'react-helmet-async';

interface SeoProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: string;
  keywords?: string;
  robots?: string;
  jsonLd?: object | object[];
}

export default function Seo({
  title,
  description,
  url,
  image,
  type = 'website',
  keywords,
  robots = 'index, follow',
  jsonLd,
}: SeoProps) {
  const baseUrl = 'https://dailysarkarijob.com';
  const currentUrl = url || `${baseUrl}${typeof window !== 'undefined' ? window.location.pathname : ''}`;

  const defaultJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: baseUrl,
    name: 'Sarkari Job Updates',
    description: 'Find daily Sarkari job updates, admit cards, results, and notices in one place.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Sarkari Job Updates',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
  };

  const finalJsonLd = jsonLd ? (Array.isArray(jsonLd) ? [defaultJsonLd, ...jsonLd] : [defaultJsonLd, jsonLd]) : defaultJsonLd;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      <meta name="robots" content={robots} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {image ? <meta property="og:image" content={image.startsWith('http') ? image : `${baseUrl}${image}`} /> : null}
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="Sarkari Job Updates" />
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image ? <meta name="twitter:image" content={image.startsWith('http') ? image : `${baseUrl}${image}`} /> : null}
      <link rel="canonical" href={currentUrl} />
      <script type="application/ld+json">
        {JSON.stringify(finalJsonLd)}
      </script>
    </Helmet>
  );
}
