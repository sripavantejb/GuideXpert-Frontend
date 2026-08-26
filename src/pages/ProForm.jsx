import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { submitProForm } from '../utils/api';
import { INDIA_STATES, PRO_FORM_ROLES } from '../constants/proForm';

const NAME_PATTERN = /^[A-Za-z][A-Za-z .']{0,98}$/;

function validateName(value) {
  const t = typeof value === 'string' ? value.trim() : '';
  if (!t) return 'Required';
  if (t.length < 2) return 'At least 2 characters';
  if (t.length > 100) return 'Maximum 100 characters';
  if (!NAME_PATTERN.test(t)) return 'Use letters, spaces, periods, or apostrophes only';
  return '';
}

function validateContact(value) {
  const d = typeof value === 'string' ? value.replace(/\D/g, '') : '';
  if (!d) return 'Required';
  if (d.length !== 10) return 'Enter 10 digits';
  return '';
}

function validateAlternate(value, contact) {
  const d = typeof value === 'string' ? value.replace(/\D/g, '') : '';
  if (!d) return '';
  if (d.length !== 10) return 'Enter 10 digits';
  const contactDigits = typeof contact === 'string' ? contact.replace(/\D/g, '') : '';
  if (contactDigits && d === contactDigits) return 'Must be different from contact number';
  return '';
}

function validateCity(value) {
  const t = typeof value === 'string' ? value.trim() : '';
  if (!t) return 'Required';
  if (t.length < 2) return 'At least 2 characters';
  if (t.length > 80) return 'Maximum 80 characters';
  return '';
}

function validateState(value) {
  const t = typeof value === 'string' ? value.trim() : '';
  if (!t) return 'Select an option';
  if (!INDIA_STATES.includes(t)) return 'Select an option';
  return '';
}

function validateRole(value) {
  const t = typeof value === 'string' ? value.trim() : '';
  if (!t) return 'Select an option';
  if (!PRO_FORM_ROLES.includes(t)) return 'Select an option';
  return '';
}

function validateCollege(value) {
  const t = typeof value === 'string' ? value.trim() : '';
  if (!t) return 'Required';
  if (t.length < 2) return 'At least 2 characters';
  if (t.length > 150) return 'Maximum 150 characters';
  return '';
}

const inputBase =
  'w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#003366]/25 focus:border-[#003366] outline-none transition text-gray-900 placeholder:text-gray-400';
const inputError = 'border-amber-500 bg-amber-50/30';

const MODAL_SUCCESS = 'success';
const MODAL_ALREADY_SUBMITTED = 'already_submitted';

export default function ProForm() {
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [alternateNumber, setAlternateNumber] = useState('');
  const [cityTown, setCityTown] = useState('');
  const [state, setState] = useState('');
  const [currentlyWorkingAs, setCurrentlyWorkingAs] = useState('');
  const [associatedCollegeName, setAssociatedCollegeName] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState(null);

  const setError = (field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const fieldErrors = useMemo(
    () => ({
      name: validateName(name),
      contactNumber: validateContact(contactNumber),
      alternateNumber: validateAlternate(alternateNumber, contactNumber),
      cityTown: validateCity(cityTown),
      state: validateState(state),
      currentlyWorkingAs: validateRole(currentlyWorkingAs),
      associatedCollegeName: validateCollege(associatedCollegeName),
    }),
    [name, contactNumber, alternateNumber, cityTown, state, currentlyWorkingAs, associatedCollegeName]
  );

  const formValid = !Object.values(fieldErrors).some(Boolean);

  const runValidation = () => {
    setErrors(fieldErrors);
    return formValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!runValidation()) {
      setSubmitError('Complete all required fields to submit.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        contactNumber: contactNumber.replace(/\D/g, ''),
        alternateNumber: alternateNumber.replace(/\D/g, ''),
        cityTown: cityTown.trim(),
        state: state.trim(),
        currentlyWorkingAs: currentlyWorkingAs.trim(),
        associatedCollegeName: associatedCollegeName.trim(),
      };
      const result = await submitProForm(payload);
      const alreadySubmitted =
        result.status === 409 ||
        result.code === 'ALREADY_SUBMITTED' ||
        result.data?.code === 'ALREADY_SUBMITTED';
      if (result.success) {
        setModalType(MODAL_SUCCESS);
        return;
      }
      if (alreadySubmitted) {
        setModalType(MODAL_ALREADY_SUBMITTED);
        return;
      }
      setSubmitError(result.message || 'Unable to submit at the moment. Please try again.');
    } catch {
      setSubmitError('Connection issue. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  const modalConfig = {
    [MODAL_SUCCESS]: {
      title: 'Thank you',
      message: 'Your details have been submitted successfully.',
    },
    [MODAL_ALREADY_SUBMITTED]: {
      title: 'Already submitted',
      message: 'This contact number has already been registered.',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 py-10">
      {modalType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pro-modal-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="h-1 w-full bg-gradient-to-r from-[#003366] to-[#004080]" />
            <div className="p-8 text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${
                  modalType === MODAL_SUCCESS ? 'bg-emerald-100' : 'bg-slate-100'
                }`}
              >
                {modalType === MODAL_SUCCESS ? (
                  <svg className="w-9 h-9 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-9 h-9 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <h2 id="pro-modal-title" className="text-xl font-semibold text-slate-900 mb-2">
                {modalConfig[modalType]?.title}
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">{modalConfig[modalType]?.message}</p>
              <Link
                to="/"
                className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl font-medium text-white bg-[#003366] hover:bg-[#004080] transition-colors"
              >
                Home page
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-slate-200">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#003366] via-[#004080] to-[#003366]" />
        <div className="p-6 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#003366]/10 mb-4">
              <svg className="w-6 h-6 text-[#003366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900" style={{ color: '#003366' }}>
              PRO Registration Form
            </h1>
            <p className="text-slate-600 mt-1.5 text-sm">GuideXpert</p>
            <p className="text-slate-500 text-sm mt-1">Complete all required fields to submit your details.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {submitError && (
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm"
                role="alert"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                {submitError}
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200">
                Contact details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="pro-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Name <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="pro-name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError('name', validateName(e.target.value));
                    }}
                    onBlur={() => setError('name', validateName(name))}
                    placeholder="Full name"
                    className={`${inputBase} ${errors.name ? inputError : 'border-slate-300'}`}
                    disabled={loading}
                    autoComplete="name"
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-amber-700" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="pro-contact" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Contact number <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="tel"
                    id="pro-contact"
                    value={contactNumber}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setContactNumber(v);
                      setError('contactNumber', validateContact(v));
                      if (alternateNumber) setError('alternateNumber', validateAlternate(alternateNumber, v));
                    }}
                    onBlur={() => setError('contactNumber', validateContact(contactNumber))}
                    placeholder="10 digits"
                    className={`${inputBase} ${errors.contactNumber ? inputError : 'border-slate-300'}`}
                    disabled={loading}
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={10}
                  />
                  {errors.contactNumber && (
                    <p className="mt-1.5 text-xs text-amber-700" role="alert">
                      {errors.contactNumber}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="pro-alternate" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Alternate number
                  </label>
                  <input
                    type="tel"
                    id="pro-alternate"
                    value={alternateNumber}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setAlternateNumber(v);
                      setError('alternateNumber', validateAlternate(v, contactNumber));
                    }}
                    onBlur={() => setError('alternateNumber', validateAlternate(alternateNumber, contactNumber))}
                    placeholder="Optional, 10 digits"
                    className={`${inputBase} ${errors.alternateNumber ? inputError : 'border-slate-300'}`}
                    disabled={loading}
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={10}
                  />
                  {errors.alternateNumber && (
                    <p className="mt-1.5 text-xs text-amber-700" role="alert">
                      {errors.alternateNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200">
                Location
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pro-city" className="block text-sm font-medium text-slate-700 mb-1.5">
                    City / town <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="pro-city"
                    value={cityTown}
                    onChange={(e) => {
                      setCityTown(e.target.value);
                      setError('cityTown', validateCity(e.target.value));
                    }}
                    onBlur={() => setError('cityTown', validateCity(cityTown))}
                    placeholder="City or town"
                    className={`${inputBase} ${errors.cityTown ? inputError : 'border-slate-300'}`}
                    disabled={loading}
                    autoComplete="address-level2"
                  />
                  {errors.cityTown && (
                    <p className="mt-1.5 text-xs text-amber-700" role="alert">
                      {errors.cityTown}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="pro-state" className="block text-sm font-medium text-slate-700 mb-1.5">
                    State <span className="text-amber-600">*</span>
                  </label>
                  <select
                    id="pro-state"
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      setError('state', validateState(e.target.value));
                    }}
                    onBlur={() => setError('state', validateState(state))}
                    className={`${inputBase} ${errors.state ? inputError : 'border-slate-300'}`}
                    disabled={loading}
                  >
                    <option value="">Select</option>
                    {INDIA_STATES.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="mt-1.5 text-xs text-amber-700" role="alert">
                      {errors.state}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200">
                Role & college
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pro-role" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Currently working as <span className="text-amber-600">*</span>
                  </label>
                  <select
                    id="pro-role"
                    value={currentlyWorkingAs}
                    onChange={(e) => {
                      setCurrentlyWorkingAs(e.target.value);
                      setError('currentlyWorkingAs', validateRole(e.target.value));
                    }}
                    onBlur={() => setError('currentlyWorkingAs', validateRole(currentlyWorkingAs))}
                    className={`${inputBase} ${errors.currentlyWorkingAs ? inputError : 'border-slate-300'}`}
                    disabled={loading}
                  >
                    <option value="">Select</option>
                    {PRO_FORM_ROLES.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {errors.currentlyWorkingAs && (
                    <p className="mt-1.5 text-xs text-amber-700" role="alert">
                      {errors.currentlyWorkingAs}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="pro-college" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Present associated college name <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="pro-college"
                    value={associatedCollegeName}
                    onChange={(e) => {
                      setAssociatedCollegeName(e.target.value);
                      setError('associatedCollegeName', validateCollege(e.target.value));
                    }}
                    onBlur={() => setError('associatedCollegeName', validateCollege(associatedCollegeName))}
                    placeholder="College name"
                    className={`${inputBase} ${errors.associatedCollegeName ? inputError : 'border-slate-300'}`}
                    disabled={loading}
                  />
                  {errors.associatedCollegeName && (
                    <p className="mt-1.5 text-xs text-amber-700" role="alert">
                      {errors.associatedCollegeName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !formValid}
              className="w-full py-3.5 px-4 text-white font-semibold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              style={{ backgroundColor: '#003366' }}
            >
              {loading ? 'Submitting…' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
