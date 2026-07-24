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
  getStudentTestimonials,
  createStudentTestimonial,
  updateStudentTestimonial,
  deleteStudentTestimonial,
  publishStudentTestimonial,
  unpublishStudentTestimonial,
} from '../../utils/adminApi';
import ConfirmDialog from '../../components/Counsellor/ConfirmDialog';

const EMPTY_FORM = {
  studentName: '',
  quote: '',
  rank: '',
  exam: '',
  collegesText: '',
  accuracy: '95',
  photoUrl: '',
  status: 'draft',
  pinned: false,
  sortOrder: '0',
};

function statusClass(status) {
  if (status === 'published') return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-700';
}

export default function StudentTestimonialsAdmin() {
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
    const res = await getStudentTestimonials(statusFilter ? { status: statusFilter } : {});
    if (!res.success) {
      setError(res.message || 'Failed to load testimonials');
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
      studentName: item.studentName || '',
      quote: item.quote || '',
      rank: item.rank || '',
      exam: item.exam || '',
      collegesText: Array.isArray(item.colleges) ? item.colleges.join('\n') : '',
      accuracy: String(item.accuracy ?? 95),
      photoUrl: item.photoUrl || '',
      status: item.status || 'draft',
      pinned: !!item.pinned,
      sortOrder: String(item.sortOrder ?? 0),
    });
    setModalOpen(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const body = {
      studentName: form.studentName,
      quote: form.quote,
      rank: form.rank,
      exam: form.exam,
      colleges: form.collegesText,
      accuracy: Number(form.accuracy),
      photoUrl: form.photoUrl,
      status: form.status,
      pinned: form.pinned,
      sortOrder: Number(form.sortOrder) || 0,
    };
    const res = editingId
      ? await updateStudentTestimonial(editingId, body)
      : await createStudentTestimonial(body);
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
        ? await unpublishStudentTestimonial(item.id)
        : await publishStudentTestimonial(item.id);
    if (!res.success) setError(res.message || 'Action failed');
    else load();
  };

  const onDelete = async () => {
    if (!deleteConfirm) return;
    const res = await deleteStudentTestimonial(deleteConfirm);
    setDeleteConfirm(null);
    if (!res.success) setError(res.message || 'Delete failed');
    else load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Testimonials</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Add success stories shown on the students home page carousel (rank, exam, predicted
            colleges).
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-navy px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95"
        >
          <FiPlus className="h-4 w-4" />
          New testimonial
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
          <p className="p-8 text-center text-sm text-slate-500">Loading testimonials…</p>
        ) : list.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            No testimonials yet. Create one to show on the students home page.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {list.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.pinned ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#f27921]">
                        <FiBookmark className="h-3 w-3" /> Pinned
                      </span>
                    ) : null}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClass(item.status)}`}
                    >
                      {item.status}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {item.accuracy}% accuracy
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-sm font-semibold text-slate-900">
                    {item.studentName ? `${item.studentName} · ` : ''}
                    {item.rank}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{item.exam}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {(item.colleges || []).join(' · ') || 'No colleges'}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onPublishToggle(item)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {item.status === 'published' ? (
                      <FiX className="h-3.5 w-3.5" />
                    ) : (
                      <FiRadio className="h-3.5 w-3.5" />
                    )}
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
                {editingId ? 'Edit testimonial' : 'New testimonial'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <form className="space-y-4 p-5" onSubmit={onSave}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Student name (optional)
                  <input
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    value={form.studentName}
                    onChange={(e) => setForm((p) => ({ ...p, studentName: e.target.value }))}
                    placeholder="e.g. Ananya"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Rank / score *
                  <input
                    required
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    value={form.rank}
                    onChange={(e) => setForm((p) => ({ ...p, rank: e.target.value }))}
                    placeholder="e.g. AIR 12,456"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Exam *
                  <input
                    required
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    value={form.exam}
                    onChange={(e) => setForm((p) => ({ ...p, exam: e.target.value }))}
                    placeholder="e.g. JEE Main"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Accuracy %
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    value={form.accuracy}
                    onChange={(e) => setForm((p) => ({ ...p, accuracy: e.target.value }))}
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                  Predicted colleges * (one per line)
                  <textarea
                    required
                    rows={4}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    value={form.collegesText}
                    onChange={(e) => setForm((p) => ({ ...p, collegesText: e.target.value }))}
                    placeholder={'VIT Chennai\nSRM KTR\nAmrita CSE'}
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                  Quote (optional)
                  <textarea
                    rows={3}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    value={form.quote}
                    onChange={(e) => setForm((p) => ({ ...p, quote: e.target.value }))}
                    placeholder="Short testimonial quote from the student"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Photo URL (optional)
                  <input
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    value={form.photoUrl}
                    onChange={(e) => setForm((p) => ({ ...p, photoUrl: e.target.value }))}
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Sort order
                  <input
                    type="number"
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    value={form.sortOrder}
                    onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
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
                <label className="inline-flex items-center gap-2 self-end pb-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.pinned}
                    onChange={(e) => setForm((p) => ({ ...p, pinned: e.target.checked }))}
                  />
                  Pin to front of carousel
                </label>
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
                  {saving ? 'Saving…' : 'Save testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        isOpen={Boolean(deleteConfirm)}
        title="Delete this testimonial?"
        message="It will no longer appear on the students home page."
        confirmLabel="Delete"
        onConfirm={onDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
