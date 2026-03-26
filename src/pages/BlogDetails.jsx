import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import Skeleton from '../components/UI/Skeleton';
import { fetchBlogById, fetchBlogs } from '../services/blogApi';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import Sidebar from '../components/blog/Sidebar';
import RichContentRenderer from '../components/blog/editor/RichContentRenderer';
import { ApplyModalProvider } from '../contexts/ApplyModalContext';

function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function BlogDetails() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      const [one, list] = await Promise.all([fetchBlogById(id), fetchBlogs({ limit: 50 })]);
      if (cancelled) return;
      if (!one.success || !one.blog) {
        setBlog(null);
        setError(one.message || 'Blog not found');
        setAllBlogs(list.success && list.blogs ? list.blogs : []);
        setLoading(false);
        return;
      }
      setBlog(one.blog);
      setAllBlogs(list.success && list.blogs ? list.blogs : []);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const relatedBlogs = useMemo(
    () => allBlogs.filter((b) => b.id !== id).filter((b) => b.category === blog?.category).slice(0, 3),
    [allBlogs, id, blog?.category]
  );

  const recentBlogs = useMemo(
    () => allBlogs.filter((b) => b.id !== id).slice(0, 5),
    [allBlogs, id]
  );

  const categories = useMemo(() => {
    const set = new Set();
    allBlogs.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set).sort();
  }, [allBlogs]);

  const displayRelated = relatedBlogs.length > 0 ? relatedBlogs : allBlogs.filter((b) => b.id !== id).slice(0, 3);

  return (
    <ApplyModalProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-white to-slate-50">
        <Header standalone />
        <main className="flex-grow">
          <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
            <div className="mb-6">
              <Link to="/blogs" className="text-sm font-semibold text-slate-700 hover:underline">
                ← Back to Blogs
              </Link>
            </div>

            {loading ? (
              <div className="space-y-6">
                <Skeleton className="aspect-[21/9] w-full rounded-3xl md:aspect-[3/1]" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <div className="grid gap-8 lg:grid-cols-10">
                  <div className="lg:col-span-7 space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-11/12" />
                    <Skeleton className="h-6 w-10/12" />
                    <Skeleton className="h-6 w-9/12" />
                  </div>
                  <div className="lg:col-span-3 space-y-4">
                    <Skeleton className="h-36 w-full rounded-2xl" />
                    <Skeleton className="h-36 w-full rounded-2xl" />
                    <Skeleton className="h-36 w-full rounded-2xl" />
                  </div>
                </div>
              </div>
            ) : !blog ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <h1 className="text-2xl font-extrabold text-slate-950">Blog not found</h1>
                <p className="mt-2 text-sm text-slate-600">
                  {error || 'The article you requested is unavailable.'}
                </p>
                <Link
                  to="/blogs"
                  className="mt-6 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-slate-800"
                >
                  Back to Blogs
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-sm">
                  <div className="relative aspect-[21/9] md:aspect-[3/1]">
                    <img
                      src={blog.coverImage || blog.image}
                      alt={blog.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25" />
                  </div>
                  <div className="p-6 md:p-10">
                    <div className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90 ring-1 ring-white/20">
                      {blog.category || 'General'}
                    </div>
                    <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white md:text-5xl">
                      {blog.title}
                    </h1>
                    {blog.subtitle ? (
                      <h2 className="mt-3 max-w-3xl text-base font-semibold text-white/80 md:text-xl">
                        {blog.subtitle}
                      </h2>
                    ) : null}
                    <p className="mt-5 text-sm text-white/75">
                      <span className="font-semibold text-white">{blog.author || 'GuideXpert Editorial'}</span>
                      {blog.createdAt ? <> · {formatDate(blog.createdAt)}</> : null}
                    </p>
                  </div>
                </div>

                <div className="mt-10 grid gap-8 lg:grid-cols-10">
                  <article className="lg:col-span-7">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                      <RichContentRenderer
                        contentJson={blog.contentJson}
                        contentHtml={DOMPurify.sanitize(blog.contentHtml || blog.content || '<p>No content available.</p>')}
                      />
                    </div>
                  </article>

                  <aside className="lg:col-span-3">
                    <div className="sticky top-24">
                      <Sidebar related={displayRelated} categories={categories} recent={recentBlogs} />
                    </div>
                  </aside>
                </div>
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ApplyModalProvider>
  );
}
