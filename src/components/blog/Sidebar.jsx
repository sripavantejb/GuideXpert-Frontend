import { Link } from 'react-router-dom';

function SidebarCard({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function RelatedItem({ blog }) {
  if (!blog) return null;
  return (
    <Link
      to={`/blogs/${blog.id}`}
      className="group flex gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50"
    >
      <div className="h-16 w-20 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
        <img
          src={blog.coverImage || blog.image}
          alt={blog.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {blog.category || 'General'}
        </p>
        <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">{blog.title}</p>
      </div>
    </Link>
  );
}

export default function Sidebar({ related = [], categories = [], recent = [] }) {
  return (
    <div className="space-y-6">
      <SidebarCard title="Related Blogs">
        <div className="space-y-1">
          {related.length > 0 ? (
            related.map((b) => <RelatedItem key={b.id} blog={b} />)
          ) : (
            <p className="text-sm text-slate-600">No related posts yet.</p>
          )}
        </div>
      </SidebarCard>

      <SidebarCard title="Categories">
        <div className="flex flex-wrap gap-2">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
              >
                {cat}
              </span>
            ))
          ) : (
            <p className="text-sm text-slate-600">No categories yet.</p>
          )}
        </div>
      </SidebarCard>

      <SidebarCard title="Recent Posts">
        <ul className="space-y-2">
          {recent.length > 0 ? (
            recent.map((b) => (
              <li key={b.id}>
                <Link to={`/blogs/${b.id}`} className="text-sm font-semibold text-slate-800 hover:underline">
                  {b.title}
                </Link>
              </li>
            ))
          ) : (
            <li className="text-sm text-slate-600">No recent posts yet.</li>
          )}
        </ul>
      </SidebarCard>
    </div>
  );
}

