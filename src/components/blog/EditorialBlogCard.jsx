import { Link } from 'react-router-dom';

function stripHtml(html) {
  if (!html) return '';
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export default function EditorialBlogCard({ blog }) {
  if (!blog) return null;
  const image = blog.coverImage || blog.image;
  const excerpt = blog.subtitle || (blog.content ? stripHtml(blog.content).substring(0, 120) + '...' : '');

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-[16px] bg-white ring-1 ring-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)] hover:ring-slate-300">
      <Link to={`/blogs/${blog.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">Read {blog.title}</span>
      </Link>

      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {image ? (
          <img
            src={image}
            alt={blog.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-slate-100" />
        )}
        {/* Subtle gradient overlay to make tags pop if they are over the image */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="flex flex-1 flex-col p-6 font-santhosi">
        <div className="mb-4 flex items-center justify-between">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-600 ring-1 ring-blue-500/20">
            {blog.category || 'Editorial'}
          </span>
          <span className="text-xs font-medium text-slate-400">
            {blog.readTime || '5 min read'}
          </span>
        </div>
        
        <h3 className="mt-2 text-xl font-bold leading-snug tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors font-satoshi line-clamp-3">
          {blog.title}
        </h3>
        
        {excerpt && (
          <p className="mt-3 line-clamp-2 text-sm text-slate-500 leading-relaxed">
            {excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-2">
            <span>{blog.author || 'GuideXpert Editor'}</span>
          </div>
          <span className="group-hover:text-blue-600 flex items-center gap-1 transition-colors">
            Read <span aria-hidden="true">&rarr;</span>
          </span>
        </div>
      </div>
    </article>
  );
}
