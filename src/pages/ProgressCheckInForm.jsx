import { useMemo, useRef, useState } from 'react';
import {
  sendOtp,
  verifyOtp,
  submitProgressCheckIn,
  checkProgressCheckInSubmitted,
} from '../utils/api';

const ACTIVITY_OPTIONS = [
  { value: 'reaching_out_contacts', label: 'I have started reaching out to my contacts' },
  { value: 'shared_posters', label: 'I have shared posters with proper context' },
  { value: 'started_conversations', label: 'I have started conversations with students/parents' },
  { value: 'identified_students', label: 'I have identified interested students' },
  { value: 'started_counseling', label: 'I have started counseling students' },
  { value: 'follow_ups', label: 'I have done follow-ups with interested students' },
  { value: 'generated_lead', label: 'I have generated a new lead' },
  { value: 'started_nat_application', label: 'I have started a NAT Application' },
  { value: 'booked_nat_exam', label: 'I have booked a NAT Exam' },
  { value: 'completed_sr', label: 'I have completed a Seat Reservation (SR)' },
  { value: 'not_started_yet', label: "I haven't started yet" },
];

const NEW_LEADS_OPTIONS = ['0', '1–2', '3–5', '5+'];
const COUNT_OPTIONS = ['0', '1', '2–5', '5+'];

const CHALLENGE_OPTIONS = [
  { value: 'finding_students', label: 'Finding Students' },
  { value: 'starting_conversations', label: 'Starting Conversations' },
  { value: 'counseling_students', label: 'Counseling Students' },
  { value: 'follow_ups', label: 'Follow-ups' },
  { value: 'nat_conversions', label: 'NAT Conversions' },
  { value: 'time_management', label: 'Time Management' },
  { value: 'confidence', label: 'Confidence' },
  { value: 'other', label: 'Other' },
];

const GUIDEXPERT_LOGO_URL =
  'https://res.cloudinary.com/dfqdb1xws/image/upload/v1773394005/GuideXpert_Logo_inbaz5.png';

const STEP_META = [
  { title: 'Your details & progress', subtitle: 'Verify your number and tell us what you have done so far.' },
  { title: 'Outcomes & challenges', subtitle: 'Share your numbers and the support you need next.' },
  { title: 'Book support session', subtitle: 'Choose a convenient slot for your follow-up session.' },
];

const SLOT_TIMES = [
  { value: '15:00', label: '3:00 PM' },
  { value: '17:00', label: '5:00 PM' },
];

const IST_TIMEZONE = 'Asia/Kolkata';

function getISTParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value || '';
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: Number(get('hour')),
    minute: Number(get('minute')),
  };
}

function istDateString(parts) {
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function parseISODate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getNextTwoSlotDays(now = new Date()) {
  const ist = getISTParts(now);
  let cursor = parseISODate(istDateString(ist));
  const days = [];
  while (days.length < 2) {
    if (cursor.getDay() !== 0) days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function formatDayLabel(date, todayStr) {
  const dateStr = toISODate(date);
  if (dateStr === todayStr) return 'Today';
  const today = parseISODate(todayStr);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateStr === toISODate(tomorrow)) return 'Tomorrow';
  return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
}

function buildSlotDayOptions(now = new Date()) {
  const ist = getISTParts(now);
  const todayStr = istDateString(ist);
  const nowMinutes = ist.hour * 60 + ist.minute;

  return getNextTwoSlotDays(now).map((day) => {
    const dateStr = toISODate(day);
    const isToday = dateStr === todayStr;
    const slots = SLOT_TIMES.filter(({ value }) => {
      if (!isToday) return true;
      const [h, m] = value.split(':').map(Number);
      return h * 60 + m > nowMinutes;
    }).map(({ value, label }) => ({
      value,
      label,
      id: `${dateStr}_${value}`,
    }));
    return {
      date: dateStr,
      label: formatDayLabel(day, todayStr),
      sublabel: day.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }),
      slots,
    };
  });
}

function normalizeCountOption(value) {
  return String(value || '').replace(/–/g, '-');
}

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

const inputBase =
  'w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] outline-none transition text-[15px] text-slate-900 placeholder:text-slate-400 bg-white';
const inputError = 'border-amber-400 bg-amber-50/40';

const MODAL_SUCCESS = 'success';
const MODAL_ALREADY = 'already';

function StepIndicator({ step }) {
  const totalSteps = STEP_META.length;
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {STEP_META.map((meta, index) => {
          const n = index + 1;
          const active = step === n;
          const done = step > n;
          return (
            <div key={n} className="flex flex-1 items-center gap-2 min-w-0 sm:gap-3">
              <div
                className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-semibold transition ${
                  done
                    ? 'bg-emerald-600 text-white'
                    : active
                      ? 'bg-[#003366] text-white shadow-md shadow-[#003366]/20'
                      : 'bg-slate-100 text-slate-500'
                }`}
              >
                {done ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  n
                )}
              </div>
              <div className="min-w-0 hidden md:block">
                <p className={`text-xs font-semibold uppercase tracking-wide ${active || done ? 'text-[#003366]' : 'text-slate-400'}`}>
                  Step {n}
                </p>
                <p className="text-sm text-slate-600 truncate">{meta.title}</p>
              </div>
              {n < totalSteps && (
                <div className={`mx-1 h-0.5 flex-1 rounded-full ${done ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#003366] to-[#00509e] transition-all duration-500 ease-out"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
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
          const optValue = typeof opt === 'string' ? normalizeCountOption(opt) : opt.value;
          const optLabel = typeof opt === 'string' ? opt : opt.label;
          const selected = value === optValue;
          return (
            <label
              key={optValue}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 cursor-pointer transition ${
                selected
                  ? 'border-[#003366] bg-white shadow-sm ring-1 ring-[#003366]/10'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name={name}
                value={optValue}
                checked={selected}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="h-4 w-4 border-slate-300 text-[#003366] focus:ring-[#003366]"
              />
              <span className="text-sm font-medium text-slate-800">{optLabel}</span>
            </label>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-xs font-medium text-amber-700" role="alert">{error}</p> : null}
    </div>
  );
}

export default function ProgressCheckInForm() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [activities, setActivities] = useState([]);
  const [newLeads, setNewLeads] = useState('');
  const [newNatApplications, setNewNatApplications] = useState('');
  const [seatReservations, setSeatReservations] = useState('');
  const [biggestChallenge, setBiggestChallenge] = useState('');
  const [biggestChallengeOther, setBiggestChallengeOther] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [formLocked, setFormLocked] = useState(false);

  const otpInputRefs = useRef([]);

  const normalizedPhone = useMemo(() => {
    const digits = (mobileNumber || '').replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : digits;
  }, [mobileNumber]);

  const slotDayOptions = useMemo(() => buildSlotDayOptions(), []);

  const selectedSlot = useMemo(() => {
    for (const day of slotDayOptions) {
      const match = day.slots.find((s) => s.id === selectedSlotId);
      if (match) return { slotDate: day.date, slotTime: match.value, label: `${day.label}, ${match.label}` };
    }
    return null;
  }, [selectedSlotId, slotDayOptions]);

  const formDisabled = loading || formLocked;

  const setError = (field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const resetOtpState = () => {
    setOtp(['', '', '', '', '', '']);
    setOtpSent(false);
    setOtpVerified(false);
    setOtpError('');
  };

  const toggleActivity = (value) => {
    if (formDisabled || !otpVerified) return;
    setActivities((prev) => {
      if (value === 'not_started_yet') {
        return prev.includes('not_started_yet') ? [] : ['not_started_yet'];
      }
      const withoutNotStarted = prev.filter((a) => a !== 'not_started_yet');
      if (withoutNotStarted.includes(value)) {
        return withoutNotStarted.filter((a) => a !== value);
      }
      return [...withoutNotStarted, value];
    });
    setError('activities', '');
  };

  const validateStep1 = () => {
    const e = {
      fullName: validateName(fullName),
      mobileNumber: validateMobile(mobileNumber),
      otpVerified: otpVerified ? '' : 'Verify your mobile number with OTP',
      activities: activities.length ? '' : 'Select at least one option',
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const validateStep2 = () => {
    const e = {
      newLeads: newLeads ? '' : 'Required',
      newNatApplications: newNatApplications ? '' : 'Required',
      seatReservations: seatReservations ? '' : 'Required',
      biggestChallenge: biggestChallenge ? '' : 'Required',
      biggestChallengeOther:
        biggestChallenge === 'other' && !biggestChallengeOther.trim() ? 'Please describe your challenge' : '',
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const validateStep3 = () => {
    const e = {
      selectedSlot: selectedSlot ? '' : 'Select a session slot to continue',
    };
    setErrors((prev) => ({ ...prev, ...e }));
    return !e.selectedSlot;
  };

  const handleSendOtp = async () => {
    const nameErr = validateName(fullName);
    const mobileErr = validateMobile(mobileNumber);
    setErrors((prev) => ({ ...prev, fullName: nameErr, mobileNumber: mobileErr }));
    if (nameErr || mobileErr) {
      setSubmitError('Please complete your name and mobile number.');
      return;
    }

    setSubmitError('');
    setOtpError('');
    setInfoMessage('');
    setSendingOtp(true);

    try {
      const already = await checkProgressCheckInSubmitted(normalizedPhone);
      if (already.success && already.submitted) {
        setModalType(MODAL_ALREADY);
        setFormLocked(true);
        return;
      }

      const result = await sendOtp(fullName.trim(), normalizedPhone, 'Progress Check-In');
      if (result.success) {
        setOtpSent(true);
        setOtp(['', '', '', '', '', '']);
        setInfoMessage(`OTP sent to ******${normalizedPhone.slice(-4)}`);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      } else {
        setSubmitError(result.message || 'Failed to send OTP. Please try again.');
      }
    } catch {
      setSubmitError('Connection issue. Please check your network and try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setOtpError('');
    if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pasted)) return;
    const next = pasted.split('').concat(Array(6 - pasted.length).fill(''));
    setOtp(next);
    const lastIndex = Math.min(pasted.length - 1, 5);
    otpInputRefs.current[lastIndex]?.focus();
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setOtpError('Enter all 6 digits');
      return;
    }

    setOtpError('');
    setSubmitError('');
    setVerifyingOtp(true);

    try {
      const result = await verifyOtp(normalizedPhone, otpString);
      if (result.success && result.data?.verified === true) {
        setOtpVerified(true);
        setInfoMessage('Mobile number verified successfully.');
        setError('otpVerified', '');
      } else {
        setOtpError(result.message || 'Invalid or expired OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      }
    } catch {
      setOtpError('Connection issue. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    await handleSendOtp();
  };

  const handleMobileChange = (value) => {
    const v = value.replace(/\D/g, '').slice(0, 10);
    if (v !== mobileNumber) resetOtpState();
    setMobileNumber(v);
    setError('mobileNumber', validateMobile(v));
    setSubmitError('');
  };

  const handleContinueToStep2 = (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validateStep1()) {
      setSubmitError('Complete all required fields in Step 1 before continuing.');
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueToStep3 = (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validateStep2()) {
      setSubmitError('Complete all required fields in Step 2 before continuing.');
      return;
    }
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formLocked) return;
    setSubmitError('');
    if (!validateStep3()) {
      setSubmitError('Select a support session slot to submit.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        mobileNumber: normalizedPhone,
        activities,
        newLeads: normalizeCountOption(newLeads),
        newNatApplications: normalizeCountOption(newNatApplications),
        seatReservations: normalizeCountOption(seatReservations),
        biggestChallenge,
        biggestChallengeOther:
          biggestChallenge === 'other' ? biggestChallengeOther.trim().slice(0, 500) : undefined,
        slotDate: selectedSlot.slotDate,
        slotTime: selectedSlot.slotTime,
      };
      const result = await submitProgressCheckIn(payload);
      if (result.success) {
        setModalType(MODAL_SUCCESS);
        setFormLocked(true);
      } else if (
        result.status === 409 ||
        (result.data && typeof result.data === 'object' && result.data.code === 'ALREADY_SUBMITTED')
      ) {
        setModalType(MODAL_ALREADY);
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
      title: 'Thank you for completing the Progress Check-In',
      message: selectedSlot
        ? `Your responses have been recorded. Your support session is scheduled for ${selectedSlot.label}. We will share the meeting details shortly.`
        : 'Your responses will help us understand your current stage and plan the next support sessions accordingly.',
    },
    [MODAL_ALREADY]: {
      icon: (
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <svg className="h-9 w-9 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
      title: 'Already submitted',
      message: 'You have already completed this progress check-in. Thank you.',
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
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-white/5"
              aria-hidden
            />
            <div className="relative grid gap-6 sm:grid-cols-2 sm:items-center sm:gap-8">
              <div className="text-left">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[1.75rem] sm:leading-tight">
                  Progress Check-In
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-white/75 sm:text-[15px]">
                  Help us understand your implementation progress so we can plan the right support for you.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-wide text-white/85 backdrop-blur-sm">
                  <span>Implementation survey</span>
                  <span className="h-3 w-px bg-white/25" aria-hidden />
                  <span className="text-white/60 normal-case tracking-normal">3–4 min</span>
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
            <StepIndicator step={step} />

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">{STEP_META[step - 1].title}</h2>
              <p className="mt-1 text-sm text-slate-500">{STEP_META[step - 1].subtitle}</p>
            </div>

            {(submitError || infoMessage) && (
              <div className="mb-6 space-y-2">
                {infoMessage && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
                    {infoMessage}
                  </div>
                )}
                {submitError && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="alert">
                    {submitError}
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleContinueToStep2} className="space-y-6">
                <SectionCard
                  title="1. Personal information"
                  description="Use the mobile number you registered with on GuideXpert."
                >
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="pci-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                        Full name <span className="text-amber-600">*</span>
                      </label>
                      <input
                        type="text"
                        id="pci-name"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          setError('fullName', validateName(e.target.value));
                        }}
                        onBlur={() => setError('fullName', validateName(fullName))}
                        placeholder="Enter your full name"
                        className={`${inputBase} ${errors.fullName ? inputError : 'border-slate-200'}`}
                        disabled={formDisabled}
                        autoComplete="name"
                      />
                      {errors.fullName && <p className="mt-1.5 text-xs text-amber-700">{errors.fullName}</p>}
                    </div>

                    <div>
                      <label htmlFor="pci-mobile" className="mb-1.5 block text-sm font-medium text-slate-700">
                        Registered mobile number <span className="text-amber-600">*</span>
                      </label>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                          type="tel"
                          id="pci-mobile"
                          value={mobileNumber}
                          onChange={(e) => handleMobileChange(e.target.value)}
                          onBlur={() => setError('mobileNumber', validateMobile(mobileNumber))}
                          placeholder="10-digit mobile number"
                          className={`${inputBase} sm:flex-1 ${errors.mobileNumber ? inputError : 'border-slate-200'}`}
                          disabled={formDisabled || otpVerified}
                          autoComplete="tel"
                          inputMode="numeric"
                          maxLength={10}
                        />
                        {!otpVerified && (
                          <button
                            type="button"
                            onClick={() => void handleSendOtp()}
                            disabled={formDisabled || sendingOtp}
                            className="shrink-0 rounded-xl bg-[#003366] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#004080] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {sendingOtp ? 'Sending…' : otpSent ? 'Resend OTP' : 'Send OTP'}
                          </button>
                        )}
                      </div>
                      {errors.mobileNumber && <p className="mt-1.5 text-xs text-amber-700">{errors.mobileNumber}</p>}
                      {otpVerified && (
                        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Verified
                        </p>
                      )}
                    </div>
                  </div>
                </SectionCard>

                {otpSent && !otpVerified && (
                  <SectionCard title="OTP verification" description="Enter the 6-digit code sent to your mobile.">
                    <div className="flex justify-center gap-2 sm:gap-3">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => { otpInputRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={handleOtpPaste}
                          className="h-12 w-11 rounded-xl border-2 border-slate-200 text-center text-xl font-semibold text-slate-900 focus:border-[#003366] focus:outline-none focus:ring-2 focus:ring-[#003366]/15 sm:h-14 sm:w-12"
                          aria-label={`OTP digit ${index + 1}`}
                          disabled={verifyingOtp || formDisabled}
                        />
                      ))}
                    </div>
                    {otpError && <p className="mt-3 text-center text-sm text-amber-700">{otpError}</p>}
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => void handleVerifyOtp()}
                        disabled={verifyingOtp || formDisabled}
                        className="flex-1 rounded-xl bg-[#003366] py-3 text-sm font-semibold text-white transition hover:bg-[#004080] disabled:opacity-60"
                      >
                        {verifyingOtp ? 'Verifying…' : 'Verify OTP'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleResendOtp()}
                        disabled={sendingOtp || formDisabled}
                        className="rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Resend code
                      </button>
                    </div>
                  </SectionCard>
                )}

                <SectionCard
                  title="2. Activities completed"
                  description="Which of the following have you done after watching the implementation videos? Select all that apply."
                >
                  <div className={`space-y-2 ${!otpVerified ? 'pointer-events-none opacity-50' : ''}`}>
                    {ACTIVITY_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 transition ${
                          activities.includes(opt.value)
                            ? 'border-[#003366] bg-white shadow-sm ring-1 ring-[#003366]/10'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        } ${formDisabled || !otpVerified ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <input
                          type="checkbox"
                          checked={activities.includes(opt.value)}
                          onChange={() => toggleActivity(opt.value)}
                          disabled={formDisabled || !otpVerified}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#003366] focus:ring-[#003366]"
                        />
                        <span className="text-sm leading-relaxed text-slate-800">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  {!otpVerified && (
                    <p className="mt-3 text-xs text-slate-500">Verify your mobile number to unlock this section.</p>
                  )}
                  {errors.activities && <p className="mt-2 text-xs font-medium text-amber-700">{errors.activities}</p>}
                  {errors.otpVerified && <p className="mt-2 text-xs font-medium text-amber-700">{errors.otpVerified}</p>}
                </SectionCard>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={formDisabled}
                    className="w-full rounded-xl bg-[#003366] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#003366]/20 transition hover:bg-[#004080] disabled:opacity-60 sm:w-auto sm:min-w-[200px] sm:px-8"
                  >
                    Continue to Step 2
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleContinueToStep3} className="space-y-6">
                <SectionCard
                  title="3. New leads generated"
                  description="How many NEW leads have you generated after watching the implementation videos?"
                >
                  <RadioGroup
                    name="newLeads"
                    options={NEW_LEADS_OPTIONS}
                    value={newLeads}
                    onChange={(v) => { setNewLeads(v); setError('newLeads', ''); }}
                    disabled={formDisabled}
                    error={errors.newLeads}
                  />
                </SectionCard>

                <SectionCard
                  title="4. NAT applications started"
                  description="How many NEW NAT Applications have you started after watching the implementation videos?"
                >
                  <RadioGroup
                    name="newNatApplications"
                    options={COUNT_OPTIONS}
                    value={newNatApplications}
                    onChange={(v) => { setNewNatApplications(v); setError('newNatApplications', ''); }}
                    disabled={formDisabled}
                    error={errors.newNatApplications}
                  />
                </SectionCard>

                <SectionCard
                  title="5. Seat reservations completed"
                  description="How many Seat Reservations (SR) have been completed?"
                >
                  <RadioGroup
                    name="seatReservations"
                    options={COUNT_OPTIONS}
                    value={seatReservations}
                    onChange={(v) => { setSeatReservations(v); setError('seatReservations', ''); }}
                    disabled={formDisabled}
                    error={errors.seatReservations}
                  />
                </SectionCard>

                <SectionCard title="6. Biggest challenge" description="What is your biggest challenge currently?">
                  <RadioGroup
                    name="biggestChallenge"
                    options={CHALLENGE_OPTIONS}
                    value={biggestChallenge}
                    onChange={(v) => {
                      setBiggestChallenge(v);
                      setError('biggestChallenge', '');
                      if (v !== 'other') setBiggestChallengeOther('');
                    }}
                    disabled={formDisabled}
                    error={errors.biggestChallenge}
                  />
                  {biggestChallenge === 'other' && (
                    <div className="mt-4">
                      <input
                        type="text"
                        value={biggestChallengeOther}
                        onChange={(e) => {
                          setBiggestChallengeOther(e.target.value.slice(0, 500));
                          setError('biggestChallengeOther', '');
                        }}
                        placeholder="Please describe your challenge"
                        className={`${inputBase} ${errors.biggestChallengeOther ? inputError : 'border-slate-200'}`}
                        disabled={formDisabled}
                      />
                      {errors.biggestChallengeOther && (
                        <p className="mt-1.5 text-xs text-amber-700">{errors.biggestChallengeOther}</p>
                      )}
                    </div>
                  )}
                </SectionCard>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setSubmitError('');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={formDisabled}
                    className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    Back to Step 1
                  </button>
                  <button
                    type="submit"
                    disabled={formDisabled}
                    className="rounded-xl bg-[#003366] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#003366]/20 transition hover:bg-[#004080] disabled:opacity-60"
                  >
                    Continue to Step 3
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <SectionCard
                  title="7. Select your support session"
                  description="Daily sessions at 3:00 PM and 5:00 PM (IST). Sundays are not available — pick one slot from the next two available days."
                >
                  <div className="space-y-5">
                    {slotDayOptions.map((day) => (
                      <div key={day.date}>
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-slate-900">{day.label}</p>
                          <p className="text-xs text-slate-500">{day.sublabel}</p>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {day.slots.length > 0 ? (
                            day.slots.map((slot) => {
                              const selected = selectedSlotId === slot.id;
                              return (
                                <label
                                  key={slot.id}
                                  className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 cursor-pointer transition ${
                                    selected
                                      ? 'border-[#003366] bg-white shadow-sm ring-1 ring-[#003366]/10'
                                      : 'border-slate-200 bg-white hover:border-slate-300'
                                  } ${formDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                  <span className="flex items-center gap-3">
                                    <input
                                      type="radio"
                                      name="supportSlot"
                                      value={slot.id}
                                      checked={selected}
                                      onChange={() => {
                                        setSelectedSlotId(slot.id);
                                        setError('selectedSlot', '');
                                      }}
                                      disabled={formDisabled}
                                      className="h-4 w-4 border-slate-300 text-[#003366] focus:ring-[#003366]"
                                    />
                                    <span className="text-sm font-medium text-slate-800">{slot.label}</span>
                                  </span>
                                  <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">IST</span>
                                </label>
                              );
                            })
                          ) : (
                            <p className="col-span-full rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                              No slots remaining for this day.
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.selectedSlot && (
                    <p className="mt-3 text-xs font-medium text-amber-700" role="alert">{errors.selectedSlot}</p>
                  )}
                </SectionCard>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(2);
                      setSubmitError('');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={formDisabled}
                    className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    Back to Step 2
                  </button>
                  <button
                    type="submit"
                    disabled={formDisabled}
                    className="rounded-xl bg-[#003366] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#003366]/20 transition hover:bg-[#004080] disabled:opacity-60"
                  >
                    {loading ? 'Submitting…' : 'Submit check-in'}
                  </button>
                </div>
              </form>
            )}
          </div>
          <p className="border-t border-slate-100 bg-slate-50/60 px-6 py-4 text-center text-xs text-slate-400 sm:px-8">
            Your information is confidential and used only to plan support sessions.
          </p>
        </div>
      </div>
    </div>
  );
}
