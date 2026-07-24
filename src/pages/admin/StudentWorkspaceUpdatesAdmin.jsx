import { useCallback, useEffect, useState } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRadio,
  FiX,
  FiBookmark,
  FiCheck,
} from 'react-icons/fi';
import {
  getStudentWorkspaceUpdates,
  createStudentWorkspaceUpdate,
  updateStudentWorkspaceUpdate,
  deleteStudentWorkspaceUpdate,
  publishStudentWorkspaceUpdate,
  unpublishStudentWorkspaceUpdate,
} from '../../utils/adminApi';
import ConfirmDialog from '../../components/Counsellor/ConfirmDialog';

const CATEGORIES = [
  { value: 'exam', label: 'Exam' },
  { value: 'admission', label: 'Admission' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'tool', label: 'Tools' },
  { value: 'counselling', label: 'Counselling' },
  { value: 'general', label: 'General' },
];

const PRIORITIES = [
  { value: 'normal', label: 'Normal' },
  { value: 'important', label: 'Important' },
  { value: 'urgent', label: 'Urgent' },
];

const EMPTY_FORM = {
  title: '',
  summary: '',
  category: 'general',
  tag: '',
  linkUrl: '',
  linkLabel: 'Learn more',
  imageUrl: '',
  priority: 'normal',
  status: 'draft',
  pinned: false,
  showInNavbar: true,
  showOnHome: true,
  expiresAt: '',
};

function statusClass(status) {
  if (status === 'published') return 'bg-green-100 text-green-800';
  if (status === 'expired') return 'bg-amber-100 text-amber-800';
  return 'bg-gray-100 text-gray-700';
}

function toDatetimeLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function StudentWorkspaceUpdatesAdmin() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const res = await getStudentWorkspaceUpdates(statusFilter ? { status: statusFilter } : {});
    if (!res.success) {
      setError(res.message || 'Failed to load updates');
      setList([]);
    } else {
      setList(res.data?.data || []);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      summary: item.summary || '',
      category: item.category || 'general',
      tag: item.tag || '',
      linkUrl: item.linkUrl || '',
      linkLabel: item.linkLabel || 'Learn more',
      imageUrl: item.imageUrl || '',
      priority: item.priority || 'normal',
      status: item.status === 'expired' ? 'published' : item.status || 'draft',
      pinned: !!item.pinned,
      showInNavbar: item.showInNavbar !== false,
      showOnHome: item.showOnHome !== false,
      expiresAt: toDatetimeLocal(item.expiresAt),
    });
    setModalOpen(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const body = {
      ...form,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    };
    const res = editingId
      ? await updateStudentWorkspaceUpdate(editingId, body)
      : await createStudentWorkspaceUpdate(body);
    setSaving(false);
    if (!res.success) {
      setError(res.message || 'Save failed');
      return;
    }
    setModalOpen(false);
    load();
  };

  const onPublishToggle = async (item) => {
    const res =
      item.status === 'published'
        ? await unpublishStudentWorkspaceUpdate(item.id)
        : await publishStudentWorkspaceUpdate(item.id);
    if (!res.success) setError(res.message || 'Action failed');
    else load();
  };

  const onDelete = async () => {
    if (!deleteConfirm) return;
    const res = await deleteStudentWorkspaceUpdate(deleteConfirm);
    setDeleteConfirm(null);
    if (!res.success) setError(res.message || 'Delete failed');
    else load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Education updates</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Post exam, admission, deadline, and tool updates. Published items appear in the student
            navbar notifications and the home updates section.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-navy px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95"
        >
          <FiPlus className="h-4 w-4" />
          New update
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[
          { value: '', label: 'All' },
          { value: 'published', label: 'Published' },
          { value: 'draft', label: 'Drafts' },
        ].map((opt) => (
          <button
            key={opt.value || 'all'}
            type="button"
            onClick={() => setStatusFilter(opt.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              statusFilter === opt.value
                ? 'bg-primary-navy text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">Loading updates…</p>
        ) : list.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            No updates yet. Create one to notify students.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {list.map((item) => (
              <li key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.pinned ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#f27921]">
                        <FiBookmark className="h-3 w-3" /> Pinned
                      </span>
                    ) : null}
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClass(item.status)}`}>
                      {item.status}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-slate-600">
                      {item.category}
                    </span>
                    <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      {item.priority}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-sm font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.summary}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Navbar: {item.showInNavbar ? 'Yes' : 'No'} · Home: {item.showOnHome ? 'Yes' : 'No'}
                    {item.linkUrl ? ` · Link: ${item.linkUrl}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onPublishToggle(item)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    title={item.status === 'published' ? 'Unpublish' : 'Publish'}
                  >
                    {item.status === 'published' ? <FiX className="h-3.5 w-3.5" /> : <FiRadio className="h-3.5 w-3.5" />}
                    {item.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <FiEdit2 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(item.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    <FiTrash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit update' : 'New update'}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg p-2 hover:bg-slate-100">
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <form className="space-y-4 p-5" onSubmit={onSave}>
              <label className="block text-sm font-semibold text-slate-700">
                Title *
                <input
                  required
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Summary *
                <textarea
                  required
                  rows={4}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                  value={form.summary}
                  onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
                  placeholder="Short education / exam / admission update students should see"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Category
                  <select
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Priority
                  <select
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    value={form.priority}
                    onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                  >
                    {PRIORITIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Tag label
                  <input
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    value={form.tag}
                    onChange={(e) => setForm((p) => ({ ...p, tag: e.target.value }))}
                    placeholder="e.g. New, Updated, Deadline"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Status
                  <select
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </label>
                <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                  Link URL
                  <input
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    value={form.linkUrl}
                    onChange={(e) => setForm((p) => ({ ...p, linkUrl: e.target.value }))}
                    placeholder="/students/rank-predictor or https://…"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Link label
                  <input
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    value={form.linkLabel}
                    onChange={(e) => setForm((p) => ({ ...p, linkLabel: e.target.value }))}
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Expires at
                  <input
                    type="datetime-local"
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    value={form.expiresAt}
                    onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                  Image URL (optional)
                  <input
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    value={form.imageUrl}
                    onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                {[
                  { key: 'pinned', label: 'Pinned' },
                  { key: 'showInNavbar', label: 'Show in navbar notifications' },
                  { key: 'showOnHome', label: 'Show on home updates section' },
                ].map((opt) => (
                  <label key={opt.key} className="inline-flex items-center gap-2 font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={!!form[opt.key]}
                      onChange={(e) => setForm((p) => ({ ...p, [opt.key]: e.target.checked }))}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-navy px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  <FiCheck className="h-4 w-4" />
                  {saving ? 'Saving…' : 'Save update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        isOpen={Boolean(deleteConfirm)}
        title="Delete this update?"
        message="Students will no longer see it in notifications or on the home page."
        confirmLabel="Delete"
        onConfirm={onDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
