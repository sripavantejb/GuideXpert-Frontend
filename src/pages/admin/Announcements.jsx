import { useState, useEffect } from 'react';
import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
  unpublishAnnouncement,
  getAnnouncementAnalytics,
} from '../../utils/adminApi';
import ConfirmDialog from '../../components/Counsellor/ConfirmDialog';
import { FiPlus, FiEdit2, FiTrash2, FiRadio, FiX, FiBookmark, FiBarChart2 } from 'react-icons/fi';

const PRIORITIES = [
  { value: 'normal', label: 'Normal' },
  { value: 'important', label: 'Important' },
  { value: 'urgent', label: 'Urgent' },
];

const REACTION_LABELS = { helpful: '👍 Helpful', appreciated: '❤️ Appreciated', great: '👏 Great', important: '🔥 Important' };

function displayName(raw) {
  if (raw == null || String(raw).trim() === '') return 'Unknown';
  const s = String(raw).trim();
  if (s.toLowerCase() === 'counsellor') return 'Unknown';
  return s;
}

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

export default function Announcements() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [analyticsId, setAnalyticsId] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [selectedReactionType, setSelectedReactionType] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'normal',
    expiryDate: '',
  });

  const loadList = async () => {
    setLoading(true);
    setError('');
    const res = await getAnnouncements();
    setLoading(false);
    setList(Array.isArray(res.data?.data) ? res.data.data : []);
    if (!res.success) setError(res.message || 'Failed to load announcements');
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
    const res = await getAnnouncementById(String(id));
    const d = res.data?.data ?? res.data;
    if (!res.success || !d) return;
    setEditingId(String(id));
    setForm({
      title: d.title || '',
      description: d.description || '',
      priority: d.priority || 'normal',
      expiryDate: d.expiryDate ? String(d.expiryDate).slice(0, 16) : '',
    });
    setModalOpen(true);
  };

  const openAnalytics = async (id) => {
    setAnalyticsId(String(id));
    setAnalyticsData(null);
    setSelectedReactionType(null);
    setAnalyticsLoading(true);
    const res = await getAnnouncementAnalytics(String(id));
    setAnalyticsLoading(false);
    const data = res?.data?.data ?? res?.data;
    setAnalyticsData(res.success && data ? data : null);
  };

  const handlePinToggle = async (id, currentPinned) => {
    const res = await updateAnnouncement(String(id), { pinned: !currentPinned });
    if (res.success) await loadList();
    else alert(res.message || 'Update failed');
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
        const res = await updateAnnouncement(String(editingId), payload);
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
    const res = await deleteAnnouncement(String(deleteConfirm.id));
    setDeleteConfirm(null);
    if (res.success) await loadList();
    else alert(res.message || 'Delete failed');
  };

  const handlePublish = async (id) => {
    const res = await publishAnnouncement(String(id));
    if (res.success) await loadList();
    else alert(res.message || 'Publish failed');
  };

  const handleUnpublish = async (id) => {
    const res = await unpublishAnnouncement(String(id));
    if (res.success) await loadList();
    else alert(res.message || 'Unpublish failed');
  };

  return (
    <div className="min-h-[60vh] bg-gray-50/80 rounded-2xl p-6 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Announcements</h1>
            <p className="text-sm text-gray-500 mt-1.5">Create and manage system-wide announcements</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-navy hover:bg-primary-navy/90 transition-all shadow-md hover:shadow-lg shrink-0"
          >
            <FiPlus className="w-4 h-4" /> Create Announcement
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-sm text-red-700" role="alert">{error}</p>
            <button type="button" onClick={loadList} className="text-sm font-medium text-red-700 hover:underline shrink-0">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-16 text-center">
            <div className="inline-block w-10 h-10 border-2 border-primary-navy border-t-transparent rounded-full animate-spin mb-4" aria-hidden />
            <p className="text-gray-500 text-sm font-medium">Loading announcements…</p>
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary-blue-50 flex items-center justify-center mx-auto mb-5">
              <FiRadio className="w-10 h-10 text-primary-navy" />
            </div>
            <p className="text-xl font-semibold text-gray-900">No announcements yet</p>
            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">Create your first announcement to notify counsellors across the system.</p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-navy hover:bg-primary-navy/90 shadow-md hover:shadow-lg transition-all"
            >
              <FiPlus className="w-4 h-4" /> Create Announcement
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2">
            {list.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md overflow-hidden transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate text-base">{item.title}</h3>
                      <p className="mt-1.5 text-sm text-gray-600 line-clamp-2 leading-relaxed">{item.preview || '—'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${priorityBadgeClass(item.priority)}`}>
                        {item.priority}
                      </span>
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${statusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span title="Views">{item.viewCount ?? 0} views</span>
                    <span title="Reactions">
                      {(item.reactionCounts && Object.values(item.reactionCounts).reduce((s, n) => s + n, 0)) || 0} reactions
                      {item.reactionCounts && (
                        <span className="ml-1 text-gray-400">
                          ({(item.reactionCounts.helpful || 0)} 👍 {(item.reactionCounts.appreciated || 0)} ❤️ {(item.reactionCounts.great || 0)} 👏 {(item.reactionCounts.important || 0)} 🔥)
                        </span>
                      )}
                    </span>
                    {item.priority === 'urgent' && (
                      <span title="Acknowledged">{item.acknowledgedCount ?? 0} acknowledged</span>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span>Created: {formatDate(item.createdAt)}</span>
                    <span>Updated: {formatDate(item.updatedAt)}</span>
                  </div>
                  <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handlePinToggle(String(item.id), !!item.pinned)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${item.pinned ? 'text-amber-700 bg-amber-50 hover:bg-amber-100' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'}`}
                      title={item.pinned ? 'Unpin' : 'Pin'}
                    >
                      <FiBookmark className="w-3.5 h-3.5" /> {item.pinned ? 'Pinned' : 'Pin'}
                    </button>
                    <button
                      type="button"
                      onClick={() => openAnalytics(String(item.id))}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <FiBarChart2 className="w-3.5 h-3.5" /> View analytics
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(String(item.id))}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    {item.status === 'published' && (
                      <button
                        type="button"
                        onClick={() => handleUnpublish(String(item.id))}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                      >
                        Unpublish
                      </button>
                    )}
                    {item.status !== 'published' && (
                      <button
                        type="button"
                        onClick={() => handlePublish(String(item.id))}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm({ id: String(item.id), title: item.title })}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between shrink-0 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Announcement' : 'Create Announcement'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-200 transition-colors"
                aria-label="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Details</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="ann-title" className="block text-sm font-medium text-gray-700 mb-1">Title (required)</label>
                    <input
                      id="ann-title"
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy outline-none text-sm transition-colors"
                      placeholder="Announcement title"
                    />
                  </div>
                  <div>
                    <label htmlFor="ann-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-xs text-gray-500 mb-1.5">
                      Plain text only. Paste URLs in the text—they will be clickable for counsellors. Use new lines for lists; lines starting with &quot;- &quot; will show as bullets.
                    </p>
                    <textarea
                      id="ann-description"
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      rows={6}
                      className="w-full min-h-[140px] px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy outline-none text-sm resize-y transition-colors"
                      placeholder="Write your announcement content…"
                    />
                  </div>
                </div>
              </section>
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Priority & schedule</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="ann-priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      id="ann-priority"
                      value={form.priority}
                      onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy outline-none text-sm transition-colors"
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
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy outline-none text-sm transition-colors"
                    />
                  </div>
                </div>
              </section>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex flex-wrap gap-2 justify-end shrink-0 bg-gray-50/50">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={saveLoading || !form.title.trim()}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                {saveLoading ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={saveLoading || !form.title.trim()}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-navy hover:bg-primary-navy/90 disabled:opacity-50 transition-colors shadow-sm"
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

      {/* Analytics modal */}
      {analyticsId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between shrink-0 bg-white">
              <h2 className="text-xl font-semibold text-gray-900">Announcement analytics</h2>
              <button
                type="button"
                onClick={() => { setAnalyticsId(null); setAnalyticsData(null); setSelectedReactionType(null); }}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-200 transition-colors"
                aria-label="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              {analyticsLoading ? (
                <div className="py-12 text-center">
                  <div className="inline-block w-8 h-8 border-2 border-primary-navy border-t-transparent rounded-full animate-spin mb-3" aria-hidden />
                  <p className="text-gray-500 text-sm">Loading analytics…</p>
                </div>
              ) : analyticsData ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="rounded-xl bg-white p-4 border border-gray-200 shadow-sm">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Views</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{analyticsData.viewCount ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-white p-4 border border-gray-200 shadow-sm">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reactions</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{analyticsData.totalReactions ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-white p-4 border border-primary-navy/10 shadow-sm">
                      <p className="text-xs font-semibold text-primary-navy uppercase tracking-wider">Engagement</p>
                      <p className="text-2xl font-bold text-primary-navy mt-1">{analyticsData.engagementRate ?? 0}%</p>
                    </div>
                    <div className="rounded-xl bg-white p-4 border border-gray-200 shadow-sm">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Acknowledged</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{analyticsData.acknowledgedCount ?? 0}</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Reaction breakdown</h3>
                    <p className="text-sm text-gray-500 mb-3">Click a reaction to see who reacted and when.</p>
                    <div className="flex flex-wrap gap-2">
                      {['helpful', 'appreciated', 'great', 'important'].map((type) => {
                        const count = analyticsData.reactionCounts?.[type] ?? 0;
                        const label = REACTION_LABELS[type];
                        const isSelected = selectedReactionType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setSelectedReactionType(isSelected ? null : type)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isSelected ? 'bg-primary-navy text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                          >
                            {label} ({count})
                          </button>
                        );
                      })}
                    </div>
                    {selectedReactionType && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-900">
                            Who reacted with {REACTION_LABELS[selectedReactionType]}
                          </h4>
                          <button
                            type="button"
                            onClick={() => setSelectedReactionType(null)}
                            className="text-sm font-medium text-primary-navy hover:underline"
                          >
                            Back
                          </button>
                        </div>
                        <ul className="max-h-44 overflow-y-auto space-y-2 text-sm">
                          {(analyticsData.reactions?.[selectedReactionType] ?? []).length === 0 ? (
                            <li className="text-gray-500 py-2">No one has reacted with this yet.</li>
                          ) : (
                            (analyticsData.reactions?.[selectedReactionType] ?? []).map((u, i) => (
                              <li key={(u.counsellorId || '') + i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                                <span className="w-8 h-8 rounded-full bg-primary-blue-100 text-primary-navy flex items-center justify-center text-sm font-semibold shrink-0">
                                  {(displayName(u.name) || '?').charAt(0).toUpperCase()}
                                </span>
                                <span className="font-medium text-gray-800">{displayName(u.name)}</span>
                                <span className="text-gray-500 ml-auto shrink-0 text-xs">
                                  {u.reactedAt ? new Date(u.reactedAt).toLocaleString() : '—'}
                                </span>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">Viewed ({analyticsData.viewedBy?.length ?? 0})</h3>
                    <ul className="max-h-40 overflow-y-auto space-y-2 text-sm">
                      {(analyticsData.viewedBy || []).length === 0 ? (
                        <li className="text-gray-500 py-2">No views yet.</li>
                      ) : (
                        analyticsData.viewedBy.map((v, i) => (
                          <li key={(v.counsellorId || '') + i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                            <span className="w-8 h-8 rounded-full bg-primary-blue-100 text-primary-navy flex items-center justify-center text-sm font-semibold shrink-0">
                              {(displayName(v.name) || '?').charAt(0).toUpperCase()}
                            </span>
                            <span className="font-medium text-gray-800">{displayName(v.name)}</span>
                            <span className="text-gray-500 ml-auto shrink-0 text-xs">
                              {v.readAt ? new Date(v.readAt).toLocaleString() : '—'}
                            </span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">Not viewed ({analyticsData.notViewedBy?.length ?? 0})</h3>
                    <ul className="max-h-32 overflow-y-auto space-y-2 text-sm">
                      {(analyticsData.notViewedBy || []).length === 0 ? (
                        <li className="text-gray-500 py-2">Everyone has viewed.</li>
                      ) : (
                        <>
                          {analyticsData.notViewedBy.slice(0, 20).map((v, i) => (
                            <li key={(v.counsellorId || '') + i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                              <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-semibold shrink-0">
                                {(displayName(v.name) || '?').charAt(0).toUpperCase()}
                              </span>
                              <span className="font-medium text-gray-800">{displayName(v.name)}</span>
                            </li>
                          ))}
                          {(analyticsData.notViewedBy?.length ?? 0) > 20 && (
                            <li className="text-gray-500 py-2">+ {(analyticsData.notViewedBy?.length ?? 0) - 20} more</li>
                          )}
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="py-8 text-center text-gray-500">Failed to load analytics.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
