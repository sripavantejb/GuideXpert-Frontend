import { Link } from 'react-router-dom';

export default function EditorialBlogCard({ blog }) {
  if (!blog) return null;
  const image = blog.coverImage || blog.image;

  return (
    <article className="group">
      <Link to={`/blogs/${blog.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-white ring-1 ring-slate-200 shadow-[0_14px_28px_rgba(15,23,42,0.12)] transition-shadow duration-300 group-hover:shadow-[0_18px_34px_rgba(15,23,42,0.18)]">
          <img
            src={image}
            alt={blog.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/35 to-transparent opacity-85 transition-opacity duration-300 group-hover:opacity-95" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h3 className="line-clamp-2 text-xl font-semibold leading-tight text-white md:text-2xl">
              {blog.title}
            </h3>
          </div>
        </div>
      </Link>
    </article>
  );
}

