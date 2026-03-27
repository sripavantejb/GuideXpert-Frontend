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
  const [visibleCount, setVisibleCount] = useState(8);

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

  const blogsCountLabel = useMemo(() => `${blogs.length} article${blogs.length === 1 ? '' : 's'}`, [blogs.length]);
  const visibleBlogs = useMemo(() => blogs.slice(0, visibleCount), [blogs, visibleCount]);
  const hasMore = visibleCount < blogs.length;

  return (
    <ApplyModalProvider>
      <div className="min-h-screen flex flex-col bg-[#faf9f7] text-[#1a1c1b]">
        <Header standalone />
        <main className="flex-grow">
          <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <section className="mb-7">
              <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">Blog Stories</h1>
              <p className="mt-1 text-sm text-slate-500">Latest updates and ideas</p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                {loading ? 'Loading articles...' : `Viewing ${blogsCountLabel}`}
              </p>
            </section>

            <div className="mb-6">
              <BlogHeroCarousel blogs={blogs} />
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                {error}
              </div>
            ) : null}

            {loading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="animate-pulse">
                    <div className="aspect-[4/3] rounded-xl bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : blogs.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
                No blogs published yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {visibleBlogs.map((blog) => (
                  <EditorialBlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            )}

            {!loading && hasMore ? (
              <div className="mt-8 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 4)}
                  className="rounded-full border border-emerald-700/70 bg-white px-6 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 hover:text-emerald-900"
                >
                  Load More
                </button>
              </div>
            ) : null}
          </section>
        </main>
        <Footer />
      </div>
    </ApplyModalProvider>
  );
}
