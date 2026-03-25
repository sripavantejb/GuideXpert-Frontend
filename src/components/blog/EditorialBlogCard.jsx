import { Link } from 'react-router-dom';

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatDate(value) {
  if (!value) return 'Recent';
  try {
    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Recent';
  }
}

function estimateReadTime(blog) {
  const text = stripHtml(blog?.contentHtml || blog?.content || blog?.subtitle || '');
  const words = text ? text.split(' ').length : 0;
  const mins = Math.max(3, Math.round(words / 220) || 3);
  return `${mins} min read`;
}

export default function EditorialBlogCard({ blog }) {
  if (!blog) return null;

  const excerpt = stripHtml(blog.subtitle || blog.excerpt || blog.contentHtml || blog.content).slice(0, 180);
  const avatar = (blog.author || 'G').charAt(0).toUpperCase();

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(15,23,42,0.10)]">
      <Link to={`/blogs/${blog.id}`} className="block">
        <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/70">
          <img
            src={blog.coverImage || blog.image}
            alt={blog.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 rounded-full bg-emerald-800 px-2.5 py-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">
              {blog.category || 'General'}
            </span>
          </div>
        </div>

        <h3 className="mb-2 line-clamp-2 min-h-[3.4rem] font-serif text-[1.72rem] font-semibold leading-[1.08] text-slate-900 transition-colors group-hover:text-emerald-800">
          {blog.title}
        </h3>

        <p className="mb-4 line-clamp-2 min-h-[2.9rem] text-sm leading-relaxed text-slate-500">
          {excerpt || 'Read the full article for details.'}
        </p>
      </Link>

      <footer className="mt-auto flex items-center justify-between border-t border-slate-200/80 pt-3.5">
        <div className="flex items-center gap-3">
          {blog.authorImage ? (
            <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-200">
              <img src={blog.authorImage} alt={blog.author} loading="lazy" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
              {avatar}
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-slate-900">{blog.author || 'GuideXpert Editorial'}</p>
            <p className="text-[10px] text-slate-500">{formatDate(blog.createdAt || blog.date)}</p>
          </div>
        </div>
        <span className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
          {blog.readTime || estimateReadTime(blog)}
        </span>
      </footer>
    </article>
  );
}

