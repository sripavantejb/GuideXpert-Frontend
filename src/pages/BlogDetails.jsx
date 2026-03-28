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
import BlogCTASection from '../components/blog/BlogCTASection';

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
      // Scroll to top when loading new blog
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
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
    () => allBlogs.filter((b) => b.id !== id).filter((b) => b.category === blog?.category).slice(0, 2),
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

  // Display top 2 related blogs, or recent if none.
  const displayRelated = relatedBlogs.length > 0 ? relatedBlogs : allBlogs.filter((b) => b.id !== id).slice(0, 2);

  return (
    <ApplyModalProvider>
      <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-blue-100 font-santhosi">
        <Header standalone />
        
        <main className="flex-grow">
          <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-8 sm:px-6 lg:px-8">
            <div className="mb-8">
              <Link to="/blogs" className="group inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                <svg className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Blogs
              </Link>
            </div>

            {loading ? (
              <div className="space-y-12 animate-pulse">
                <Skeleton className="h-[500px] w-full rounded-[24px]" />
                <div className="grid gap-12 lg:grid-cols-12">
                  <div className="lg:col-span-8 space-y-6">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-11/12" />
                    <Skeleton className="h-4 w-10/12" />
                  </div>
                  <div className="lg:col-span-4 space-y-6">
                    <Skeleton className="h-40 w-full rounded-[18px]" />
                    <Skeleton className="h-40 w-full rounded-[18px]" />
                  </div>
                </div>
              </div>
            ) : !blog ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[24px] border border-slate-200 bg-white p-12 text-center shadow-sm">
                <h1 className="text-3xl font-extrabold text-slate-900">Blog not found</h1>
                <p className="mt-4 text-slate-600 max-w-md">
                  {error || 'The article you requested is unavailable or has been removed.'}
                </p>
                <Link
                  to="/blogs"
                  className="mt-8 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-md"
                >
                  Return to Home
                </Link>
              </div>
            ) : (
              <>
                {/* Article Hero Banner */}
                <div className="relative overflow-hidden rounded-[24px] bg-slate-900 shadow-xl ring-1 ring-slate-900/10">
                  <div className="absolute inset-0">
                    <img
                      src={blog.coverImage || blog.image}
                      alt={blog.title}
                      fetchPriority="high"
                      className="h-full w-full object-cover opacity-80 mix-blend-overlay transition-transform duration-[20s] ease-linear hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-slate-900/20" />
                  </div>

                  <div className="relative z-10 flex min-h-[250px] flex-col justify-end p-6 md:min-h-[320px] md:p-10 lg:px-12 animate-fadeInUp">
                    <div>
                      <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur-md ring-1 ring-white/30">
                        {blog.category || 'Editorial'}
                      </span>
                    </div>
                    <h1 className="mt-6 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl font-satoshi">
                      {blog.title}
                    </h1>
                    {blog.subtitle ? (
                      <h2 className="mt-4 max-w-3xl text-lg font-medium leading-relaxed text-slate-300 md:text-xl font-satoshi">
                        {blog.subtitle}
                      </h2>
                    ) : null}
                    
                    
                    <div className="mt-8 flex items-center gap-4 text-sm font-medium text-slate-300">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5">
                          <img 
                            src="https://ui-avatars.com/api/?name=GuideXpert+Editorial&background=random" 
                            alt="Author" 
                            className="h-full w-full rounded-full object-cover ring-2 ring-slate-900" 
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{blog.author || 'GuideXpert Editorial'}</span>
                          <span>{blog.createdAt ? formatDate(blog.createdAt) : 'Recently Published'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 grid gap-12 lg:grid-cols-12">
                  {/* Two Column Layout: Main (70%) and Sidebar (30%) */}
                  <article className="lg:col-span-8">
                    <div className="rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-10 lg:p-12">
                      <div className="prose prose-slate prose-lg md:prose-xl max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 prose-headings:font-satoshi font-santhosi prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:font-semibold hover:prose-a:text-blue-700 prose-img:rounded-2xl prose-img:shadow-md">
                        <RichContentRenderer
                          contentJson={blog.contentJson}
                          contentHtml={DOMPurify.sanitize(blog.contentHtml || blog.content || '<p>No content available.</p>')}
                        />
                      </div>
                    </div>

                    {/* CTA Section appended to bottom of main article */}
                    <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                      <BlogCTASection />
                    </div>
                  </article>

                  <aside className="lg:col-span-4">
                    <div className="sticky top-24 pt-2">
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
