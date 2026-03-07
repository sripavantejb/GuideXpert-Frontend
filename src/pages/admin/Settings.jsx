import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createAdmin, listAdmins } from '../../utils/adminApi';

const SECTION_OPTIONS = [
  { sectionKey: 'dashboard', label: 'Dashboard' },
  { sectionKey: 'leads', label: 'Lead Funnel' },
  { sectionKey: 'analytics', label: 'Analytics' },
  { sectionKey: 'meeting-attendance', label: 'User Productivity' },
  { sectionKey: 'export', label: 'Export Data' },
  { sectionKey: 'slots', label: 'Slots' },
  { sectionKey: 'training-form-responses', label: 'Training Form' },
  { sectionKey: 'training-feedback', label: 'Activation Form' },
  { sectionKey: 'influencer-tracking', label: 'Influencer / UTM Tracking' },
  { sectionKey: 'assessment-results', label: 'Custom Reports' },
  { sectionKey: 'settings', label: 'Settings' },
];

export default function Settings() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    name: '',
    isSuperAdmin: false,
    sectionAccess: [],
  });
  const [submitStatus, setSubmitStatus] = useState({ type: null, message: '' });
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = user?.isSuperAdmin === true;

  useEffect(() => {
    if (isSuperAdmin) {
      setAdminsLoading(true);
      listAdmins()
        .then((res) => {
          if (res.success && Array.isArray(res.data?.data)) setAdmins(res.data.data);
        })
        .finally(() => setAdminsLoading(false));
    }
  }, [isSuperAdmin]);

  const handleSectionToggle = (sectionKey) => {
    setForm((prev) => ({
      ...prev,
      sectionAccess: prev.sectionAccess.includes(sectionKey)
        ? prev.sectionAccess.filter((k) => k !== sectionKey)
        : [...prev.sectionAccess, sectionKey],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ type: null, message: '' });
    if (!form.username.trim()) {
      setSubmitStatus({ type: 'error', message: 'Username is required.' });
      return;
    }
    if (!form.password || form.password.length < 6) {
      setSubmitStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }
    setSubmitting(true);
    const result = await createAdmin({
      username: form.username.trim(),
      password: form.password,
      name: form.name.trim() || undefined,
      isSuperAdmin: form.isSuperAdmin,
      sectionAccess: form.sectionAccess,
    });
    setSubmitting(false);
    if (result.success) {
      setSubmitStatus({ type: 'success', message: 'Admin created successfully.' });
      setForm({ username: '', password: '', name: '', isSuperAdmin: false, sectionAccess: [] });
      listAdmins().then((res) => {
        if (res.success && Array.isArray(res.data?.data)) setAdmins(res.data.data);
      });
    } else {
      setSubmitStatus({ type: 'error', message: result.message || 'Failed to create admin.' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Settings</h2>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <p className="text-gray-600 mb-4">
          Admin settings. Change password and profile options will be available here in a future update.
        </p>
        <p className="text-sm text-gray-500">
          Use <strong>Log out</strong> in the sidebar (bottom) to sign out.
        </p>
      </div>

      {isSuperAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
          <h3 className="font-semibold mb-2">Super admin credentials</h3>
          <p className="mb-2">
            <strong>Development (when backend allows dev login):</strong> username <code className="px-1.5 py-0.5 bg-blue-100 rounded">admin</code>, password <code className="px-1.5 py-0.5 bg-blue-100 rounded">admin123</code>. The first time you log in with these, a super admin user is created automatically.
          </p>
          <p>
            <strong>Production / existing admins:</strong> Run the one-time migration <code className="px-1.5 py-0.5 bg-blue-100 rounded">node scripts/migrateExistingAdminsToSuperAdmin.js</code> from the backend folder to make all existing admins super admins. Then use your existing admin username and password.
          </p>
        </div>
      )}

      {!isSuperAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          Only super admins can create and manage other admins.
        </div>
      )}

      {isSuperAdmin && (
        <>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Manage admins</h3>

            {adminsLoading ? (
              <p className="text-sm text-gray-500">Loading admins…</p>
            ) : admins.length > 0 ? (
              <ul className="space-y-2 mb-6">
                {admins.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <span className="font-medium text-gray-800">{a.username}</span>
                    <span className="text-xs text-gray-500">
                      {a.name || '—'}
                      {a.isSuperAdmin && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-primary-navy/10 text-primary-navy font-medium">
                          Super admin
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            <h4 className="text-sm font-semibold text-gray-700 mb-3">Create admin</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="new-admin-username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  id="new-admin-username"
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-primary-navy"
                  placeholder="e.g. editor"
                  autoComplete="username"
                />
              </div>
              <div>
                <label htmlFor="new-admin-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password * (min 6 characters)
                </label>
                <input
                  id="new-admin-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-primary-navy"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label htmlFor="new-admin-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name (optional)
                </label>
                <input
                  id="new-admin-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-primary-navy"
                  placeholder="Display name"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="new-admin-super"
                  type="checkbox"
                  checked={form.isSuperAdmin}
                  onChange={(e) => setForm((p) => ({ ...p, isSuperAdmin: e.target.checked }))}
                  className="rounded border-gray-300 text-primary-navy focus:ring-primary-navy"
                />
                <label htmlFor="new-admin-super" className="text-sm font-medium text-gray-700">
                  Super admin (full access and can create other admins)
                </label>
              </div>
              {!form.isSuperAdmin && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">View section access</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SECTION_OPTIONS.map(({ sectionKey, label }) => (
                      <label key={sectionKey} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.sectionAccess.includes(sectionKey)}
                          onChange={() => handleSectionToggle(sectionKey)}
                          className="rounded border-gray-300 text-primary-navy focus:ring-primary-navy"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {submitStatus.message && (
                <p
                  className={`text-sm ${
                    submitStatus.type === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}
                  role="alert"
                >
                  {submitStatus.message}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-primary-navy text-white rounded-lg font-medium hover:bg-primary-navy/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating…' : 'Create admin'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
