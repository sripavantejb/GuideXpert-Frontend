import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitTrainingFormResponse } from '../utils/api';

function validateName(value) {
  const t = typeof value === 'string' ? value.trim() : '';
  if (!t) return 'Required';
  if (t.length < 2) return 'At least 2 characters';
  if (t.length > 100) return 'Maximum 100 characters';
  return '';
}

function validateMobile(value) {
  const d = typeof value === 'string' ? value.replace(/\D/g, '') : '';
  if (!d) return 'Required';
  if (d.length !== 10) return 'Enter 10 digits';
  return '';
}

function validateEmail(value) {
  const t = typeof value === 'string' ? value.trim() : '';
  if (!t) return 'Required';
  if (!/^\S+@\S+\.\S+$/.test(t)) return 'Enter a valid email';
  return '';
}

function validateOccupation(value) {
  const t = typeof value === 'string' ? value.trim() : '';
  if (!t) return 'Required';
  if (t.length > 200) return 'Maximum 200 characters';
  return '';
}

function validateSessionRating(value) {
  const n = value != null ? Number(value) : NaN;
  if (!Number.isInteger(n) || n < 1 || n > 5) return 'Select a rating from 1 to 5';
  return '';
}

const inputBase =
  'w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#003366]/25 focus:border-[#003366] outline-none transition text-base text-gray-900 placeholder:text-gray-400';
const inputError = 'border-amber-500 bg-amber-50/30';

const MODAL_SUCCESS = 'success';

export default function TrainingForm() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [occupation, setOccupation] = useState('');
  const [sessionRating, setSessionRating] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState(null);

  const setError = (field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const runValidation = () => {
    const e = {
      fullName: validateName(fullName),
      mobileNumber: validateMobile(mobileNumber),
      email: validateEmail(email),
      occupation: validateOccupation(occupation),
      sessionRating: validateSessionRating(sessionRating)
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
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
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.replace(/\D/g, ''),
        email: email.trim().toLowerCase(),
        occupation: occupation.trim(),
        sessionRating: Math.min(5, Math.max(1, Math.floor(Number(sessionRating)))),
        suggestions: suggestions.trim().slice(0, 2000) || undefined
      };
      const result = await submitTrainingFormResponse(payload);
      if (result.success) {
        setModalType(MODAL_SUCCESS);
      } else {
        setSubmitError(result.message || 'Unable to submit. Please try again.');
      }
    } catch {
      setSubmitError('Connection issue. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFullName('');
    setMobileNumber('');
    setEmail('');
    setOccupation('');
    setSessionRating('');
    setSuggestions('');
    setErrors({});
    setSubmitError('');
  };

  const goHome = () => navigate('/');

  const modalConfig = {
    [MODAL_SUCCESS]: {
      icon: (
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <svg className="w-9 h-9 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ),
      title: 'Thank you',
      message: 'Your response has been submitted successfully. Our team will review and get in touch with you shortly.'
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center px-3 py-10 sm:p-4">
      {modalType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="h-1 w-full bg-gradient-to-r from-[#003366] to-[#004080] shrink-0" />
            <div className="p-5 sm:p-8 text-center overflow-y-auto">
              {modalConfig[modalType]?.icon}
              <h2 id="modal-title" className="text-xl font-semibold text-slate-900 mb-2">
                {modalConfig[modalType]?.title}
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {modalConfig[modalType]?.message}
              </p>
              <button
                type="button"
                onClick={goHome}
                className="w-full px-5 py-3 rounded-xl font-medium text-white bg-[#003366] hover:bg-[#004080] transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-slate-200 mx-2 sm:mx-0">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#003366] via-[#004080] to-[#003366]" />
        <div className="p-6 sm:p-10">
          <div className="mb-8 break-words">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#003366]/10">
                <svg className="w-6 h-6 text-[#003366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-center text-slate-900" style={{ color: '#003366' }}>
              GuideXpert - Training Form
            </h1>
            <p className="text-slate-600 mt-2 text-sm text-left leading-relaxed">
              Thank you for your interest in <strong>GuideXpert Training Programs</strong>.
            </p>
            <p className="text-slate-600 text-sm mt-4 text-left leading-relaxed">
              This form is designed to understand your <strong>background, learning goals, and availability</strong>, so we can recommend the most suitable training path for you. The information you provide will help us personalize the training experience and connect you with the right mentors and sessions.
            </p>
            <p className="text-slate-600 text-sm mt-3 text-left leading-relaxed">
              Please ensure all details are <strong>accurate and complete</strong>. Our team will review your responses and get in touch with you shortly with the next steps.
            </p>
            <p className="text-slate-500 text-sm mt-4 flex items-start gap-2 text-left leading-relaxed">
              <span className="text-slate-400 shrink-0 mt-0.5" aria-hidden>📌</span>
              <span>Your information is safe with us and will be used only for training and communication purposes.</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {submitError && (
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm"
                role="alert"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {submitError}
              </div>
            )}

            <div>
              <label htmlFor="tf-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                What is your full name? <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                id="tf-name"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setError('fullName', validateName(e.target.value)); }}
                onBlur={() => setError('fullName', validateName(fullName))}
                placeholder="Your answer"
                className={`${inputBase} ${errors.fullName ? inputError : 'border-slate-300'}`}
                disabled={loading}
                autoComplete="name"
              />
              {errors.fullName && <p className="mt-1.5 text-xs text-amber-700" role="alert">{errors.fullName}</p>}
            </div>

            <div>
              <label htmlFor="tf-mobile" className="block text-sm font-medium text-slate-700 mb-1.5">
                What is your mobile number? <span className="text-amber-600">*</span>
              </label>
              <input
                type="tel"
                id="tf-mobile"
                value={mobileNumber}
                onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); setMobileNumber(v); setError('mobileNumber', validateMobile(v)); }}
                onBlur={() => setError('mobileNumber', validateMobile(mobileNumber))}
                placeholder="Your answer"
                className={`${inputBase} ${errors.mobileNumber ? inputError : 'border-slate-300'}`}
                disabled={loading}
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
              />
              {errors.mobileNumber && <p className="mt-1.5 text-xs text-amber-700" role="alert">{errors.mobileNumber}</p>}
            </div>

            <div>
              <label htmlFor="tf-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                What is your email address? <span className="text-amber-600">*</span>
              </label>
              <input
                type="email"
                id="tf-email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('email', validateEmail(e.target.value)); }}
                onBlur={() => setError('email', validateEmail(email))}
                placeholder="Your answer"
                className={`${inputBase} ${errors.email ? inputError : 'border-slate-300'}`}
                disabled={loading}
                autoComplete="email"
              />
              {errors.email && <p className="mt-1.5 text-xs text-amber-700" role="alert">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="tf-occupation" className="block text-sm font-medium text-slate-700 mb-1.5">
                What is your current occupation? <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                id="tf-occupation"
                value={occupation}
                onChange={(e) => { setOccupation(e.target.value); setError('occupation', validateOccupation(e.target.value)); }}
                onBlur={() => setError('occupation', validateOccupation(occupation))}
                placeholder="Your answer"
                className={`${inputBase} ${errors.occupation ? inputError : 'border-slate-300'}`}
                disabled={loading}
                autoComplete="organization-title"
              />
              {errors.occupation && <p className="mt-1.5 text-xs text-amber-700" role="alert">{errors.occupation}</p>}
            </div>

            <div>
              <p className="block text-sm font-medium text-slate-700 mb-3">
                How would you rate the session? <span className="text-amber-600">*</span>
              </p>
              <div className="flex flex-wrap justify-between gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5].map((n) => (
                  <label key={n} className="flex flex-col items-center gap-1.5 cursor-pointer">
                    <span className="text-sm font-medium text-slate-700">{n}</span>
                    <input
                      type="radio"
                      name="sessionRating"
                      value={n}
                      checked={sessionRating === String(n)}
                      onChange={(e) => { setSessionRating(e.target.value); setError('sessionRating', ''); }}
                      onBlur={() => setError('sessionRating', validateSessionRating(sessionRating))}
                      disabled={loading}
                      className="w-5 h-5 border-slate-300 text-[#003366] focus:ring-[#003366]"
                    />
                  </label>
                ))}
              </div>
              {errors.sessionRating && <p className="mt-1.5 text-xs text-amber-700" role="alert">{errors.sessionRating}</p>}
            </div>

            <div>
              <label htmlFor="tf-suggestions" className="block text-sm font-medium text-slate-700 mb-1.5">
                Is there anything you would like to convey or suggest?
              </label>
              <textarea
                id="tf-suggestions"
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value.slice(0, 2000))}
                placeholder="Your answer"
                rows={4}
                className={`${inputBase} resize-none border-slate-300`}
                disabled={loading}
              />
              {suggestions.length > 0 && (
                <p className="mt-1.5 text-xs text-slate-500">{suggestions.length} / 2000</p>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto py-3.5 px-6 text-white font-semibold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                style={{ backgroundColor: '#003366' }}
              >
                {loading ? 'Submitting…' : 'Submit'}
              </button>
              <button
                type="button"
                onClick={clearForm}
                disabled={loading}
                className="text-sm font-medium text-[#003366]/80 hover:text-[#003366] hover:underline transition-colors sm:order-first"
              >
                Clear form
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
