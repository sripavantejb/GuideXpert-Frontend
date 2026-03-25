import { Link } from 'react-router-dom';

export default function FeaturedBlog({ blog }) {
  if (!blog) return null;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-sm">
      <Link to={`/blogs/${blog.id}`} className="group relative block focus:outline-none">
        <div className="relative aspect-[21/9] md:aspect-[3/1]">
          <img
            src={blog.coverImage || blog.image}
            alt={blog.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25" />
        </div>

        <div className="absolute inset-0 flex items-end">
          <div className="w-full p-6 md:p-10">
            <div className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90 ring-1 ring-white/20">
              {blog.category || 'Featured'}
            </div>
            <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight text-white md:text-5xl">
              {blog.title}
            </h2>
            {blog.subtitle ? (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
                {blog.subtitle}
              </p>
            ) : null}

            <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-sm transition-colors duration-300 group-hover:bg-white/95">
              Read Article
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}

