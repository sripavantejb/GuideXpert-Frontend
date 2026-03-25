import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { ApplyModalProvider } from '../contexts/ApplyModalContext';
import { useEffect, useMemo, useState } from 'react';
import EditorialBlogCard from '../components/blog/EditorialBlogCard';
import { fetchBlogs } from '../services/blogApi';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <ApplyModalProvider>
      <div className="min-h-screen flex flex-col bg-[#faf9f7] text-[#1a1c1b]">
        <Header standalone />
        <main className="flex-grow">
          <section className="mx-auto max-w-6xl px-6 py-8">
            <section className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">Blogs</h1>
              <p className="mt-1 text-base text-gray-500">Latest Articles</p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                {loading ? 'Loading articles...' : `Viewing ${blogsCountLabel}`}
              </p>
            </section>

            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                {error}
              </div>
            ) : null}

            {loading ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="animate-pulse">
                    <div className="mb-6 aspect-[16/9] rounded-xl bg-slate-200" />
                    <div className="mb-3 h-6 rounded bg-slate-200" />
                    <div className="mb-2 h-4 rounded bg-slate-200" />
                    <div className="mb-6 h-4 w-5/6 rounded bg-slate-200" />
                    <div className="h-8 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : blogs.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
                No blogs published yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {blogs.map((blog) => (
                  <EditorialBlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            )}

            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-slate-300/60 bg-white text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
                aria-label="Previous page"
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M12.5 4.5L7 10l5.5 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-emerald-800 text-sm font-bold text-white shadow-sm">
                  1
                </button>
                <button type="button" className="grid h-10 w-10 place-items-center rounded-full text-sm font-medium text-slate-500 transition hover:bg-slate-200/70">
                  2
                </button>
                <button type="button" className="grid h-10 w-10 place-items-center rounded-full text-sm font-medium text-slate-500 transition hover:bg-slate-200/70">
                  3
                </button>
                <span className="grid h-10 w-10 place-items-center text-slate-500">...</span>
                <button type="button" className="grid h-10 w-10 place-items-center rounded-full text-sm font-medium text-slate-500 transition hover:bg-slate-200/70">
                  21
                </button>
              </div>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-slate-300/60 bg-white text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
                aria-label="Next page"
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M7.5 4.5L13 10l-5.5 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </ApplyModalProvider>
  );
}
