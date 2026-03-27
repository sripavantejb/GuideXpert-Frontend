import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { createAdmin, listAdmins, deleteAdmin, resetAdminPassword, changeMyPassword } from '../../utils/adminApi';

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

function getSectionLabels(keys) {
  if (!Array.isArray(keys)) return [];
  return keys.map((k) => SECTION_OPTIONS.find((o) => o.sectionKey === k)?.label).filter(Boolean);
}

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
  const [showPassword, setShowPassword] = useState(false);
  const [removeModal, setRemoveModal] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState('');
  const [resetPasswordModal, setResetPasswordModal] = useState(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState('');
  const [resetPasswordSubmitting, setResetPasswordSubmitting] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [changePasswordStatus, setChangePasswordStatus] = useState({ type: null, message: '' });
  const [changePasswordSubmitting, setChangePasswordSubmitting] = useState(false);

  const isSuperAdmin = user?.isSuperAdmin === true;

  const handleConfirmRemove = () => {
    if (!removeModal) return;
    const id = removeModal.id != null ? String(removeModal.id) : '';
    if (!id) {
      setRemoveError('Invalid admin id.');
      return;
    }
    setRemoveError('');
    setRemoving(true);
    deleteAdmin(id)
      .then((res) => {
        if (!res.success) throw new Error(res.message || 'Failed to remove admin.');
        return listAdmins();
      })
      .then((res) => {
        if (res.success && Array.isArray(res.data?.data)) setAdmins(res.data.data);
        setRemoveModal(null);
      })
      .catch((err) => {
        const msg = err.message || 'Something went wrong.';
        setRemoveError(msg === 'Not found' ? 'Remove admin is not available on this server. Run the backend locally or redeploy.' : msg);
      })
      .finally(() => setRemoving(false));
  };

  const handleConfirmResetPassword = () => {
    if (!resetPasswordModal) return;
    setResetPasswordError('');
    if (!resetPasswordValue || resetPasswordValue.length < 6) {
      setResetPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (resetPasswordValue !== resetPasswordConfirm) {
      setResetPasswordError('Passwords do not match.');
      return;
    }
    const id = resetPasswordModal.id != null ? String(resetPasswordModal.id) : '';
    if (!id) {
      setResetPasswordError('Invalid admin.');
      return;
    }
    setResetPasswordSubmitting(true);
    resetAdminPassword(id, { newPassword: resetPasswordValue })
      .then((res) => {
        if (!res.success) throw new Error(res.message || 'Failed to update password.');
        setResetPasswordModal(null);
        setResetPasswordValue('');
        setResetPasswordConfirm('');
        listAdmins().then((r) => {
          if (r.success && Array.isArray(r.data?.data)) setAdmins(r.data.data);
        });
      })
      .catch((err) => setResetPasswordError(err.message || 'Something went wrong.'))
      .finally(() => setResetPasswordSubmitting(false));
  };

  const handleChangeMyPassword = async (e) => {
    e.preventDefault();
    setChangePasswordStatus({ type: null, message: '' });
    const { current, new: newPwd, confirm } = changePasswordForm;
    if (!current.trim()) {
      setChangePasswordStatus({ type: 'error', message: 'Current password is required.' });
      return;
    }
    if (!newPwd || newPwd.length < 6) {
      setChangePasswordStatus({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPwd !== confirm) {
      setChangePasswordStatus({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }
    setChangePasswordSubmitting(true);
    const result = await changeMyPassword({ currentPassword: current, newPassword: newPwd });
    setChangePasswordSubmitting(false);
    if (result.success) {
      setChangePasswordStatus({ type: 'success', message: 'Password changed successfully.' });
      setChangePasswordForm({ current: '', new: '', confirm: '' });
    } else {
      setChangePasswordStatus({ type: 'error', message: result.message || 'Failed to change password.' });
    }
  };

  useEffect(() => {
    if (!isSuperAdmin) return;
    let cancelled = false;
    queueMicrotask(() => setAdminsLoading(true));
    listAdmins()
      .then((res) => {
        if (cancelled) return;
        if (res.success && Array.isArray(res.data?.data)) setAdmins(res.data.data);
      })
      .finally(() => {
        if (!cancelled) setAdminsLoading(false);
      });
    return () => { cancelled = true; };
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
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Settings</h2>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Change my password</h3>
        <p className="text-sm text-gray-500 mb-4">
          Update your own login password. You will need to sign in again with the new password after changing it.
        </p>
        <form onSubmit={handleChangeMyPassword} className="max-w-md space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">Current password *</label>
            <input
              id="current-password"
              type="password"
              value={changePasswordForm.current}
              onChange={(e) => setChangePasswordForm((p) => ({ ...p, current: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-primary-navy outline-none"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">New password (min 6 characters) *</label>
            <input
              id="new-password"
              type="password"
              value={changePasswordForm.new}
              onChange={(e) => setChangePasswordForm((p) => ({ ...p, new: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-primary-navy outline-none"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm new password *</label>
            <input
              id="confirm-password"
              type="password"
              value={changePasswordForm.confirm}
              onChange={(e) => setChangePasswordForm((p) => ({ ...p, confirm: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-primary-navy outline-none"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          {changePasswordStatus.message && (
            <p className={`text-sm ${changePasswordStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`} role="alert">
              {changePasswordStatus.message}
            </p>
          )}
          <button
            type="submit"
            disabled={changePasswordSubmitting}
            className="px-4 py-2.5 rounded-lg bg-primary-navy text-white hover:bg-primary-navy/90 font-medium disabled:opacity-50"
          >
            {changePasswordSubmitting ? 'Updating…' : 'Change password'}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-6 pt-4 border-t border-gray-100">
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
          <p className="font-medium mb-1">Only super admins can create and manage other admins.</p>
          <p className="mt-2 text-amber-700">
            If you should have access, log out (sidebar bottom) and log in again to refresh your permissions. If you use a self-hosted backend, run <code className="px-1 py-0.5 bg-amber-100 rounded text-xs">node scripts/migrateExistingAdminsToSuperAdmin.js</code> from the backend folder first so existing admins become super admins.
          </p>
        </div>
      )}

      {isSuperAdmin && (
        <>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Manage admins</h3>
            <p className="text-sm text-gray-500 mb-6">Create new admin users and set their section access.</p>

            {adminsLoading ? (
              <p className="text-sm text-gray-500">Loading admins…</p>
            ) : admins.length > 0 ? (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Existing admin users</h4>
                <p className="text-xs text-gray-500 mb-3">Passwords are not shown for security. Use <strong>Reset password</strong> to set or change an admin&apos;s login password.</p>
                <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                  <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <div className="col-span-4">User</div>
                    <div className="col-span-2">Role</div>
                    <div className="col-span-4">Section access</div>
                    <div className="col-span-2">Actions</div>
                  </div>
                  {admins.map((a) => (
                    <div
                      key={a.id}
                      className="grid grid-cols-12 gap-2 px-4 py-3 border-t border-gray-100 bg-white hover:bg-gray-50/50 text-sm"
                    >
                      <div className="col-span-4">
                        <span className="font-medium text-gray-800">{a.username}</span>
                        {a.name && <span className="block text-xs text-gray-500">{a.name}</span>}
                      </div>
                      <div className="col-span-2 flex items-center">
                        {a.isSuperAdmin ? (
                          <span className="px-1.5 py-0.5 rounded bg-primary-navy/10 text-primary-navy font-medium text-xs">
                            Super admin
                          </span>
                        ) : (
                          <span className="text-gray-600">Admin</span>
                        )}
                      </div>
                      <div className="col-span-4 text-gray-600">
                        {a.isSuperAdmin ? (
                          <span className="text-gray-500">All sections</span>
                        ) : (Array.isArray(a.sectionAccess) && a.sectionAccess.length > 0) ? (
                          <span className="text-xs">{getSectionLabels(a.sectionAccess).join(', ')}</span>
                        ) : (
                          <span className="text-gray-400">No sections</span>
                        )}
                      </div>
                      <div className="col-span-2 flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setResetPasswordModal(a)}
                          className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium"
                        >
                          Reset password
                        </button>
                        <button
                          type="button"
                          onClick={() => setRemoveModal(a)}
                          disabled={String(a.id) === String(user?.id)}
                          title={String(a.id) === String(user?.id) ? 'You cannot remove your own account.' : undefined}
                          className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {removeModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" role="dialog" aria-modal="true" aria-labelledby="remove-admin-title">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                  <h3 id="remove-admin-title" className="text-lg font-semibold text-gray-800 mb-2">Remove admin</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Are you sure you want to remove <strong>{removeModal.username}</strong>? This cannot be undone.
                  </p>
                  {removeError && (
                    <p className="text-sm text-red-600 mb-4" role="alert">{removeError}</p>
                  )}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setRemoveModal(null); setRemoveError(''); }}
                      disabled={removing}
                      className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmRemove}
                      disabled={removing}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium disabled:opacity-50"
                    >
                      {removing ? 'Removing…' : 'Remove'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {resetPasswordModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" role="dialog" aria-modal="true" aria-labelledby="reset-password-title">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                  <h3 id="reset-password-title" className="text-lg font-semibold text-gray-800 mb-2">Reset password</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Set a new password for <strong>{resetPasswordModal.username}</strong>. They will use this to log in.
                  </p>
                  <p className="text-xs text-gray-500 mb-2">Passwords are stored securely and cannot be viewed. Use this to set or reset their password.</p>
                  <div className="space-y-3 mb-4">
                    <div>
                      <label htmlFor="reset-password-new" className="block text-sm font-medium text-gray-700 mb-1">New password (min 6 characters) *</label>
                      <input
                        id="reset-password-new"
                        type="password"
                        value={resetPasswordValue}
                        onChange={(e) => setResetPasswordValue(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-primary-navy outline-none"
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                    </div>
                    <div>
                      <label htmlFor="reset-password-confirm" className="block text-sm font-medium text-gray-700 mb-1">Confirm new password *</label>
                      <input
                        id="reset-password-confirm"
                        type="password"
                        value={resetPasswordConfirm}
                        onChange={(e) => setResetPasswordConfirm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-primary-navy outline-none"
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  {resetPasswordError && (
                    <p className="text-sm text-red-600 mb-4" role="alert">{resetPasswordError}</p>
                  )}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setResetPasswordModal(null); setResetPasswordValue(''); setResetPasswordConfirm(''); setResetPasswordError(''); }}
                      disabled={resetPasswordSubmitting}
                      className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmResetPassword}
                      disabled={resetPasswordSubmitting}
                      className="px-4 py-2 rounded-lg bg-primary-navy text-white hover:bg-primary-navy/90 font-medium disabled:opacity-50"
                    >
                      {resetPasswordSubmitting ? 'Updating…' : 'Update password'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Create admin</h4>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Account details</p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="new-admin-username" className="block text-sm font-medium text-gray-700 mb-1">
                          Username *
                        </label>
                        <input
                          id="new-admin-username"
                          type="text"
                          value={form.username}
                          onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-primary-navy outline-none"
                          placeholder="e.g. editor"
                          autoComplete="username"
                        />
                      </div>
                      <div>
                        <label htmlFor="new-admin-password" className="block text-sm font-medium text-gray-700 mb-1">
                          Password * (min 6 characters)
                        </label>
                        <div className="relative">
                          <input
                            id="new-admin-password"
                            type={showPassword ? 'text' : 'password'}
                            value={form.password}
                            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                            className="w-full px-3 py-2.5 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-primary-navy outline-none"
                            placeholder="••••••••"
                            autoComplete="new-password"
                            aria-describedby="new-admin-password-hint"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600 hover:text-gray-800 py-1 px-2 rounded"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        <p id="new-admin-password-hint" className="mt-1 text-xs text-gray-500">
                          Minimum 6 characters.
                        </p>
                      </div>
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
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-primary-navy outline-none"
                        placeholder="Display name"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Role</p>
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
                </div>

                {!form.isSuperAdmin && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Permissions</p>
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-sm font-medium text-gray-700">View section access</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setForm((p) => ({ ...p, sectionAccess: SECTION_OPTIONS.map((o) => o.sectionKey) }))}
                            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium"
                          >
                            Select all
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm((p) => ({ ...p, sectionAccess: [] }))}
                            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium"
                          >
                            Clear all
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  </div>
                )}

                {submitStatus.message && (
                  <p
                    className={`text-sm ${submitStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
                    role="alert"
                  >
                    {submitStatus.message}
                  </p>
                )}
                <div className="border-t border-gray-200 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2.5 bg-primary-navy text-white rounded-lg font-medium hover:bg-primary-navy/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Creating…' : 'Create admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
