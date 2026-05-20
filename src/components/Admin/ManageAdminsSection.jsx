import { useState } from 'react';
import {
  FiUsers,
  FiEye,
  FiEyeOff,
  FiKey,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
  FiShield,
  FiEdit2,
} from 'react-icons/fi';
import { updateAdmin } from '../../utils/adminApi';
import {
  ADMIN_SECTION_OPTIONS,
  ADMIN_SECTION_GROUPS,
  ALL_SECTION_KEYS,
  getSectionLabels,
} from '../../constants/adminSectionAccess';

const INPUT_CLASS =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-primary-navy outline-none transition';
const INPUT_ERROR_CLASS = `${INPUT_CLASS} border-red-400 ring-red-100`;

const optionLabelByKey = Object.fromEntries(
  ADMIN_SECTION_OPTIONS.map((o) => [o.sectionKey, o.label])
);

function getInitials(username, name) {
  const src = (name || username || 'A').trim();
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

function SectionAccessChips({ sectionAccess, isSuperAdmin }) {
  if (isSuperAdmin) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
        All sections
      </span>
    );
  }
  const labels = getSectionLabels(sectionAccess);
  if (labels.length === 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
        No sections
      </span>
    );
  }
  const visible = labels.slice(0, 3);
  const rest = labels.length - visible.length;
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((label) => (
        <span
          key={label}
          className="inline-flex items-center rounded-full bg-primary-navy/5 border border-primary-navy/10 px-2 py-0.5 text-xs text-gray-700"
        >
          {label}
        </span>
      ))}
      {rest > 0 && (
        <span
          className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
          title={labels.slice(3).join(', ')}
        >
          +{rest} more
        </span>
      )}
    </div>
  );
}

function TeamTableSkeleton() {
  return (
    <div className="divide-y divide-gray-100">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4 px-4 py-4 animate-pulse">
          <div className="h-10 w-10 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-48 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function AlertBanner({ type, message }) {
  if (!message) return null;
  const isSuccess = type === 'success';
  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${
        isSuccess
          ? 'border-green-200 bg-green-50 text-green-800'
          : 'border-red-200 bg-red-50 text-red-800'
      }`}
    >
      {isSuccess ? (
        <FiCheckCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
      ) : (
        <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
      )}
      <span>{message}</span>
    </div>
  );
}

function AdminModal({ title, children, onClose, disabled, footer, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className={`bg-white rounded-2xl shadow-xl w-full overflow-hidden border border-gray-200 flex flex-col max-h-[90vh] ${
          wide ? 'max-w-2xl' : 'max-w-md'
        }`}
      >
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="px-6 py-4 overflow-y-auto flex-1 min-h-0">{children}</div>
        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={disabled}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          {footer}
        </div>
      </div>
    </div>
  );
}

export default function ManageAdminsSection({
  admins,
  adminsLoading,
  currentUserId,
  form,
  setForm,
  showPassword,
  setShowPassword,
  submitStatus,
  submitting,
  permissionsError,
  onSectionToggle,
  onSuperAdminChange,
  onSubmit,
  removeModal,
  setRemoveModal,
  removing,
  removeError,
  onConfirmRemove,
  resetPasswordModal,
  setResetPasswordModal,
  resetPasswordValue,
  setResetPasswordValue,
  resetPasswordConfirm,
  setResetPasswordConfirm,
  resetPasswordError,
  resetPasswordSubmitting,
  onConfirmResetPassword,
  onAdminsUpdated,
}) {
  const selectedCount = form.sectionAccess.length;
  const totalCount = ALL_SECTION_KEYS.length;
  const [expandedAccessId, setExpandedAccessId] = useState(null);
  const [editAccessModal, setEditAccessModal] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    isSuperAdmin: false,
    sectionAccess: [],
  });
  const [editPermissionsError, setEditPermissionsError] = useState('');
  const [editSaveError, setEditSaveError] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const openEditAccess = (admin) => {
    setEditAccessModal(admin);
    setEditForm({
      name: admin.name || '',
      isSuperAdmin: !!admin.isSuperAdmin,
      sectionAccess: Array.isArray(admin.sectionAccess) ? [...admin.sectionAccess] : [],
    });
    setEditPermissionsError('');
    setEditSaveError('');
  };

  const handleEditSectionToggle = (sectionKey) => {
    setEditPermissionsError('');
    setEditForm((prev) => ({
      ...prev,
      sectionAccess: prev.sectionAccess.includes(sectionKey)
        ? prev.sectionAccess.filter((k) => k !== sectionKey)
        : [...prev.sectionAccess, sectionKey],
    }));
  };

  const handleEditSuperAdminChange = (checked) => {
    setEditPermissionsError('');
    setEditForm((prev) => ({
      ...prev,
      isSuperAdmin: checked,
      sectionAccess: checked ? [] : prev.sectionAccess,
    }));
  };

  const handleSaveEditAccess = async () => {
    if (!editAccessModal) return;
    setEditSaveError('');
    setEditPermissionsError('');
    if (!editForm.isSuperAdmin && editForm.sectionAccess.length === 0) {
      setEditPermissionsError('Select at least one section for a non–super admin.');
      return;
    }
    const id = editAccessModal.id != null ? String(editAccessModal.id) : '';
    if (!id) {
      setEditSaveError('Invalid admin.');
      return;
    }
    setEditSaving(true);
    const payload = {
      name: editForm.name.trim(),
      isSuperAdmin: editForm.isSuperAdmin,
    };
    if (!editForm.isSuperAdmin) {
      payload.sectionAccess = editForm.sectionAccess;
    }
    const result = await updateAdmin(id, payload);
    setEditSaving(false);
    if (result.success) {
      setEditAccessModal(null);
      onAdminsUpdated?.();
    } else {
      setEditSaveError(result.message || 'Failed to update access.');
    }
  };

  const editSelectedCount = editForm.sectionAccess.length;
  const editIsSelf = editAccessModal && String(editAccessModal.id) === String(currentUserId);

  const usernameInvalid = submitStatus.type === 'error' && submitStatus.message?.includes('Username');
  const passwordInvalid =
    submitStatus.type === 'error' && submitStatus.message?.includes('Password');

  return (
    <div className="max-w-5xl mx-auto mb-6">
      <details className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/80 text-sm text-blue-900 open:shadow-sm">
        <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-blue-900 [&::-webkit-details-marker]:hidden flex items-center gap-2">
          <FiShield className="w-4 h-4 shrink-0" aria-hidden />
          Setup help
          <span className="ml-auto text-xs font-normal text-blue-700">Dev credentials & migration</span>
        </summary>
        <div className="px-4 pb-4 pt-0 space-y-2 border-t border-blue-200/60 text-blue-800">
          <p>
            <strong>Development:</strong> username{' '}
            <code className="px-1.5 py-0.5 bg-blue-100 rounded text-xs">admin</code>, password{' '}
            <code className="px-1.5 py-0.5 bg-blue-100 rounded text-xs">admin123</code>.
          </p>
          <p>
            <strong>Production:</strong> run{' '}
            <code className="px-1.5 py-0.5 bg-blue-100 rounded text-xs">
              node scripts/migrateExistingAdminsToSuperAdmin.js
            </code>{' '}
            from the backend folder for existing admins.
          </p>
        </div>
      </details>

      <header className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Manage admins</h3>
            <p className="text-sm text-gray-500 mt-1">
              Create team members and control which admin sections they can open.
            </p>
          </div>
          {!adminsLoading && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              <FiUsers className="w-3.5 h-3.5" aria-hidden />
              {admins.length} {admins.length === 1 ? 'member' : 'members'}
            </span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Team */}
        <section className="lg:col-span-7 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-[320px]">
          <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/80">
            <h4 className="text-sm font-semibold text-gray-900">Team</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Passwords are hidden. Use <strong>Edit access</strong> to change sections, or reset password for login.
            </p>
          </div>

          {adminsLoading ? (
            <TeamTableSkeleton />
          ) : admins.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <FiUsers className="w-6 h-6 text-gray-400" aria-hidden />
              </div>
              <p className="text-sm font-medium text-gray-800">No admins yet</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                Create your first admin using the form on the right.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full min-w-[600px] text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Access</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {admins.map((a) => {
                    const isSelf = String(a.id) === String(currentUserId);
                    const showAllChips = expandedAccessId === a.id;
                    const labels = a.isSuperAdmin ? [] : getSectionLabels(a.sectionAccess);
                    return (
                      <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-navy/10 text-sm font-semibold text-primary-navy">
                              {getInitials(a.username, a.name)}
                            </span>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">{a.username}</p>
                              {a.name && (
                                <p className="text-xs text-gray-500 truncate">{a.name}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          {a.isSuperAdmin ? (
                            <span className="inline-flex items-center rounded-full bg-primary-navy/10 px-2.5 py-0.5 text-xs font-semibold text-primary-navy">
                              Super admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                              Admin
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top max-w-[200px]">
                          {showAllChips && labels.length > 3 ? (
                            <div className="flex flex-wrap gap-1">
                              {labels.map((label) => (
                                <span
                                  key={label}
                                  className="inline-flex rounded-full bg-primary-navy/5 border border-primary-navy/10 px-2 py-0.5 text-xs text-gray-700"
                                >
                                  {label}
                                </span>
                              ))}
                              <button
                                type="button"
                                onClick={() => setExpandedAccessId(null)}
                                className="text-xs text-primary-navy font-medium hover:underline"
                              >
                                Show less
                              </button>
                            </div>
                          ) : (
                            <div>
                              <SectionAccessChips
                                sectionAccess={a.sectionAccess}
                                isSuperAdmin={a.isSuperAdmin}
                              />
                              {!a.isSuperAdmin && labels.length > 3 && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedAccessId(a.id)}
                                  className="mt-1 text-xs text-primary-navy font-medium hover:underline"
                                >
                                  Show all
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex justify-end gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => openEditAccess(a)}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-primary-navy/20 bg-primary-navy/5 text-primary-navy hover:bg-primary-navy/10 font-medium transition"
                            >
                              <FiEdit2 className="w-3.5 h-3.5" aria-hidden />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setResetPasswordModal(a)}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-medium transition"
                            >
                              <FiKey className="w-3.5 h-3.5" aria-hidden />
                              Reset
                            </button>
                            <button
                              type="button"
                              onClick={() => setRemoveModal(a)}
                              disabled={isSelf}
                              title={isSelf ? 'You cannot remove your own account.' : undefined}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" aria-hidden />
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Add admin */}
        <section className="lg:col-span-5 rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-white to-primary-blue-50/30">
            <h4 className="text-sm font-semibold text-gray-900">Add admin</h4>
            <p className="text-xs text-gray-500 mt-0.5">New credentials and section permissions</p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="px-5 py-4 space-y-5 flex-1 overflow-y-auto max-h-[70vh] lg:max-h-none">
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Account
                </p>
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
                      className={usernameInvalid ? INPUT_ERROR_CLASS : INPUT_CLASS}
                      placeholder="e.g. editor"
                      autoComplete="username"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-admin-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        id="new-admin-password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                        className={`${passwordInvalid ? INPUT_ERROR_CLASS : INPUT_CLASS} pr-10`}
                        placeholder="Min 6 characters"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-800 rounded"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <FiEyeOff className="w-4 h-4" />
                        ) : (
                          <FiEye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="new-admin-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Display name <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="new-admin-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className={INPUT_CLASS}
                    placeholder="Shown in the team list"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Role
                </p>
                <label
                  className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                    form.isSuperAdmin
                      ? 'border-primary-navy/40 bg-primary-navy/5 ring-2 ring-primary-navy/20'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.isSuperAdmin}
                    onChange={(e) => onSuperAdminChange(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300 text-primary-navy focus:ring-primary-navy"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-gray-900">Super admin</span>
                    <span className="block text-xs text-gray-500 mt-0.5">
                      Full access to all sections and ability to manage other admins.
                    </span>
                  </span>
                </label>
              </div>

              {form.isSuperAdmin ? (
                <p className="text-sm text-gray-600 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                  This user will have access to all admin sections.
                </p>
              ) : (
                <div
                  className={`rounded-xl border p-4 ${
                    permissionsError ? 'border-red-300 bg-red-50/30' : 'border-gray-200 bg-gray-50/50'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Section access</p>
                      <p className="text-xs text-gray-500">
                        {selectedCount} of {totalCount} selected
                      </p>
                    </div>
                    <div className="flex gap-3 text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, sectionAccess: [...ALL_SECTION_KEYS] }))}
                        className="text-primary-navy hover:underline"
                      >
                        Select all
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, sectionAccess: [] }))}
                        className="text-gray-600 hover:underline"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                    {ADMIN_SECTION_GROUPS.map((group) => (
                      <div key={group.id}>
                        <p className="text-xs font-semibold text-gray-500 mb-2">{group.label}</p>
                        <div className="grid grid-cols-1 gap-1.5">
                          {group.sectionKeys.map((sectionKey) => {
                            const label = optionLabelByKey[sectionKey] || sectionKey;
                            const checked = form.sectionAccess.includes(sectionKey);
                            return (
                              <label
                                key={sectionKey}
                                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 cursor-pointer transition ${
                                  checked ? 'bg-white shadow-sm border border-primary-navy/10' : 'hover:bg-white/80'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => onSectionToggle(sectionKey)}
                                  className="rounded border-gray-300 text-primary-navy focus:ring-primary-navy"
                                />
                                <span className="text-sm text-gray-700">{label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  {permissionsError && (
                    <p className="mt-3 text-xs text-red-600 font-medium" role="alert">
                      {permissionsError}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 px-5 py-4 border-t border-gray-100 bg-white/95 backdrop-blur-sm space-y-3 rounded-b-2xl">
              <AlertBanner type={submitStatus.type} message={submitStatus.message} />
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2.5 bg-primary-navy text-white rounded-lg font-semibold text-sm hover:bg-primary-navy/90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
              >
                {submitting ? 'Creating…' : 'Create admin'}
              </button>
            </div>
          </form>
        </section>
      </div>

      {removeModal && (
        <AdminModal
          title="Remove admin"
          onClose={() => setRemoveModal(null)}
          disabled={removing}
          footer={
            <button
              type="button"
              onClick={onConfirmRemove}
              disabled={removing}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium text-sm disabled:opacity-50"
            >
              {removing ? 'Removing…' : 'Remove'}
            </button>
          }
        >
          <p className="text-sm text-gray-600">
            Remove <strong className="text-gray-900">{removeModal.username}</strong>? This cannot be
            undone.
          </p>
          {removeError && (
            <p className="text-sm text-red-600 mt-3" role="alert">
              {removeError}
            </p>
          )}
        </AdminModal>
      )}

      {editAccessModal && (
        <AdminModal
          wide
          title="Edit access"
          onClose={() => !editSaving && setEditAccessModal(null)}
          disabled={editSaving}
          footer={
            <button
              type="button"
              onClick={handleSaveEditAccess}
              disabled={editSaving}
              className="px-4 py-2 rounded-lg bg-primary-navy text-white hover:bg-primary-navy/90 font-medium text-sm disabled:opacity-50"
            >
              {editSaving ? 'Saving…' : 'Save changes'}
            </button>
          }
        >
          <p className="text-sm text-gray-600 mb-4">
            Update role and sections for <strong className="text-gray-900">{editAccessModal.username}</strong>.
            They may need to log out and back in for the sidebar to refresh.
          </p>
          <div className="mb-4">
            <label htmlFor="edit-admin-name" className="block text-sm font-medium text-gray-700 mb-1">
              Display name
            </label>
            <input
              id="edit-admin-name"
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
              className={INPUT_CLASS}
              placeholder="Optional"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Role</p>
            <label
              className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                editIsSelf ? 'opacity-60 cursor-not-allowed' : ''
              } ${
                editForm.isSuperAdmin
                  ? 'border-primary-navy/40 bg-primary-navy/5 ring-2 ring-primary-navy/20'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={editForm.isSuperAdmin}
                disabled={editIsSelf}
                onChange={(e) => handleEditSuperAdminChange(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-primary-navy focus:ring-primary-navy disabled:cursor-not-allowed"
              />
              <span>
                <span className="block text-sm font-semibold text-gray-900">Super admin</span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  Full access to all sections and ability to manage other admins.
                </span>
                {editIsSelf && (
                  <span className="block text-xs text-amber-700 mt-1">
                    You cannot remove your own super admin role here.
                  </span>
                )}
              </span>
            </label>
          </div>
          {editForm.isSuperAdmin ? (
            <p className="text-sm text-gray-600 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 mt-4">
              This user will have access to all admin sections.
            </p>
          ) : (
            <div
              className={`rounded-xl border p-4 mt-4 ${
                editPermissionsError ? 'border-red-300 bg-red-50/30' : 'border-gray-200 bg-gray-50/50'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Section access</p>
                  <p className="text-xs text-gray-500">
                    {editSelectedCount} of {totalCount} selected
                  </p>
                </div>
                <div className="flex gap-3 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setEditForm((p) => ({ ...p, sectionAccess: [...ALL_SECTION_KEYS] }))}
                    className="text-primary-navy hover:underline"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm((p) => ({ ...p, sectionAccess: [] }))}
                    className="text-gray-600 hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              </div>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {ADMIN_SECTION_GROUPS.map((group) => (
                  <div key={group.id}>
                    <p className="text-xs font-semibold text-gray-500 mb-2">{group.label}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {group.sectionKeys.map((sectionKey) => {
                        const label = optionLabelByKey[sectionKey] || sectionKey;
                        const checked = editForm.sectionAccess.includes(sectionKey);
                        return (
                          <label
                            key={sectionKey}
                            className={`flex items-center gap-2 rounded-lg px-2.5 py-2 cursor-pointer transition ${
                              checked ? 'bg-white shadow-sm border border-primary-navy/10' : 'hover:bg-white/80'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleEditSectionToggle(sectionKey)}
                              className="rounded border-gray-300 text-primary-navy focus:ring-primary-navy"
                            />
                            <span className="text-sm text-gray-700">{label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {editPermissionsError && (
                <p className="mt-3 text-xs text-red-600 font-medium" role="alert">
                  {editPermissionsError}
                </p>
              )}
            </div>
          )}
          {editSaveError && (
            <p className="text-sm text-red-600 mt-3" role="alert">
              {editSaveError}
            </p>
          )}
        </AdminModal>
      )}

      {resetPasswordModal && (
        <AdminModal
          title="Reset password"
          onClose={() => setResetPasswordModal(null)}
          disabled={resetPasswordSubmitting}
          footer={
            <button
              type="button"
              onClick={onConfirmResetPassword}
              disabled={resetPasswordSubmitting}
              className="px-4 py-2 rounded-lg bg-primary-navy text-white hover:bg-primary-navy/90 font-medium text-sm disabled:opacity-50"
            >
              {resetPasswordSubmitting ? 'Updating…' : 'Update password'}
            </button>
          }
        >
          <p className="text-sm text-gray-600 mb-4">
            Set a new password for <strong className="text-gray-900">{resetPasswordModal.username}</strong>.
          </p>
          <div className="space-y-3">
            <div>
              <label htmlFor="reset-password-new" className="block text-sm font-medium text-gray-700 mb-1">
                New password *
              </label>
              <input
                id="reset-password-new"
                type="password"
                value={resetPasswordValue}
                onChange={(e) => setResetPasswordValue(e.target.value)}
                className={INPUT_CLASS}
                placeholder="Min 6 characters"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="reset-password-confirm" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password *
              </label>
              <input
                id="reset-password-confirm"
                type="password"
                value={resetPasswordConfirm}
                onChange={(e) => setResetPasswordConfirm(e.target.value)}
                className={INPUT_CLASS}
                autoComplete="new-password"
              />
            </div>
          </div>
          {resetPasswordError && (
            <p className="text-sm text-red-600 mt-3" role="alert">
              {resetPasswordError}
            </p>
          )}
        </AdminModal>
      )}
    </div>
  );
}
