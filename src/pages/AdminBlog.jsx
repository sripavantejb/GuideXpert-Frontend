import { useEffect, useMemo, useState } from 'react';
import { getStoredToken } from '../utils/adminApi';
import { createBlog, deleteBlog, fetchBlogs, updateBlog } from '../services/blogApi';
import { getCoverPool, pickNextCoverImage } from '../utils/blogImagePool';
import RichBlogEditor from '../components/blog/editor/RichBlogEditor';
import EditorPreview from '../components/blog/editor/EditorPreview';

const initialForm = {
  title: '',
  subtitle: '',
  category: 'Education',
  customCategory: '',
  content: '',
  contentHtml: '<p></p>',
  contentJson: null,
  image: '',
  author: 'GuideXpert Editorial',
};

const categoryOptions = [
  'Education',
  'Technology',
  'Admissions',
  'Career Guidance',
  'Study Abroad',
  'Student Success',
  'Other',
];

export default function AdminBlog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [query, setQuery] = useState('');

  const loadBlogs = async () => {
    setLoading(true);
    setError('');
    const res = await fetchBlogs();
    if (res.success && res.blogs) {
      setBlogs(res.blogs);
    } else {
      setBlogs([]);
      setError(res.message || 'Failed to load blogs');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const sortedBlogs = useMemo(() => [...blogs], [blogs]);

  const onFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onFormChange('image', String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  const resolvedCategory = form.category === 'Other' ? form.customCategory.trim() : form.category.trim();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (
      !form.title.trim() ||
      !form.subtitle.trim() ||
      !resolvedCategory ||
      !form.contentJson
    ) {
      setError('Title, subtitle, category, and structured content are required.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      category: resolvedCategory,
      coverImage: form.image.trim() || pickNextCoverImage(),
      content: form.contentHtml,
      contentHtml: form.contentHtml,
      contentJson: form.contentJson,
      author: form.author.trim() || 'GuideXpert Editorial',
    };

    const token = getStoredToken();
    if (!token) {
      setError('Admin token missing. Please login again.');
      return;
    }

    setSaving(true);
    const res = editingId
      ? await updateBlog(editingId, payload, token)
      : await createBlog(payload, token);
    setSaving(false);

    if (!res.success) {
      setError(res.message || 'Save failed');
      return;
    }

    setSuccess(editingId ? 'Blog updated successfully.' : 'Blog created successfully.');
    resetForm();
    await loadBlogs();
  };

  const handleEdit = (blog) => {
    const normalizedCategory = categoryOptions.includes(blog.category) ? blog.category : 'Other';
    setEditingId(blog.id);
    setForm({
      title: blog.title || '',
      subtitle: blog.subtitle || '',
      category: normalizedCategory,
      customCategory: normalizedCategory === 'Other' ? (blog.category || '') : '',
      content: blog.content || '',
      contentHtml: blog.contentHtml || blog.content || '<p></p>',
      contentJson: blog.contentJson || null,
      image: blog.coverImage || blog.image || '',
      author: blog.author || 'GuideXpert Editorial',
    });
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog permanently?')) return;
    setError('');
    setSuccess('');
    const token = getStoredToken();
    if (!token) {
      setError('Admin token missing. Please login again.');
      return;
    }
    const res = await deleteBlog(id, token);
    if (!res.success) {
      setError(res.message || 'Delete failed');
      return;
    }
    if (editingId === id) resetForm();
    setSuccess('Blog deleted.');
    await loadBlogs();
  };

  const visibleBlogs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedBlogs;
    return sortedBlogs.filter((b) => {
      const hay = `${b.title || ''} ${b.subtitle || ''} ${b.category || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [sortedBlogs, query]);

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Blog Management</h2>
        <p className="mt-1 text-sm text-gray-500">
          Write long-form structured articles with live preview before publishing to{' '}
          <span className="font-semibold text-gray-800">/blogs</span>.
        </p>
      </header>

      <section className="grid gap-6 xl:grid-cols-10">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-5 shadow-sm xl:col-span-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Article' : 'Create Article'}</h3>
            <span className="text-xs font-medium text-slate-500">Editor Panel</span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              value={form.title}
              onChange={(e) => onFormChange('title', e.target.value)}
              placeholder="Title"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-navy"
            />
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => onFormChange('subtitle', e.target.value)}
              placeholder="Subtitle"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-navy"
            />
            <select
              value={form.category}
              onChange={(e) => onFormChange('category', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-navy"
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <input
              type="text"
              value={form.author}
              onChange={(e) => onFormChange('author', e.target.value)}
              placeholder="Author / Publisher"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-navy"
            />
          </div>
          {form.category === 'Other' ? (
            <input
              type="text"
              value={form.customCategory}
              onChange={(e) => onFormChange('customCategory', e.target.value)}
              placeholder="Custom category"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-navy"
            />
          ) : null}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleUpload(e.target.files?.[0])}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <p className="text-xs text-gray-500">
            Optional: if cover image is not uploaded, an image from the preloaded pool is assigned automatically.
          </p>
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200">
            Writing guidance: Start with a short intro hook, use clear H2/H3 section headings, keep paragraphs concise,
            include step-by-step lists, highlight key lines, and end with a CTA link.
          </p>

          <RichBlogEditor
            valueJson={form.contentJson}
            valueHtml={form.contentHtml}
            onChange={({ contentJson, contentHtml }) => {
              setForm((prev) => ({
                ...prev,
                contentJson,
                contentHtml,
                content: contentHtml,
              }));
            }}
          />

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          {success && <p className="text-sm font-medium text-emerald-700">{success}</p>}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary-navy px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
            >
              {saving ? 'Saving…' : editingId ? 'Update Blog' : 'Add Blog'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="xl:col-span-4">
          <EditorPreview
            title={form.title}
            subtitle={form.subtitle}
            category={resolvedCategory}
            author={form.author}
            coverImage={form.image || getCoverPool()[0]}
            contentJson={form.contentJson}
            contentHtml={form.contentHtml}
          />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">All Blogs</p>
            <p className="text-xs text-gray-500">Search, edit, and delete published content.</p>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, category…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-navy md:max-w-sm"
          />
        </div>

        {loading && <p className="text-sm text-gray-500">Loading blogs…</p>}
        {!loading && visibleBlogs.length === 0 && (
          <p className="rounded-2xl bg-white p-6 text-sm text-gray-500 shadow-sm">
            No blogs found. Add one using the editor.
          </p>
        )}

        {visibleBlogs.map((blog) => (
          <article key={blog.id} className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm md:flex-row md:items-center">
            <img
              src={blog.coverImage || blog.image}
              alt={blog.title}
              className="h-24 w-full rounded-xl object-cover md:w-36"
              loading="lazy"
            />
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{blog.category}</p>
              <h4 className="text-lg font-bold text-gray-900">{blog.title}</h4>
              <p className="line-clamp-1 text-sm text-gray-500">{blog.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleEdit(blog)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(blog.id)}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
