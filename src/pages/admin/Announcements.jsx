import { useState, useEffect, useRef } from 'react';
import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
  unpublishAnnouncement,
} from '../../utils/adminApi';
import ConfirmDialog from '../../components/Counsellor/ConfirmDialog';
import { FiPlus, FiEdit2, FiTrash2, FiRadio, FiX } from 'react-icons/fi';

const PRIORITIES = [
  { value: 'normal', label: 'Normal' },
  { value: 'important', label: 'Important' },
  { value: 'urgent', label: 'Urgent' },
];

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function priorityBadgeClass(priority) {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800';
    case 'important':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-primary-blue-100 text-primary-navy';
  }
}

function statusBadgeClass(status) {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-700';
    case 'published':
      return 'bg-green-100 text-green-800';
    case 'expired':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

function RichTextToolbar({ textareaRef, value, onChange }) {
  const insertTag = (before, after = before) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = value || '';
    const selected = text.slice(start, end);
    const newText = text.slice(0, start) + before + (selected || 'text') + after + text.slice(end);
    onChange(newText);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + (selected || 'text').length);
    }, 0);
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border border-gray-200 border-b-0 rounded-t-lg bg-gray-50">
      <button
        type="button"
        onClick={() => insertTag('<b>', '</b>')}
        className="px-2 py-1 text-xs font-semibold rounded border border-gray-300 bg-white hover:bg-gray-100"
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => insertTag('<ul>\n<li>', '</li>\n</ul>')}
        className="px-2 py-1 text-xs rounded border border-gray-300 bg-white hover:bg-gray-100"
      >
        List
      </button>
      <button
        type="button"
        onClick={() => {
          const url = window.prompt('Link URL:', 'https://');
          if (url) insertTag(`<a href="${url}" target="_blank" rel="noopener">`, '</a>');
        }}
        className="px-2 py-1 text-xs rounded border border-gray-300 bg-white hover:bg-gray-100"
      >
        Link
      </button>
    </div>
  );
}

export default function Announcements() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'normal',
    expiryDate: '',
  });
  const descriptionRef = useRef(null);

  const loadList = async () => {
    setLoading(true);
    const res = await getAnnouncements();
    setLoading(false);
    if (res.success && Array.isArray(res.data)) setList(res.data);
  };

  useEffect(() => {
    loadList();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: '', description: '', priority: 'normal', expiryDate: '' });
    setModalOpen(true);
  };

  const openEdit = async (id) => {
    const res = await getAnnouncementById(id);
    if (!res.success || !res.data) return;
    const d = res.data;
    setEditingId(id);
    setForm({
      title: d.title || '',
      description: d.description || '',
      priority: d.priority || 'normal',
      expiryDate: d.expiryDate ? d.expiryDate.slice(0, 16) : '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setSaveLoading(false);
  };

  const handleSave = async (publish) => {
    if (!form.title.trim()) return;
    setSaveLoading(true);
    const payload = {
      title: form.title.trim(),
      description: form.description || '',
      priority: form.priority,
      expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null,
      status: publish ? 'published' : 'draft',
    };
    try {
      if (editingId) {
        const res = await updateAnnouncement(editingId, payload);
        if (res.success) {
          await loadList();
          closeModal();
        } else {
          alert(res.message || 'Update failed');
        }
      } else {
        const res = await createAnnouncement(payload);
        if (res.success) {
          await loadList();
          closeModal();
        } else {
          alert(res.message || 'Create failed');
        }
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const res = await deleteAnnouncement(deleteConfirm.id);
    setDeleteConfirm(null);
    if (res.success) await loadList();
    else alert(res.message || 'Delete failed');
  };

  const handlePublish = async (id) => {
    const res = await publishAnnouncement(id);
    if (res.success) await loadList();
    else alert(res.message || 'Publish failed');
  };

  const handleUnpublish = async (id) => {
    const res = await unpublishAnnouncement(id);
    if (res.success) await loadList();
    else alert(res.message || 'Unpublish failed');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage system-wide announcements</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-navy hover:opacity-90 transition-opacity shadow-sm"
        >
          <FiPlus className="w-4 h-4" /> Create Announcement
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8 text-center text-gray-500">
          Loading…
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-12 text-center">
          <FiRadio className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No announcements yet</p>
          <p className="text-sm text-gray-500 mt-1">Create your first announcement to get started</p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary-navy hover:opacity-90"
          >
            <FiPlus className="w-4 h-4" /> Create Announcement
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {list.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{item.preview || '—'}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-medium ${priorityBadgeClass(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-medium capitalize ${statusBadgeClass(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span>Created: {formatDate(item.createdAt)}</span>
                  <span>Updated: {formatDate(item.updatedAt)}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <FiEdit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  {item.status === 'published' && (
                    <button
                      type="button"
                      onClick={() => handleUnpublish(item.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                    >
                      Unpublish
                    </button>
                  )}
                  {item.status !== 'published' && (
                    <button
                      type="button"
                      onClick={() => handlePublish(item.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm({ id: item.id, title: item.title })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Announcement' : 'Create Announcement'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <label htmlFor="ann-title" className="block text-sm font-medium text-gray-700 mb-1">Title (required)</label>
                <input
                  id="ann-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none text-sm"
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (rich text)</label>
                <RichTextToolbar
                  textareaRef={descriptionRef}
                  value={form.description}
                  onChange={(v) => setForm((f) => ({ ...f, description: v }))}
                />
                <textarea
                  ref={descriptionRef}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 rounded-b-lg border border-gray-300 focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none text-sm resize-y"
                  placeholder="You can use HTML: <b>bold</b>, <ul><li>bullet</li></ul>, <a href='...'>link</a>"
                />
              </div>
              <div>
                <label htmlFor="ann-priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  id="ann-priority"
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none text-sm"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ann-expiry" className="block text-sm font-medium text-gray-700 mb-1">Expiry date (optional)</label>
                <input
                  id="ann-expiry"
                  type="datetime-local"
                  value={form.expiryDate}
                  onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none text-sm"
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex flex-wrap gap-2 justify-end shrink-0">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={saveLoading || !form.title.trim()}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                {saveLoading ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={saveLoading || !form.title.trim()}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary-navy hover:opacity-90 disabled:opacity-50"
              >
                {saveLoading ? 'Saving…' : 'Save & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete announcement?"
        message={deleteConfirm ? `"${deleteConfirm.title}" will be permanently deleted.` : ''}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
        variant="danger"
      />
    </div>
  );
}
