import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo';
import Breadcrumbs from '../components/Breadcrumbs';
import PopupAd from '../components/PopupAd';

interface BlogPost {
  title: string;
  slug: string;
  description: string;
  category?: string;
  placement?: string;
  state?: string;
  image?: string;
  publishedAt?: string;
  link?: string;
}

const trendingKeywords = [
  'railway jobs',
  'bank jobs',
  'ssc',
  'admit card',
  'results',
  '10th pass jobs',
  'graduate jobs',
];

const normalize = (value: string) => value.toLowerCase().trim();

const matchesQuery = (post: BlogPost, query: string) => {
  const text = [post.title, post.description, post.category, post.state, post.placement]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return query
    .split(' ')
    .filter(Boolean)
    .every((part) => text.includes(part));
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [blogList, setBlogList] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const urlQuery = normalize(searchParams.get('q') || '');
  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const pageSize = 12;

  useEffect(() => {
    const stored = window.localStorage.getItem('recentJobSearches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch('/api/blogs')
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) {
          setBlogList(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBlogList([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const matchedPosts = useMemo(() => {
    if (!urlQuery) {
      return [];
    }
    return blogList.filter((post) => matchesQuery(post, urlQuery));
  }, [blogList, urlQuery]);

  const pagedResults = useMemo(() => {
    const start = (page - 1) * pageSize;
    return matchedPosts.slice(start, start + pageSize);
  }, [matchedPosts, page]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const searchText = normalize(query);
    if (!searchText) {
      setSearchParams((prev) => {
        prev.delete('q');
        prev.delete('page');
        return prev;
      });
      return;
    }

    const next = new URLSearchParams(searchParams.toString());
    next.set('q', searchText);
    next.delete('page');
    setSearchParams(next);

    const nextRecent = [searchText, ...recentSearches.filter((item) => item !== searchText)].slice(0, 6);
    setRecentSearches(nextRecent);
    window.localStorage.setItem('recentJobSearches', JSON.stringify(nextRecent));
  };

  const handleSuggestionClick = (keyword: string) => {
    setQuery(keyword);
    navigate(`/search?q=${encodeURIComponent(keyword)}`);
  };

  const handlePageChange = (nextPage: number) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set('page', String(nextPage));
    setSearchParams(next);
  };

  const title = urlQuery ? `${urlQuery} Search Results` : 'Search Sarkari Jobs';
  const description = urlQuery
    ? `Search Sarkari job notifications, admit cards, results, and state-wise alerts for '${urlQuery}'.`
    : 'Search the latest Sarkari job posts, notifications, admit cards, and results across categories and states.';

  const canonicalUrl = `${window.location.origin}/search${urlQuery ? `?q=${encodeURIComponent(urlQuery)}${page > 1 ? `&page=${page}` : ''}` : ''}`;

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <Seo
        title={title}
        description={description}
        canonical={canonicalUrl}
        meta={[{ name: 'robots', content: 'index, follow' }]}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            url: window.location.origin,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${window.location.origin}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${window.location.origin}/`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Search',
                item: `${window.location.origin}/search`,
              },
            ],
          },
        ]}
      />
      <PopupAd />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Search', current: true },
          ]}
        />

        <div className="grid gap-8 xl:grid-cols-[1.7fr_0.95fr]">
          <main className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="mb-2 text-sm uppercase tracking-[0.35em] text-red-600">Search jobs</p>
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Search Sarkari Job Updates</h1>
                </div>
              </div>

              <form className="mt-6" onSubmit={handleSubmit}>
                <label htmlFor="search-input" className="sr-only">
                  Search keywords
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    id="search-input"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by post title, category, state, admit card, result..."
                    className="min-w-0 flex-1 rounded-3xl border border-slate-300 bg-white px-5 py-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-3xl bg-red-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    Search
                  </button>
                </div>
              </form>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Trending searches</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {trendingKeywords.map((keyword) => (
                      <button
                        key={keyword}
                        type="button"
                        onClick={() => handleSuggestionClick(keyword)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-red-200 hover:text-red-600"
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>

                {recentSearches.length > 0 && (
                  <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">Recent searches</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {recentSearches.map((keyword) => (
                        <button
                          key={keyword}
                          type="button"
                          onClick={() => handleSuggestionClick(keyword)}
                          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-red-200 hover:text-red-600"
                        >
                          {keyword}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {!!urlQuery && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Showing search results for</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">{urlQuery}</h2>
                  </div>
                  <p className="text-sm text-slate-600">{matchedPosts.length} result{matchedPosts.length === 1 ? '' : 's'}</p>
                </div>

                <div className="mt-6 grid gap-4">
                  {loading
                    ? Array.from({ length: 6 }).map((_, idx) => (
                        <div key={idx} className="h-28 animate-pulse rounded-3xl border border-slate-200 bg-slate-100" />
                      ))
                    : pagedResults.map((post) => (
                        <article key={post.slug} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                          <Link to={`/blog/${post.slug}`} className="block p-6">
                            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-500">
                              <span>{post.category || 'Update'}</span>
                              <span className="text-slate-300">•</span>
                              <span>{post.state || 'National'}</span>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900">{post.title}</h3>
                            <p className="mt-4 text-sm leading-6 text-slate-600">{post.description}</p>
                          </Link>
                        </article>
                      ))}
                </div>

                {!loading && matchedPosts.length === 0 && (
                  <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
                    <p className="text-lg font-semibold text-slate-900">No results found</p>
                    <p className="mt-2 text-sm leading-6">
                      Try broader keywords like "railway jobs" or "admit card" to discover matching Sarkari posts.
                    </p>
                  </div>
                )}

                {!loading && matchedPosts.length > pageSize && (
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-600">Page {page} of {Math.ceil(matchedPosts.length / pageSize)}</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: Math.ceil(matchedPosts.length / pageSize) }, (_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handlePageChange(index + 1)}
                          className={`rounded-full px-4 py-2 text-sm transition ${page === index + 1 ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
          </main>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Search tips</h2>
              <ul className="space-y-3 text-sm leading-6 text-slate-600">
                <li>Use keywords like <strong>railway</strong>, <strong>admit card</strong>, or <strong>results</strong>.</li>
                <li>Try state names for localized jobs: <strong>Bihar</strong>, <strong>UP</strong>, <strong>MP</strong>.</li>
                <li>Search by education level: <strong>10th pass</strong>, <strong>graduate</strong>.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Quick categories</h2>
              <div className="grid gap-3 text-sm text-slate-700">
                <Link className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 hover:border-red-200 hover:bg-red-50" to="/latest-jobs">Latest Jobs</Link>
                <Link className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 hover:border-red-200 hover:bg-red-50" to="/results">Results</Link>
                <Link className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 hover:border-red-200 hover:bg-red-50" to="/admit-cards">Admit Cards</Link>
                <Link className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 hover:border-red-200 hover:bg-red-50" to="/railway-jobs">Railway Jobs</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
