import { useEffect, useState } from 'react';
import {
  getIitainSessionFeedbackCounselors,
  submitIitainSessionFeedback,
} from '../utils/api';

const GUIDEXPERT_LOGO_URL =
  'https://res.cloudinary.com/dfqdb1xws/image/upload/v1773394005/GuideXpert_Logo_inbaz5.png';

const YES_NO_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

const inputBase =
  'w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] outline-none transition text-[15px] text-slate-900 placeholder:text-slate-400 bg-white';
const inputError = 'border-amber-400 bg-amber-50/40';

const MODAL_SUCCESS = 'success';

function validateName(value) {
  const t = typeof value === 'string' ? value.trim() : '';
  if (!t) return 'Required';
  if (t.length < 2) return 'At least 2 characters';
  if (t.length > 100) return 'Maximum 100 characters';
  return '';
}

function validateYesNo(value) {
  return value === 'yes' || value === 'no' ? '' : 'Required';
}

function validateSessionSummary(value) {
  const t = typeof value === 'string' ? value.trim() : '';
  if (!t) return 'Required';
  if (t.length < 5) return 'At least 5 characters';
  if (t.length > 5000) return 'Maximum 5000 characters';
  return '';
}

function validateRecordingLink(value) {
  const t = typeof value === 'string' ? value.trim() : '';
  if (!t) return 'Required';
  try {
    const url = new URL(t);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return 'Enter a valid http or https link';
    }
    return '';
  } catch {
    return 'Enter a valid http or https link';
  }
}

function SectionCard({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500 leading-relaxed">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function RadioGroup({ name, options, value, onChange, disabled, error }) {
  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <label
              key={opt.value}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 cursor-pointer transition ${
                selected
                  ? 'border-[#003366] bg-white shadow-sm ring-1 ring-[#003366]/10'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={selected}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="h-4 w-4 border-slate-300 text-[#003366] focus:ring-[#003366]"
              />
              <span className="text-sm font-medium text-slate-800">{opt.label}</span>
            </label>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-xs font-medium text-amber-700" role="alert">{error}</p> : null}
    </div>
  );
}

export default function IitainSessionFeedbackForm() {
  const [counselorName, setCounselorName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [registeredForNat, setRegisteredForNat] = useState('');
  const [sessionSummary, setSessionSummary] = useState('');
  const [sessionRecordingLink, setSessionRecordingLink] = useState('');
  const [counselors, setCounselors] = useState([]);
  const [counselorsLoading, setCounselorsLoading] = useState(true);
  const [counselorsError, setCounselorsError] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [formLocked, setFormLocked] = useState(false);

  const formDisabled = loading || formLocked;

  const setError = (field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCounselorsLoading(true);
      setCounselorsError('');
      try {
        const res = await getIitainSessionFeedbackCounselors();
        if (cancelled) return;
        if (res.success) {
          setCounselors(Array.isArray(res.data) ? res.data : []);
        } else {
          setCounselorsError(res.message || 'Unable to load counselors.');
        }
      } catch {
        if (!cancelled) setCounselorsError('Unable to load counselors.');
      } finally {
        if (!cancelled) setCounselorsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const runValidation = () => {
    const e = {
      counselorName: counselorName ? '' : 'Select a counselor',
      studentName: validateName(studentName),
      registeredForNat: validateYesNo(registeredForNat),
      sessionSummary: validateSessionSummary(sessionSummary),
      sessionRecordingLink: validateRecordingLink(sessionRecordingLink),
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formDisabled) return;
    setSubmitError('');
    if (!runValidation()) {
      setSubmitError('Complete all required fields to submit.');
      return;
    }
    setLoading(true);
    try {
      const result = await submitIitainSessionFeedback({
        counselorName,
        studentName: studentName.trim(),
        registeredForNat,
        sessionSummary: sessionSummary.trim(),
        sessionRecordingLink: sessionRecordingLink.trim(),
      });
      if (result.success) {
        setModalType(MODAL_SUCCESS);
        setFormLocked(true);
      } else {
        setSubmitError(result.message || 'Unable to submit. Please try again.');
      }
    } catch {
      setSubmitError('Connection issue. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  const modalConfig = {
    [MODAL_SUCCESS]: {
      icon: (
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-9 w-9 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ),
      title: 'Thank you',
      message: 'Your session feedback has been submitted successfully.',
    },
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] px-3 py-8 sm:px-4 sm:py-12">
      {modalType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="max-h-[90vh] w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="h-1 w-full bg-gradient-to-r from-[#003366] to-[#00509e]" />
            <div className="overflow-y-auto p-6 text-center sm:p-8">
              {modalConfig[modalType]?.icon}
              <h2 id="modal-title" className="mb-2 text-xl font-semibold text-slate-900">
                {modalConfig[modalType]?.title}
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-slate-600">
                {modalConfig[modalType]?.message}
              </p>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="w-full rounded-xl bg-[#003366] px-5 py-3 font-medium text-white transition hover:bg-[#004080]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-3xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_40px_-12px_rgba(0,51,102,0.15)]">
          <header className="relative overflow-hidden bg-gradient-to-br from-[#003366] via-[#004080] to-[#00509e] px-6 py-7 sm:px-10 sm:py-9">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" aria-hidden />
            <div className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-white/5" aria-hidden />
            <div className="relative grid gap-6 sm:grid-cols-2 sm:items-center sm:gap-8">
              <div className="text-left">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[1.75rem] sm:leading-tight">
                  Session Feedback Form
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-white/75 sm:text-[15px]">
                  Share session details for IITain one-on-one counseling so the team can track follow-ups.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-wide text-white/85 backdrop-blur-sm">
                  <span>IITain session feedback</span>
                  <span className="h-3 w-px bg-white/25" aria-hidden />
                  <span className="text-white/60 normal-case tracking-normal">2–3 min</span>
                </div>
              </div>

              <div className="flex flex-col items-start gap-2 text-left sm:items-end sm:border-l sm:border-white/15 sm:pl-8">
                <img
                  src={GUIDEXPERT_LOGO_URL}
                  alt="GuideXpert"
                  className="h-8 w-auto max-w-[160px] object-contain sm:h-9"
                />
                <p className="text-xs font-medium text-white/55">Counsellor programme</p>
              </div>
            </div>
          </header>

          <div className="p-6 sm:p-8">
            {submitError && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="alert">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <SectionCard
                title="1. Session participants"
                description="Select the counselor and enter the student name for this session."
              >
                <div className="space-y-4">
                  <div>
                    <label htmlFor="isf-counselor" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Counselor name <span className="text-amber-600">*</span>
                    </label>
                    <select
                      id="isf-counselor"
                      value={counselorName}
                      onChange={(e) => {
                        setCounselorName(e.target.value);
                        setError('counselorName', e.target.value ? '' : 'Select a counselor');
                      }}
                      disabled={formDisabled || counselorsLoading}
                      className={`${inputBase} ${errors.counselorName ? inputError : 'border-slate-200'}`}
                    >
                      <option value="">
                        {counselorsLoading ? 'Loading counselors…' : 'Select counselor'}
                      </option>
                      {counselors.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    {counselorsError ? (
                      <p className="mt-1.5 text-xs text-amber-700">{counselorsError}</p>
                    ) : null}
                    {errors.counselorName ? (
                      <p className="mt-1.5 text-xs text-amber-700">{errors.counselorName}</p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="isf-student" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Student name <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="isf-student"
                      value={studentName}
                      onChange={(e) => {
                        setStudentName(e.target.value);
                        setError('studentName', validateName(e.target.value));
                      }}
                      onBlur={() => setError('studentName', validateName(studentName))}
                      placeholder="Enter student name"
                      className={`${inputBase} ${errors.studentName ? inputError : 'border-slate-200'}`}
                      disabled={formDisabled}
                      autoComplete="name"
                    />
                    {errors.studentName ? (
                      <p className="mt-1.5 text-xs text-amber-700">{errors.studentName}</p>
                    ) : null}
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="2. Registration status"
                description="Did the student register for NAT after this session?"
              >
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">
                    Did they register for NAT? <span className="text-amber-600">*</span>
                  </p>
                  <RadioGroup
                    name="registeredForNat"
                    options={YES_NO_OPTIONS}
                    value={registeredForNat}
                    onChange={(v) => {
                      setRegisteredForNat(v);
                      setError('registeredForNat', '');
                    }}
                    disabled={formDisabled}
                    error={errors.registeredForNat}
                  />
                </div>
              </SectionCard>

              <SectionCard
                title="3. Session details"
                description="Summarize what happened in the session and share the recording link."
              >
                <div className="space-y-4">
                  <div>
                    <label htmlFor="isf-summary" className="mb-1.5 block text-sm font-medium text-slate-700">
                      What happened in the session? <span className="text-amber-600">*</span>
                    </label>
                    <textarea
                      id="isf-summary"
                      value={sessionSummary}
                      onChange={(e) => {
                        setSessionSummary(e.target.value);
                        setError('sessionSummary', validateSessionSummary(e.target.value));
                      }}
                      onBlur={() => setError('sessionSummary', validateSessionSummary(sessionSummary))}
                      placeholder="Describe the discussion, student concerns, next steps, etc."
                      rows={5}
                      className={`${inputBase} resize-y min-h-[120px] ${errors.sessionSummary ? inputError : 'border-slate-200'}`}
                      disabled={formDisabled}
                    />
                    {errors.sessionSummary ? (
                      <p className="mt-1.5 text-xs text-amber-700">{errors.sessionSummary}</p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="isf-recording" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Session recording link <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="url"
                      id="isf-recording"
                      value={sessionRecordingLink}
                      onChange={(e) => {
                        setSessionRecordingLink(e.target.value);
                        setError('sessionRecordingLink', validateRecordingLink(e.target.value));
                      }}
                      onBlur={() => setError('sessionRecordingLink', validateRecordingLink(sessionRecordingLink))}
                      placeholder="https://..."
                      className={`${inputBase} ${errors.sessionRecordingLink ? inputError : 'border-slate-200'}`}
                      disabled={formDisabled}
                      required
                    />
                    {errors.sessionRecordingLink ? (
                      <p className="mt-1.5 text-xs text-amber-700">{errors.sessionRecordingLink}</p>
                    ) : (
                      <p className="mt-1.5 text-xs text-slate-500">Paste a Google Drive, Meet, or other recording URL.</p>
                    )}
                  </div>
                </div>
              </SectionCard>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={formDisabled || counselorsLoading}
                  className="w-full rounded-xl bg-[#003366] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#003366]/20 transition hover:bg-[#004080] disabled:opacity-60 sm:w-auto sm:min-w-[200px] sm:px-8"
                >
                  {loading ? 'Submitting…' : 'Submit feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
