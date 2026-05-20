import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { createAdmin, listAdmins, deleteAdmin, resetAdminPassword, changeMyPassword, getOsviSetting, setOsviSetting } from '../../utils/adminApi';
import ManageAdminsSection from '../../components/Admin/ManageAdminsSection';

const EMPTY_FORM = {
  username: '',
  password: '',
  name: '',
  isSuperAdmin: false,
  sectionAccess: [],
};

export default function Settings() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitStatus, setSubmitStatus] = useState({ type: null, message: '' });
  const [permissionsError, setPermissionsError] = useState('');
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

  const [osviEnabled, setOsviEnabled] = useState(true);
  const [osviLoading, setOsviLoading] = useState(true);
  const [osviToggling, setOsviToggling] = useState(false);
  const [osviStatus, setOsviStatus] = useState({ type: null, message: '' });

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

  useEffect(() => {
    let cancelled = false;
    setOsviLoading(true);
    getOsviSetting()
      .then((res) => {
        if (cancelled) return;
        if (res.success) setOsviEnabled(res.data?.osviEnabled !== false);
      })
      .finally(() => { if (!cancelled) setOsviLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleOsviToggle = async () => {
    if (!isSuperAdmin || osviToggling) return;
    const next = !osviEnabled;
    setOsviToggling(true);
    setOsviStatus({ type: null, message: '' });
    const res = await setOsviSetting(next);
    setOsviToggling(false);
    if (res.success) {
      setOsviEnabled(res.data?.osviEnabled !== false);
      setOsviStatus({
        type: 'success',
        message: res.data?.osviEnabled ? 'OSVI calls enabled.' : 'OSVI calls disabled.',
      });
    } else {
      setOsviStatus({ type: 'error', message: res.message || 'Failed to update setting.' });
    }
  };

  const handleSectionToggle = (sectionKey) => {
    setPermissionsError('');
    setForm((prev) => ({
      ...prev,
      sectionAccess: prev.sectionAccess.includes(sectionKey)
        ? prev.sectionAccess.filter((k) => k !== sectionKey)
        : [...prev.sectionAccess, sectionKey],
    }));
  };

  const handleSuperAdminChange = (checked) => {
    setPermissionsError('');
    setForm((prev) => ({
      ...prev,
      isSuperAdmin: checked,
      sectionAccess: checked ? [] : prev.sectionAccess,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ type: null, message: '' });
    setPermissionsError('');
    if (!form.username.trim()) {
      setSubmitStatus({ type: 'error', message: 'Username is required.' });
      return;
    }
    if (!form.password || form.password.length < 6) {
      setSubmitStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }
    if (!form.isSuperAdmin && form.sectionAccess.length === 0) {
      setPermissionsError('Select at least one section for a non–super admin.');
      return;
    }
    setSubmitting(true);
    const payload = {
      username: form.username.trim(),
      password: form.password,
      name: form.name.trim() || undefined,
      isSuperAdmin: form.isSuperAdmin,
    };
    if (!form.isSuperAdmin) {
      payload.sectionAccess = form.sectionAccess;
    }
    const result = await createAdmin(payload);
    setSubmitting(false);
    if (result.success) {
      setSubmitStatus({ type: 'success', message: 'Admin created successfully.' });
      setForm({ ...EMPTY_FORM });
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
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Feature Toggles</h3>
        <p className="text-sm text-gray-500 mb-5">Control live features for the public-facing site. Only super admins can change these.</p>
        <div className="flex items-center justify-between gap-4 py-3 border-t border-gray-100">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800">OSVI Outbound Calls <span className="text-gray-400 font-normal">(Apply section)</span></p>
            <p className="text-xs text-gray-500 mt-0.5">When enabled, an AI voice call is triggered 10 minutes after OTP if the applicant does not complete slot booking.</p>
            {osviStatus.message && (
              <p className={`text-xs mt-1 ${osviStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`} role="alert">
                {osviStatus.message}
              </p>
            )}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={osviEnabled}
            disabled={!isSuperAdmin || osviLoading || osviToggling}
            onClick={handleOsviToggle}
            title={!isSuperAdmin ? 'Only super admins can change this' : undefined}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-navy focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${osviEnabled ? 'bg-primary-navy' : 'bg-gray-200'}`}
          >
            <span className="sr-only">{osviEnabled ? 'Disable OSVI calls' : 'Enable OSVI calls'}</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${osviEnabled ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>
      </div>

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

      {!isSuperAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 mb-6">
          <p className="font-medium mb-1">Only super admins can create and manage other admins.</p>
          <p className="mt-2 text-amber-700">
            If you should have access, log out (sidebar bottom) and log in again to refresh your permissions. If you use a self-hosted backend, run <code className="px-1 py-0.5 bg-amber-100 rounded text-xs">node scripts/migrateExistingAdminsToSuperAdmin.js</code> from the backend folder first so existing admins become super admins.
          </p>
        </div>
      )}

      {isSuperAdmin && (
        <ManageAdminsSection
          admins={admins}
          adminsLoading={adminsLoading}
          currentUserId={user?.id}
          form={form}
          setForm={setForm}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          submitStatus={submitStatus}
          submitting={submitting}
          permissionsError={permissionsError}
          onSectionToggle={handleSectionToggle}
          onSuperAdminChange={handleSuperAdminChange}
          onSubmit={handleSubmit}
          removeModal={removeModal}
          setRemoveModal={(a) => {
            setRemoveModal(a);
            if (!a) setRemoveError('');
          }}
          removing={removing}
          removeError={removeError}
          onConfirmRemove={handleConfirmRemove}
          resetPasswordModal={resetPasswordModal}
          setResetPasswordModal={(modal) => {
            setResetPasswordModal(modal);
            if (!modal) {
              setResetPasswordValue('');
              setResetPasswordConfirm('');
              setResetPasswordError('');
            }
          }}
          resetPasswordValue={resetPasswordValue}
          setResetPasswordValue={setResetPasswordValue}
          resetPasswordConfirm={resetPasswordConfirm}
          setResetPasswordConfirm={setResetPasswordConfirm}
          resetPasswordError={resetPasswordError}
          resetPasswordSubmitting={resetPasswordSubmitting}
          onConfirmResetPassword={handleConfirmResetPassword}
        />
      )}
    </div>
  );
}
