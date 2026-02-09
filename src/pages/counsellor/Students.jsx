import { useState, useEffect, useCallback } from 'react';
import {
  FiSearch,
  FiPlus,
  FiFilter,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiDownload,
  FiUsers,
} from 'react-icons/fi';
import {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  restoreStudent,
  bulkUpdateStatus,
  bulkDeleteStudents,
  exportStudents,
} from '../../utils/counsellorApi';
import SlideOverPanel from '../../components/Counsellor/SlideOverPanel';
import ConfirmDialog from '../../components/Counsellor/ConfirmDialog';
import FilterPanel from '../../components/Counsellor/FilterPanel';
import TableSkeleton from '../../components/UI/TableSkeleton';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on-hold', label: 'On hold' },
];

const LIMIT_OPTIONS = [10, 20, 50];

function StatusPill({ status }) {
  const styles = {
    active: 'bg-emerald-50 text-emerald-700',
    inactive: 'bg-gray-100 text-gray-600',
    'on-hold': 'bg-amber-50 text-amber-700',
  };
  const label = status === 'on-hold' ? 'On hold' : status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
}

// Validation helpers: return error string or null
function validateFullName(value) {
  const s = (value || '').trim();
  if (!s) return 'Name is required';
  if (s.length < 2) return 'Name must be at least 2 characters';
  if (s.length > 200) return 'Name must be at most 200 characters';
  return null;
}
function validatePhone(value) {
  const s = (value || '').trim();
  if (!s) return 'Phone is required';
  const digits = s.replace(/\D/g, '');
  if (digits.length !== 10) return 'Enter a valid 10-digit phone number';
  return null;
}
function validateCourse(value) {
  const s = (value || '').trim();
  if (!s) return 'Course is required';
  return null;
}
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validateEmail(value) {
  const s = (value || '').trim();
  if (!s) return null;
  if (!EMAIL_RE.test(s)) return 'Enter a valid email address';
  return null;
}

function StudentForm({ initial, onSubmit, onCancel, submitLabel, error, submitting }) {
  const [fullName, setFullName] = useState(initial?.fullName ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [course, setCourse] = useState(initial?.course ?? '');
  const [status, setStatus] = useState(initial?.status ?? 'active');
  const [joinedAt, setJoinedAt] = useState(
    initial?.joinedAt ? new Date(initial.joinedAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [touched, setTouched] = useState({ fullName: false, phone: false, course: false, email: false });
  const [errors, setErrors] = useState({ fullName: null, phone: null, course: null, email: null });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const setTouchedField = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };
  const validateAndSet = (field, value) => {
    let err = null;
    if (field === 'fullName') err = validateFullName(value);
    if (field === 'phone') err = validatePhone(value);
    if (field === 'course') err = validateCourse(value);
    if (field === 'email') err = validateEmail(value);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleBlur = (field) => () => {
    setTouchedField(field);
    if (field === 'fullName') validateAndSet('fullName', fullName);
    if (field === 'phone') validateAndSet('phone', phone);
    if (field === 'course') validateAndSet('course', course);
    if (field === 'email') validateAndSet('email', email);
  };

  const handleFullNameChange = (e) => {
    const v = e.target.value;
    setFullName(v);
    if (touched.fullName || formSubmitted) validateAndSet('fullName', v);
  };
  const handlePhoneChange = (e) => {
    const v = e.target.value;
    setPhone(v);
    if (touched.phone || formSubmitted) validateAndSet('phone', v);
  };
  const handleCourseChange = (e) => {
    const v = e.target.value;
    setCourse(v);
    if (touched.course || formSubmitted) validateAndSet('course', v);
  };
  const handleEmailChange = (e) => {
    const v = e.target.value;
    setEmail(v);
    if (touched.email || formSubmitted) validateAndSet('email', v);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    const allTouched = { fullName: true, phone: true, course: true, email: true };
    setTouched(allTouched);
    const errFullName = validateFullName(fullName);
    const errPhone = validatePhone(phone);
    const errCourse = validateCourse(course);
    const errEmail = validateEmail(email);
    const nextErrors = { fullName: errFullName, phone: errPhone, course: errCourse, email: errEmail };
    setErrors(nextErrors);
    if (errFullName || errPhone || errCourse || errEmail) return;
    onSubmit({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      course: course.trim(),
      status,
      joinedAt: joinedAt || undefined,
      notes: notes.trim(),
    });
  };

  const inputBase =
    'w-full px-4 py-3 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-150 border bg-white/80 focus:bg-white';
  const inputNormal =
    'border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/15 shadow-sm';
  const inputError =
    'border-red-400 focus:border-red-500 focus:ring-red-500/15 bg-red-50/30 focus:bg-red-50/50';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div
          className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-800 flex items-start gap-2 shadow-sm"
          role="alert"
        >
          <span className="shrink-0 w-5 h-5 rounded-full bg-red-200/80 flex items-center justify-center text-red-600 text-xs font-bold">
            !
          </span>
          <span>{error}</span>
        </div>
      )}

      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <div
            className="w-1 h-4 rounded-full shrink-0"
            style={{ backgroundColor: '#003366' }}
          />
          <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-widest">
            Required details
          </h3>
        </div>
        <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white/60 p-4 shadow-sm">
          <div>
            <label
              htmlFor="student-fullName"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Full name <span className="text-red-500">*</span>
            </label>
            <input
              id="student-fullName"
              type="text"
              value={fullName}
              onChange={handleFullNameChange}
              onBlur={handleBlur('fullName')}
              className={`${inputBase} ${errors.fullName ? inputError : inputNormal}`}
              placeholder="e.g. Priya Sharma"
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? 'student-fullName-error' : undefined}
            />
            {errors.fullName && (
              <p id="student-fullName-error" className="mt-1.5 text-xs text-red-600 font-medium">
                {errors.fullName}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="student-phone"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              id="student-phone"
              type="text"
              inputMode="tel"
              value={phone}
              onChange={handlePhoneChange}
              onBlur={handleBlur('phone')}
              className={`${inputBase} ${errors.phone ? inputError : inputNormal}`}
              placeholder="10-digit mobile number"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'student-phone-error' : undefined}
            />
            {errors.phone && (
              <p id="student-phone-error" className="mt-1.5 text-xs text-red-600 font-medium">
                {errors.phone}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="student-course"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Course <span className="text-red-500">*</span>
            </label>
            <input
              id="student-course"
              type="text"
              value={course}
              onChange={handleCourseChange}
              onBlur={handleBlur('course')}
              className={`${inputBase} ${errors.course ? inputError : inputNormal}`}
              placeholder="e.g. Engineering, Medical, Commerce"
              aria-invalid={!!errors.course}
              aria-describedby={errors.course ? 'student-course-error' : undefined}
            />
            {errors.course && (
              <p id="student-course-error" className="mt-1.5 text-xs text-red-600 font-medium">
                {errors.course}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-2 -mt-0.5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full shrink-0 bg-slate-300" />
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Optional
          </h3>
        </div>
        <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
          <div>
            <label htmlFor="student-email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <input
              id="student-email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleBlur('email')}
              className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
              placeholder="student@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'student-email-error' : undefined}
            />
            {errors.email && (
              <p id="student-email-error" className="mt-1.5 text-xs text-red-600 font-medium">
                {errors.email}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="student-status" className="block text-sm font-medium text-slate-700 mb-1.5">
                Status
              </label>
              <select
                id="student-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`${inputBase} ${inputNormal} cursor-pointer`}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="student-joinedAt" className="block text-sm font-medium text-slate-700 mb-1.5">
                Joined date
              </label>
              <input
                id="student-joinedAt"
                type="date"
                value={joinedAt}
                onChange={(e) => setJoinedAt(e.target.value)}
                className={`${inputBase} ${inputNormal}`}
              />
            </div>
          </div>
          <div>
            <label htmlFor="student-notes" className="block text-sm font-medium text-slate-700 mb-1.5">
              Notes
            </label>
            <textarea
              id="student-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={`${inputBase} ${inputNormal} resize-none`}
              placeholder="Counselling notes, follow-up reminders…"
            />
          </div>
        </div>
      </section>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 sm:flex-none px-5 py-3 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 sm:flex-none px-5 py-3 text-sm font-semibold text-white rounded-xl bg-[#003366] hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-md shadow-[#003366]/20 hover:shadow-lg hover:shadow-[#003366]/25"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function Students() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [filters, setFilters] = useState({
    course: undefined,
    status: undefined,
    joinedFrom: undefined,
    joinedTo: undefined,
    showDeleted: false,
  });
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [addPanelOpen, setAddPanelOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [rowMenuOpen, setRowMenuOpen] = useState(null); // id or null

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    const params = {
      page,
      limit,
      q: searchDebounced || undefined,
      course: filters.course || undefined,
      status: filters.status || undefined,
      joinedFrom: filters.joinedFrom || undefined,
      joinedTo: filters.joinedTo || undefined,
      deleted: filters.showDeleted ? true : undefined,
    };
    const res = await getStudents(params);
    setLoading(false);
    if (res.success && res.data) {
      setData(res.data.data || []);
      setTotal(res.data.total ?? 0);
    } else {
      setData([]);
      setTotal(0);
    }
  }, [page, limit, searchDebounced, filters]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const activeFilterCount = [filters.course, filters.status, filters.joinedFrom, filters.joinedTo, filters.showDeleted].filter(Boolean).length;

  const handleAddSubmit = async (payload) => {
    setAddError('');
    setAddSubmitting(true);
    const res = await createStudent(payload);
    setAddSubmitting(false);
    if (res.success) {
      setAddPanelOpen(false);
      fetchList();
    } else {
      setAddError(res.message || 'Failed to add student');
    }
  };

  const handleEditSubmit = async (payload) => {
    if (!editStudent?._id) return;
    setEditError('');
    setEditSubmitting(true);
    const res = await updateStudent(editStudent._id, payload);
    setEditSubmitting(false);
    if (res.success) {
      setEditStudent(null);
      fetchList();
    } else {
      setEditError(res.message || 'Failed to update');
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await deleteStudent(deleteTarget._id);
      setDeleteTarget(null);
      setRowMenuOpen(null);
      fetchList();
    }
  };

  const handleBulkDeleteConfirm = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    await bulkDeleteStudents(ids);
    setSelectedIds(new Set());
    setBulkDeleteConfirm(false);
    fetchList();
  };

  const handleBulkStatus = async (status) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    await bulkUpdateStatus(ids, status);
    setSelectedIds(new Set());
    fetchList();
  };

  const handleExport = async () => {
    setExportLoading(true);
    const params = {
      q: searchDebounced || undefined,
      course: filters.course || undefined,
      status: filters.status || undefined,
      joinedFrom: filters.joinedFrom || undefined,
      joinedTo: filters.joinedTo || undefined,
      deleted: filters.showDeleted ? true : undefined,
    };
    await exportStudents(params);
    setExportLoading(false);
  };

  const handleRestore = async (student) => {
    await restoreStudent(student._id);
    setRowMenuOpen(null);
    fetchList();
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.filter((s) => !s.deletedAt).map((s) => s._id)));
    }
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const formatJoined = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return isNaN(date.getTime()) ? '—' : date.toISOString().slice(0, 10);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900" style={{ color: '#003366' }}>
            Student Management
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage student profiles, documents, and status</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={exportLoading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <FiDownload className="w-4 h-4" />
            {exportLoading ? 'Exporting…' : 'Export'}
          </button>
          <button
            type="button"
            onClick={() => setAddPanelOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#003366] text-white text-sm font-medium rounded-lg hover:bg-[#004080] transition-colors"
          >
            <FiPlus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
          />
        </div>
        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterPanelOpen((o) => !o)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
              activeFilterCount > 0
                ? 'bg-[#003366]/5 border-[#003366]/30 text-[#003366]'
                : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <FiFilter className="w-4 h-4" /> Filter
            {activeFilterCount > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-[#003366] text-white text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <FilterPanel
            isOpen={filterPanelOpen}
            onClose={() => setFilterPanelOpen(false)}
            filters={filters}
            onFiltersChange={setFilters}
            onClearAll={() => setFilters({
              course: undefined,
              status: undefined,
              joinedFrom: undefined,
              joinedTo: undefined,
              showDeleted: false,
            })}
          />
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
          <span className="text-sm text-gray-600">
            {selectedIds.size} selected
          </span>
          <select
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5"
            defaultValue=""
            onChange={(e) => {
              const v = e.target.value;
              if (v) handleBulkStatus(v);
              e.target.value = '';
            }}
          >
            <option value="">Bulk status</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setBulkDeleteConfirm(true)}
            className="text-sm text-red-600 hover:underline"
          >
            Bulk delete
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-gray-500 hover:underline ml-auto"
          >
            Clear selection
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">
                  <input
                    type="checkbox"
                    checked={data.length > 0 && selectedIds.size === data.filter((s) => !s.deletedAt).length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-[#003366] focus:ring-[#003366]"
                  />
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="w-12 px-5 py-3" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    <TableSkeleton rows={8} cols={6} />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FiUsers className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500">No students yet</p>
                      <button
                        type="button"
                        onClick={() => setAddPanelOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#003366] text-white text-sm font-medium rounded-lg hover:bg-[#004080]"
                      >
                        <FiPlus className="w-4 h-4" /> Add Student
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((s) => (
                  <tr
                    key={s._id}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${s.deletedAt ? 'opacity-60' : ''}`}
                    onClick={() => {
                      if (s.deletedAt) return;
                      setEditStudent(s);
                      setRowMenuOpen(null);
                    }}
                  >
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      {!s.deletedAt && (
                        <input
                          type="checkbox"
                          checked={selectedIds.has(s._id)}
                          onChange={() => toggleSelect(s._id)}
                          className="rounded border-gray-300 text-[#003366] focus:ring-[#003366]"
                        />
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#003366]/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-[#003366]">
                          {(s.fullName || '?').charAt(0)}
                        </span>
                      </div>
                      {s.fullName}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{s.email || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-700">{s.course}</td>
                    <td className="px-5 py-3.5">
                      <StatusPill status={s.status} />
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{formatJoined(s.joinedAt)}</td>
                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRowMenuOpen(rowMenuOpen === s._id ? null : s._id);
                          }}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                          aria-label="Actions"
                        >
                          <FiMoreVertical className="w-4 h-4" />
                        </button>
                        {rowMenuOpen === s._id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setRowMenuOpen(null)} aria-hidden />
                            <div className="absolute right-0 top-full mt-0.5 py-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[120px]">
                              {!s.deletedAt && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditStudent(s);
                                      setRowMenuOpen(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <FiEdit2 className="w-4 h-4" /> Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeleteTarget(s);
                                      setRowMenuOpen(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <FiTrash2 className="w-4 h-4" /> Delete
                                  </button>
                                </>
                              )}
                              {s.deletedAt && (
                                <button
                                  type="button"
                                  onClick={() => handleRestore(s)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <FiRefreshCw className="w-4 h-4" /> Restore
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && total > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="text-xs border border-gray-200 rounded px-2 py-1"
              >
                {LIMIT_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n} per page</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-2 py-1 text-xs border border-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500">Page {page}</span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={page * limit >= total}
                className="px-2 py-1 text-xs border border-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <SlideOverPanel
        title="Add Student"
        isOpen={addPanelOpen}
        onClose={() => { setAddPanelOpen(false); setAddError(''); }}
      >
        <StudentForm
          onSubmit={handleAddSubmit}
          onCancel={() => { setAddPanelOpen(false); setAddError(''); }}
          submitLabel={addSubmitting ? 'Adding…' : 'Add Student'}
          error={addError}
          submitting={addSubmitting}
        />
      </SlideOverPanel>

      <SlideOverPanel
        title="Edit Student"
        isOpen={!!editStudent}
        onClose={() => { setEditStudent(null); setEditError(''); }}
      >
        {editStudent && (
          <>
            {editStudent.updatedAt && (
              <p className="text-xs text-gray-500 mb-4">
                Last updated {new Date(editStudent.updatedAt).toLocaleString()}
              </p>
            )}
            <StudentForm
              initial={editStudent}
              onSubmit={handleEditSubmit}
              onCancel={() => { setEditStudent(null); setEditError(''); }}
              submitLabel={editSubmitting ? 'Saving…' : 'Save changes'}
              error={editError}
              submitting={editSubmitting}
            />
          </>
        )}
      </SlideOverPanel>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete student"
        message="Are you sure you want to delete this student? You can restore them later from filters."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        isOpen={bulkDeleteConfirm}
        title="Bulk delete"
        message={`Delete ${selectedIds.size} selected student(s)? They can be restored later from filters.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </div>
  );
}
