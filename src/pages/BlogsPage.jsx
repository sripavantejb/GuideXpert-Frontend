import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { ApplyModalProvider } from '../contexts/ApplyModalContext';
import { useEffect, useMemo, useState } from 'react';
import EditorialBlogCard from '../components/blog/EditorialBlogCard';
import BlogHeroCarousel from '../components/blog/BlogHeroCarousel';
import { fetchBlogs } from '../services/blogApi';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(9); // Show 9 initially (3 rows of 3)

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      const res = await fetchBlogs({ limit: 60 });
      if (cancelled) return;
      if (!res.success) {
        setBlogs([]);
        setError(res.message || 'Failed to load blogs');
        setLoading(false);
        return;
      }
      setBlogs(Array.isArray(res.blogs) ? res.blogs : []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const blogsCountLabel = useMemo(() => `${blogs.length} article${blogs.length === 1 ? '' : 's'} viewing`, [blogs.length]);
  // Start visibleBlogs after the first 5 which are in carousel if possible, 
  // actually, let's keep all blogs in the grid since the hero is just a highlight.
  const visibleBlogs = useMemo(() => blogs.slice(0, visibleCount), [blogs, visibleCount]);
  const hasMore = visibleCount < blogs.length;

  return (
    <ApplyModalProvider>
      <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-blue-100 font-santhosi">
        <Header standalone />

        <main className="flex-grow pt-4 lg:pt-8 z-10 relative">
          <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
            {/* Left aligned page header */}
            <div className="mb-6 animate-fadeInUp">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl font-satoshi">
                Blog Stories
              </h1>
              <p className="mt-4 max-w-3xl text-lg text-slate-500 leading-relaxed md:text-xl">
                Latest updates, deep dives, and ideas from the team. Discover insights that can shape your journey.
              </p>
            </div>

            <div className="mb-12">
              <BlogHeroCarousel blogs={blogs} />
            </div>

            {/* Grid Header */}
            <div className="mb-10 flex items-center justify-between border-b border-slate-200 pb-5">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-satoshi">Latest Articles</h2>
            </div>

            {error ? (
              <div className="rounded-[16px] border border-rose-200 bg-rose-50 p-6 text-sm font-medium text-rose-800">
                {error}
              </div>
            ) : null}

            {loading ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 9 }).map((_, idx) => (
                  <div key={idx} className="animate-pulse">
                    <div className="aspect-[16/10] rounded-[16px] bg-slate-200" />
                    <div className="mt-4 h-6 w-3/4 rounded bg-slate-200" />
                    <div className="mt-2 h-4 w-1/2 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : blogs.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[18px] border border-slate-200 bg-white p-10 text-center shadow-sm">
                <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">No articles</h3>
                <p className="mt-1 text-sm text-slate-500">We haven't published any blogs yet. Check back soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {visibleBlogs.map((blog) => (
                  <EditorialBlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            )}

            {!loading && hasMore && (
              <div className="mt-16 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 9)}
                  className="group inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-8 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                >
                  Load More
                  <svg className="h-4 w-4 transition-transform group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </ApplyModalProvider>
  );
}
