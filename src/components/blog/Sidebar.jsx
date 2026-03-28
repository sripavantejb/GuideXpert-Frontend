import { Link } from 'react-router-dom';

export default function Sidebar({ related = [], categories = [], recent = [] }) {
  return (
    <div className="space-y-10">
      {/* Categories Widget */}
      {categories.length > 0 && (
        <div className="rounded-[18px] bg-slate-50 p-6 ring-1 ring-slate-200/60 shadow-sm">
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-slate-900">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex cursor-pointer items-center rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related Blogs Widget */}
      {related.length > 0 && (
        <div className="rounded-[18px] bg-slate-50 p-6 ring-1 ring-slate-200/60 shadow-sm">
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-slate-900">Related Reading</h3>
          <div className="space-y-5">
            {related.slice(0, 2).map((b) => (
              <Link key={b.id} to={`/blogs/${b.id}`} className="group flex gap-4">
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-200 ring-1 ring-slate-200">
                  <img
                    src={b.coverImage || b.image}
                    alt={b.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="line-clamp-2 text-sm font-semibold leading-tight text-slate-900 transition-colors group-hover:text-blue-700">
                    {b.title}
                  </h4>
                  <span className="mt-1.5 text-xs font-medium text-slate-500">{b.category || 'Article'}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Posts Widget */}
      {recent.length > 0 && (
        <div className="rounded-[18px] bg-slate-50 p-6 ring-1 ring-slate-200/60 shadow-sm">
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-slate-900">Recent Posts</h3>
          <ul className="space-y-4">
            {recent.map((b) => (
              <li key={b.id}>
                <Link
                  to={`/blogs/${b.id}`}
                  className="group relative inline-block text-sm font-medium leading-relaxed text-slate-700 transition-colors hover:text-blue-700"
                >
                  <span className="relative z-10">{b.title}</span>
                  <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-blue-700 transition-all duration-300 group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
