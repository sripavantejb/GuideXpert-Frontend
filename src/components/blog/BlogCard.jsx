import { Link } from 'react-router-dom';

export default function BlogCard({ blog }) {
  if (!blog) return null;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/blogs/${blog.id}`} className="block focus:outline-none">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <img
            src={blog.coverImage || blog.image}
            alt={blog.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
          <div className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-800 shadow-sm">
            {blog.category || 'General'}
          </div>
        </div>

        <div className="space-y-2 p-5">
          <h3 className="line-clamp-2 text-lg font-bold leading-snug text-slate-950">
            {blog.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
            {blog.subtitle || 'Read the full article for details.'}
          </p>

          <div className="pt-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-blue-800">
              Read More
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

