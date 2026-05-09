import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo';
import Breadcrumbs from '../components/Breadcrumbs';
import PopupAd from '../components/PopupAd';
import Sidebar from '../components/Sidebar';

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

interface ArchiveConfig {
  title: string;
  heading: string;
  description: string;
  breadcrumb: string;
  path: string;
  filter: (post: BlogPost) => boolean;
  relatedLinks: Array<{ label: string; url: string }>;
}

const relatedArchiveLinks = [
  { label: 'Latest Jobs', url: '/latest-jobs' },
  { label: 'Results', url: '/results' },
  { label: 'Admit Cards', url: '/admit-cards' },
  { label: 'Syllabus', url: '/syllabus' },
  { label: 'Railway Jobs', url: '/railway-jobs' },
  { label: 'Bank Jobs', url: '/bank-jobs' },
];

const contains = (value: string | undefined, keywords: string[]) => {
  const text = (value ?? '').toLowerCase();
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
};

const archiveConfigs: Record<string, ArchiveConfig> = {
  'latest-jobs': {
    title: 'Latest Sarkari Jobs 2026',
    heading: 'Latest Jobs & Notifications',
    description:
      'Browse the latest Sarkari Job openings, official notifications, and career alerts from central and state government departments.',
    breadcrumb: 'Latest Jobs',
    path: '/latest-jobs',
    filter: (post) =>
      contains(post.placement, ['trending', 'latest']) ||
      contains(post.category, ['job']) ||
      contains(post.title, ['job', 'recruitment']),
    relatedLinks,
  },
  results: {
    title: 'Sarkari Results 2026',
    heading: 'Latest Sarkari Results',
    description: 'Find the latest government exam results, merit lists, and selection updates for Sarkari job aspirants.',
    breadcrumb: 'Results',
    path: '/results',
    filter: (post) => contains(post.category, ['result']) || contains(post.title, ['result', 'selection']),
    relatedLinks,
  },
  'admit-card': {
    title: 'Admit Card Updates 2026',
    heading: 'Admit Card Notices',
    description: 'Download admit cards and check exam dates for government exams and Sarkari job recruitment.',
    breadcrumb: 'Admit Cards',
    path: '/admit-cards',
    filter: (post) => contains(post.category, ['admit']) || contains(post.title, ['admit card', 'call letter']),
    relatedLinks,
  },
  syllabus: {
    title: 'Syllabus & Exam Pattern',
    heading: 'Exam Syllabus Updates',
    description: 'Access the latest syllabus, exam pattern, and preparation notices for government job exams.',
    breadcrumb: 'Syllabus',
    path: '/syllabus',
    filter: (post) => contains(post.category, ['syllabus']) || contains(post.title, ['syllabus', 'exam pattern']),
    relatedLinks,
  },
  'answer-key': {
    title: 'Answer Key Notices',
    heading: 'Answer Key & Question Paper',
    description: 'Review published answer keys and solution papers for recent government exam notifications.',
    breadcrumb: 'Answer Key',
    path: '/answer-key',
    filter: (post) => contains(post.title, ['answer key', 'answer-key', 'answerkey']) || contains(post.category, ['answer key']),
    relatedLinks,
  },
  'railway-jobs': {
    title: 'Railway Jobs 2026',
    heading: 'Railway Recruitment Updates',
    description: 'Latest railway job notifications, exam dates, admit cards, results, and recruitment alerts.',
    breadcrumb: 'Railway Jobs',
    path: '/railway-jobs',
    filter: (post) => contains(post.title, ['railway']) || contains(post.category, ['railway']),
    relatedLinks,
  },
  'bank-jobs': {
    title: 'Bank Jobs 2026',
    heading: 'Bank Recruitment Alerts',
    description: 'Discover the latest bank job openings, admit cards, and results from national and regional banking exams.',
    breadcrumb: 'Bank Jobs',
    path: '/bank-jobs',
    filter: (post) => contains(post.title, ['bank']) || contains(post.category, ['bank']),
    relatedLinks,
  },
  'ssc-jobs': {
    title: 'SSC & UPSC Jobs',
    heading: 'SSC / UPSC Recruitment',
    description: 'Get the latest SSC and UPSC job notifications, exam updates, and result announcements.',
    breadcrumb: 'SSC Jobs',
    path: '/ssc-jobs',
    filter: (post) => contains(post.title, ['ssc', 'upsc']) || contains(post.category, ['ssc', 'upsc']),
    relatedLinks,
  },
  'teaching-jobs': {
    title: 'Teaching Jobs 2026',
    heading: 'Teaching & Education Recruitment',
    description: 'Recent teacher recruitment notifications, admit cards, and exam details for teaching jobs.',
    breadcrumb: 'Teaching Jobs',
    path: '/teaching-jobs',
    filter: (post) => contains(post.title, ['teaching', 'teacher', 'tgt', 'pgt']) || contains(post.category, ['teaching', 'teacher']),
    relatedLinks,
  },
  '10th-pass-jobs': {
    title: '10th Pass Jobs',
    heading: '10th Pass Sarkari Jobs',
    description: 'Explore government job opportunities for 10th pass candidates with application and exam updates.',
    breadcrumb: '10th Pass Jobs',
    path: '/10th-pass-jobs',
    filter: (post) => contains(post.title, ['10th', 'matric', 'matriculation']) || contains(post.category, ['10th']),
    relatedLinks,
  },
  '12th-pass-jobs': {
    title: '12th Pass Jobs',
    heading: '12th Pass Sarkari Jobs',
    description: 'Latest notification and recruitment news for 12th pass job seekers in government sectors.',
    breadcrumb: '12th Pass Jobs',
    path: '/12th-pass-jobs',
    filter: (post) => contains(post.title, ['12th', 'intermediate']) || contains(post.category, ['12th']),
    relatedLinks,
  },
  'graduate-jobs': {
    title: 'Graduate Jobs',
    heading: 'Graduate Sarkari Jobs',
    description: 'Graduate-level government job alerts and application dates for merit-based recruitment.',
    breadcrumb: 'Graduate Jobs',
    path: '/graduate-jobs',
    filter: (post) => contains(post.title, ['graduate', 'degree']) || contains(post.category, ['graduate']),
    relatedLinks,
  },
  'iti-jobs': {
    title: 'ITI Jobs',
    heading: 'ITI & Trade Job Notifications',
    description: 'Get the latest ITI recruitment notices, admit cards, and exam schedules for technical trade jobs.',
    breadcrumb: 'ITI Jobs',
    path: '/iti-jobs',
    filter: (post) => contains(post.title, ['iti', 'industrial training']) || contains(post.category, ['iti']),
    relatedLinks,
  },
  'engineering-jobs': {
    title: 'Engineering Jobs',
    heading: 'Engineering Sarkari Jobs',
    description: 'Engineering job and recruitment updates for diploma, BE/BTech, and technical government vacancies.',
    breadcrumb: 'Engineering Jobs',
    path: '/engineering-jobs',
    filter: (post) => contains(post.title, ['engineer', 'engineering']) || contains(post.category, ['engineering']),
    relatedLinks,
  },
};

const getFriendlyName = (slug: string) =>
  slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

const buildStateConfig = (stateParam: string): ArchiveConfig => {
  const slug = stateParam.replace(/-/g, ' ').trim();
  const stateName = getFriendlyName(slug);
  return {
    title: `${stateName} Govt Jobs 2026`,
    heading: `${stateName} Sarkari Jobs`,
    description: `Latest ${stateName} government job notifications, admit cards, results, and recruitment alerts.`,
    breadcrumb: `${stateName} Jobs`,
    path: `/jobs/${stateParam}`,
    filter: (post) =>
      post.state?.toLowerCase() === stateName.toLowerCase() ||
      contains(post.title, [stateName]) ||
      contains(post.description, [stateName]),
    relatedLinks,
  };
};

export default function ArchivePage({ archiveKey }: { archiveKey?: string }) {
  const params = useParams<{ state: string }>();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const page = Math.max(1, Number(searchParams.get('page') || '1'));

  const archive = useMemo<ArchiveConfig>(() => {
    if (archiveKey === 'state' && params.state) {
      return buildStateConfig(params.state);
    }
    return archiveConfigs[archiveKey ?? 'latest-jobs'] ?? archiveConfigs['latest-jobs'];
  }, [archiveKey, params.state]);

  useEffect(() => {
    let abort = false;
    setLoading(true);

    fetch('/api/blogs')
      .then((response) => response.json())
      .then((data) => {
        if (!abort) {
          setBlogs(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!abort) {
          setBlogs([]);
          setLoading(false);
        }
      });

    return () => {
      abort = true;
    };
  }, []);

  const filteredPosts = useMemo(
    () => blogs.filter(archive.filter),
    [archive.filter, blogs]
  );

  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const pagedPosts = filteredPosts.slice((page - 1) * pageSize, page * pageSize);

  const handlePageChange = (nextPage: number) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('page', String(nextPage));
    setSearchParams(nextParams);
  };

  const canonicalUrl = `${window.location.origin}${location.pathname}${page > 1 ? `?page=${page}` : ''}`;

  const breadcrumbJson = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${window.location.origin}/` },
      {
        '@type': 'ListItem',
        position: 2,
        name: archive.breadcrumb,
        item: `${window.location.origin}${archive.path}`,
      },
    ],
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <Seo
        title={archive.title}
        description={archive.description}
        canonical={canonicalUrl}
        meta={[{ name: 'robots', content: 'index, follow' }]}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            url: canonicalUrl,
            name: archive.title,
            description: archive.description,
          },
          breadcrumbJson,
        ]}
      />
      <PopupAd />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: archive.breadcrumb, to: archive.path },
            { label: archive.title, current: true },
          ]}
        />

        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.35em] text-red-600">
                Archive & Category
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                {archive.heading}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                {archive.description}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700 shadow-inner">
              <p className="font-semibold text-slate-900">Match count</p>
              <p className="mt-1 text-4xl font-bold text-slate-900">{filteredPosts.length}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.35em] text-slate-500">Results found</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.7fr_0.95fr]">
          <div>
            <div className="grid gap-4 md:grid-cols-2">
              {loading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6" />
                  ))
                : pagedPosts.map((post) => (
                    <article key={post.slug} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                      <Link to={`/blog/${post.slug}`} className="block p-6">
                        <div className="mb-3 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
                          <span>{post.category || 'Update'}</span>
                          <span className="text-slate-300">•</span>
                          <span>{post.state || 'National'}</span>
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900 leading-tight">
                          {post.title}
                        </h2>
                        <p className="mt-4 text-sm leading-6 text-slate-600">
                          {post.description}
                        </p>
                        <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                          <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Latest'}</span>
                          <span className="font-semibold text-red-600">Read more</span>
                        </div>
                      </Link>
                    </article>
                  ))}
            </div>

            {!loading && filteredPosts.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
                <h2 className="mb-2 text-2xl font-semibold text-slate-900">No matching posts yet</h2>
                <p className="text-sm leading-6">
                  We’re still updating this archive. Try another category, state, or use the search tool for more results.
                </p>
              </div>
            )}

            {!loading && filteredPosts.length > pageSize && (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-600">
                  Page {page} of {totalPages}
                </p>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handlePageChange(index + 1)}
                      className={`rounded-full px-4 py-2 text-sm transition ${index + 1 === page ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Explore related archives</h2>
              <div className="grid gap-3">
                {archive.relatedLinks.map((link) => (
                  <Link
                    key={link.url}
                    to={link.url}
                    className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:border-red-200 hover:bg-red-50"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <Sidebar />
          </aside>
        </div>
      </div>
    </div>
  );
}
