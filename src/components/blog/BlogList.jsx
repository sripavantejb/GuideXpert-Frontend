import BlogCard from './BlogCard';

export default function BlogList({ blogs = [] }) {
  const list = Array.isArray(blogs) ? blogs : [];

  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((blog) => (
        <BlogCard key={blog.id} blog={blog} />
      ))}
    </section>
  );
}

