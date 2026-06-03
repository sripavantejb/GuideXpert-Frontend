import { useCallback, useEffect, useState } from 'react';
import { FiPlus, FiToggleLeft, FiToggleRight, FiTrash2, FiUser } from 'react-icons/fi';
import {
  createOneOnOneCounselor,
  deleteOneOnOneCounselor,
  getOneOnOneCounselors,
  getStoredToken,
  patchOneOnOneCounselorStatus,
  updateOneOnOneCounselor,
} from '../../utils/adminApi';
import { useAuth } from '../../hooks/useAuth';

const EMPTY = {
  name: '',
  email: '',
  mobile: '',
  password: '',
  collegeName: '',
  designation: '',
  bio: '',
  profileImage: '',
  isActive: true,
};

export default function OneOnOneCounselorsAdmin() {
  const { logout, user } = useAuth();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = getStoredToken();
  const isSuperAdmin = user?.isSuperAdmin === true;

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getOneOnOneCounselors({}, token);
    setLoading(false);
    if (!res.success) {
      if (res.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      setError(res.message || 'Failed to load');
      return;
    }
    setRows(res.data?.data || res.data || []);
  }, [token, logout]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setError('Only Super Admin can manage counselor accounts.');
      return;
    }
    setError('');
    const res = editingId
      ? await updateOneOnOneCounselor(editingId, form, token)
      : await createOneOnOneCounselor(form, token);
    if (!res.success) {
      setError(res.message || 'Save failed');
      return;
    }
    setForm(EMPTY);
    setEditingId(null);
    load();
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiUser /> One-on-One Counselors
        </h1>
        <p className="text-sm text-gray-600">Create IITian/mentor login accounts (Super Admin only)</p>
      </div>

      {!isSuperAdmin ? (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
          You can view counselors but only Super Admin can create or edit accounts.
        </p>
      ) : null}

      {error ? <p className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg">{error}</p> : null}

      {isSuperAdmin ? (
        <form onSubmit={save} className="bg-white rounded-xl border p-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="border rounded-lg px-3 py-2 text-sm"
            required
          />
          <input
            type="email"
            placeholder="Email (login)"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="border rounded-lg px-3 py-2 text-sm"
            required
          />
          <input
            placeholder="Mobile (10 digits)"
            value={form.mobile}
            onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
            className="border rounded-lg px-3 py-2 text-sm"
            maxLength={10}
          />
          <input
            type="password"
            placeholder={editingId ? 'New password (optional)' : 'Password'}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="border rounded-lg px-3 py-2 text-sm"
            required={!editingId}
          />
          <input
            placeholder="IIT / College"
            value={form.collegeName}
            onChange={(e) => setForm((f) => ({ ...f, collegeName: e.target.value }))}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            placeholder="Designation"
            value={form.designation}
            onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Short bio"
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            className="border rounded-lg px-3 py-2 text-sm md:col-span-2"
            rows={2}
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-primary-navy text-white rounded-lg px-4 py-2 text-sm font-medium"
          >
            <FiPlus /> {editingId ? 'Update' : 'Create counselor'}
          </button>
        </form>
      ) : null}

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">College</th>
              <th className="px-3 py-2 text-left">Status</th>
              {isSuperAdmin ? <th className="px-3 py-2 text-left">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{c.name}</td>
                  <td className="px-3 py-2">{c.email}</td>
                  <td className="px-3 py-2">{c.collegeName || '—'}</td>
                  <td className="px-3 py-2">
                    {c.isActive ? (
                      <span className="text-emerald-700 text-xs font-medium">Active</span>
                    ) : (
                      <span className="text-gray-500 text-xs">Inactive</span>
                    )}
                  </td>
                  {isSuperAdmin ? (
                    <td className="px-3 py-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(c.id);
                          setForm({ ...EMPTY, ...c, password: '' });
                        }}
                        className="text-primary-navy text-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await patchOneOnOneCounselorStatus(c.id, !c.isActive, token);
                          load();
                        }}
                      >
                        {c.isActive ? <FiToggleRight className="text-emerald-600" /> : <FiToggleLeft />}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm('Delete counselor?')) return;
                          await deleteOneOnOneCounselor(c.id, token);
                          load();
                        }}
                        className="text-red-600"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
