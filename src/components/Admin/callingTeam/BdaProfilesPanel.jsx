import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiKey, FiRefreshCw, FiSearch, FiTrash2, FiUser } from 'react-icons/fi';
import TableSkeleton from '../../UI/TableSkeleton';
import { BDA_LANGUAGES, languageBadgeClass } from '../../../constants/bdaLanguage';
import { deleteBda, listBdas, resetBdaPassword, updateBda } from '../../../utils/callingTeamApi';

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return String(name || 'B').slice(0, 2).toUpperCase();
}

function StatusBadge({ status }) {
  const active = status === 'active';
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
        active ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
      }`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

export default function BdaProfilesPanel({ refreshKey = 0, showTitle = true, showCredentialsHint = false }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    language: 'Hindi',
    status: 'active',
    newPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [resettingId, setResettingId] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const res = await listBdas({ status: 'all' });
    if (res.success && Array.isArray(res.data?.data)) {
      setProfiles(res.data.data);
    } else {
      setError(res.message || 'Failed to load BDA profiles');
      setProfiles([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return profiles.filter((p) => {
      if (statusFilter && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        String(p.name || '').toLowerCase().includes(q) ||
        String(p.phone || '').includes(q) ||
        String(p.email || '').toLowerCase().includes(q)
      );
    });
  }, [profiles, search, statusFilter]);

  const openEdit = (profile) => {
    const id = profile.id || profile.bdaId;
    setEditing(id);
    setEditForm({
      name: profile.name || '',
      phone: profile.phone || '',
      email: profile.email || '',
      language: profile.language || 'Hindi',
      status: profile.status || 'active',
      newPassword: '',
    });
    setSaveError('');
  };

  const closeEdit = () => {
    setEditing(null);
    setSaveError('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setSaveError('');
    if (!BDA_LANGUAGES.some((l) => l.value === editForm.language)) {
      setSaving(false);
      setSaveError('BDA language must be Hindi or Telugu');
      return;
    }
    const res = await updateBda(editing, {
      name: editForm.name.trim(),
      phone: editForm.phone.trim() || '',
      email: editForm.email.trim(),
      language: editForm.language,
      status: editForm.status,
    });
    if (!res.success) {
      setSaving(false);
      setSaveError(res.message || 'Failed to update profile');
      return;
    }
    if (editForm.newPassword && editForm.newPassword.length >= 6) {
      const pwdRes = await resetBdaPassword(editing, editForm.newPassword);
      if (!pwdRes.success) {
        setSaving(false);
        setSaveError(pwdRes.message || 'Profile saved but password reset failed');
        return;
      }
    }
    setSaving(false);
    closeEdit();
    load();
  };

  const openResetPassword = (profile) => {
    const id = profile.id || profile.bdaId;
    setResettingId(id);
    setResetPassword('');
    setSaveError('');
  };

  const handleResetPasswordOnly = async (e) => {
    e.preventDefault();
    if (!resettingId) return;
    if (!resetPassword || resetPassword.length < 6) {
      setSaveError('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    setSaveError('');
    const res = await resetBdaPassword(resettingId, resetPassword);
    setSaving(false);
    if (res.success) {
      setResettingId(null);
      setResetPassword('');
    } else {
      setSaveError(res.message || 'Failed to reset password');
    }
  };

  const toggleStatus = async (profile) => {
    const id = profile.id || profile.bdaId;
    const next = profile.status === 'active' ? 'inactive' : 'active';
    const res = await updateBda(id, { status: next });
    if (res.success) load();
    else setError(res.message || 'Failed to update status');
  };

  const handleDelete = async (profile) => {
    const id = profile.id || profile.bdaId;
    if (!id) return;
    const confirmed = window.confirm(
      `Delete ${profile.name || 'this BDA'}?\n\nThis permanently removes login access and unassigns their leads.`
    );
    if (!confirmed) return;
    setDeletingId(id);
    const res = await deleteBda(id);
    setDeletingId(null);
    if (res.success) load();
    else setError(res.message || 'Failed to delete profile');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FiUser className="text-primary-blue" />
          {showTitle && (
            <div>
              <h2 className="font-semibold text-gray-900">BDA profiles & login access</h2>
              <p className="text-xs text-gray-500">
                {showCredentialsHint
                  ? 'Edit profile, reset portal password, or deactivate login access'
                  : 'All BDA profiles — use Edit or Reset password for portal access'}
              </p>
            </div>
          )}
          {!showTitle && <h2 className="font-semibold text-gray-900">All created profiles</h2>}
          <span className="text-xs font-medium bg-primary-blue-100 text-primary-navy px-2 py-0.5 rounded-full">
            {profiles.length}
          </span>
        </div>
        <button
          type="button"
          onClick={load}
          className="p-2 border rounded-lg hover:bg-gray-50"
          aria-label="Refresh profiles"
        >
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-3 border-b flex flex-wrap gap-2 items-center bg-gray-50/80">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchDraft.trim());
          }}
        >
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Search name, phone, email"
              className="pl-9 pr-3 py-2 border rounded-lg text-sm w-52 bg-white"
            />
          </div>
          <button type="submit" className="px-3 py-2 text-sm border rounded-lg bg-white">
            Search
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error && (
        <p className="px-4 py-2 text-sm text-red-600 border-b bg-red-50">{error}</p>
      )}

      {loading ? (
        <TableSkeleton rows={4} cols={8} />
      ) : filtered.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-gray-500">
          {profiles.length === 0
            ? 'No BDA profiles yet. Use the form above to create one.'
            : 'No profiles match your search'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-4 py-3">Profile</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">Assigned leads</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((profile) => {
                const id = profile.id || profile.bdaId;
                return (
                  <tr key={id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-blue-100 text-primary-navy text-xs font-semibold">
                          {getInitials(profile.name)}
                        </span>
                        <span className="font-medium text-gray-900">{profile.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{profile.phone || '—'}</td>
                    <td className="px-4 py-3">{profile.email || '—'}</td>
                    <td className="px-4 py-3">
                      {profile.language ? (
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${languageBadgeClass(profile.language)}`}>
                          {profile.language}
                        </span>
                      ) : (
                        <span className="text-xs text-amber-700">Set in Edit</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{profile.assignedLeadsCount ?? 0}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={profile.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(profile.joinedAt || profile.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => openResetPassword(profile)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded-lg hover:bg-white text-primary-navy"
                        >
                          <FiKey /> Reset password
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(profile)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded-lg hover:bg-white"
                        >
                          <FiEdit2 /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStatus(profile)}
                          className="px-2 py-1 text-xs font-medium border rounded-lg hover:bg-white"
                        >
                          {profile.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(profile)}
                          disabled={deletingId === id}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-red-200 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
                        >
                          <FiTrash2 />
                          {deletingId === id ? 'Deleting…' : 'Delete'}
                        </button>
                        <Link
                          to={`/admin/calling-team/bdas/${id}`}
                          className="px-2 py-1 text-xs font-medium text-primary-blue hover:underline"
                        >
                          Performance
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {resettingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form
            onSubmit={handleResetPasswordOnly}
            className="bg-white rounded-xl shadow-xl w-full max-w-md border border-gray-200"
          >
            <div className="px-4 py-3 border-b font-semibold text-gray-900 flex items-center gap-2">
              <FiKey className="text-primary-blue" />
              Reset BDA portal password
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-600">
                Sets a new password for <strong>/bda/login</strong>. The BDA can sign in with their email or phone
                and this password.
              </p>
              <input
                type="text"
                required
                minLength={6}
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="New password (min 6 characters)"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                autoComplete="new-password"
              />
              {saveError && <p className="text-sm text-red-600">{saveError}</p>}
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setResettingId(null);
                  setSaveError('');
                }}
                className="px-4 py-2 text-sm text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-blue text-white disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Update password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-xl shadow-xl w-full max-w-md border border-gray-200"
          >
            <div className="px-4 py-3 border-b font-semibold text-gray-900">Edit BDA profile & credentials</div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Name</label>
                <input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Phone</label>
                <input
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))
                  }
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="10 digits or leave empty"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">BDA language *</label>
                <select
                  value={editForm.language}
                  onChange={(e) => setEditForm((f) => ({ ...f, language: e.target.value }))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                >
                  {BDA_LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
                <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                  <FiKey className="text-primary-blue" />
                  Portal login password (optional)
                </label>
                <input
                  type="text"
                  minLength={6}
                  value={editForm.newPassword}
                  onChange={(e) => setEditForm((f) => ({ ...f, newPassword: e.target.value }))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white"
                  placeholder="Leave blank to keep current password"
                  autoComplete="new-password"
                />
                <p className="text-xs text-gray-500 mt-1">Used at /bda/login with email or phone above</p>
              </div>
              {saveError && <p className="text-sm text-red-600">{saveError}</p>}
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t">
              <button type="button" onClick={closeEdit} className="px-4 py-2 text-sm text-gray-700">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-blue text-white disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
