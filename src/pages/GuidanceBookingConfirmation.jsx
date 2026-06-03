import { useEffect, useState } from 'react';
import { FormInput, NeoField } from '../components/oneOnOneSession/FormControls';
import GuidanceSlotPicker from '../components/oneOnOneSession/GuidanceSlotPicker';
import { bookGuidanceSlot, checkGuidanceMobile } from '../utils/guidanceBookingApi';
import { captureUtmFirstTouch } from '../utils/utm';

function normalizeMobile(val) {
  return String(val || '')
    .replace(/\D/g, '')
    .slice(-10)
    .slice(0, 10);
}

function SuccessView() {
  return (
    <div className="rounded-[14px] border-2 border-[#0F172A] bg-white p-8 text-center shadow-[6px_6px_0px_#0F172A] sm:p-12">
      <div
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#0F172A] bg-[#c7f36b] text-3xl shadow-[4px_4px_0px_#0F172A]"
        aria-hidden
      >
        ✓
      </div>
      <p className="mb-3 inline-flex rounded border-2 border-emerald-800 bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-900">
        Slot confirmed
      </p>
      <h2 className="text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl">
        Your guidance session is booked
      </h2>
      <p className="mx-auto mt-4 max-w-lg text-sm font-medium leading-relaxed text-slate-600">
        Your guidance session slot has been booked successfully. Our team will send session details
        on WhatsApp.
      </p>
      <div className="mx-auto mt-8 max-w-xl rounded-[12px] border-2 border-[#0F172A] bg-[#c7f36b] p-5 text-left shadow-[4px_4px_0px_#0F172A] sm:p-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]/80">
          What happens next
        </p>
        <p className="mt-2 text-base font-black leading-snug text-[#0F172A] sm:text-lg">
          Keep WhatsApp notifications on — we will message you with the session link and reminders.
        </p>
      </div>
    </div>
  );
}

function StudentDetailsCard({ student }) {
  if (!student) return null;
  return (
    <div className="rounded-[12px] border-2 border-[#0F172A] bg-[#F8FAFC] p-5 shadow-[4px_4px_0px_#0F172A] sm:col-span-2">
      <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-[#0F172A]/80">
        Your details
      </p>
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Name</dt>
          <dd className="mt-0.5 font-black text-[#0F172A]">{student.studentName}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Class</dt>
          <dd className="mt-0.5 font-black text-[#0F172A]">{student.currentClass}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">City</dt>
          <dd className="mt-0.5 font-black text-[#0F172A]">{student.city || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Language</dt>
          <dd className="mt-0.5 font-black text-[#0F172A]">{student.preferredLanguage}</dd>
        </div>
      </dl>
    </div>
  );
}

const neoCheckboxClass =
  'mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-[#0F172A] accent-[#0F172A]';

const neoCheckboxLabelClass =
  'flex cursor-pointer items-start gap-3 rounded-[10px] border-2 border-[#0F172A] bg-white p-4 shadow-[2px_2px_0px_#0F172A] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#0F172A]';

export default function GuidanceBookingConfirmation() {
  const [mobile, setMobile] = useState('');
  const [step, setStep] = useState('mobile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slotError, setSlotError] = useState('');
  const [student, setStudent] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [parentConfirmed, setParentConfirmed] = useState(false);
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = 'Confirm Your Guidance Session Slot | GuideXpert';
    captureUtmFirstTouch();
  }, []);

  const handleCheckMobile = async (e) => {
    e.preventDefault();
    setError('');
    const digits = normalizeMobile(mobile);
    if (digits.length !== 10) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    setLoading(true);
    const res = await checkGuidanceMobile(digits);
    setLoading(false);
    if (!res.success || !res.found) {
      setError(
        res.message || 'This mobile number is not found. Please contact the GuideXpert team.'
      );
      setStudent(null);
      setSlots([]);
      return;
    }
    if (res.alreadyBooked) {
      setError(res.message || 'A slot is already booked with this mobile number.');
      setStudent(res.data?.student || null);
      setSlots([]);
      return;
    }
    setStudent(res.data?.student || null);
    setSlots(res.data?.slots || []);
    setStep('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setError('');
    setSlotError('');
    if (!selectedSlotId) {
      setSlotError('Please select a session slot.');
      return;
    }
    if (!parentConfirmed || !whatsappConsent) {
      setError('Please confirm parent attendance and WhatsApp consent.');
      return;
    }
    setLoading(true);
    const res = await bookGuidanceSlot({
      mobileNumber: normalizeMobile(mobile),
      slotId: selectedSlotId,
      parentAttendanceConfirmed: true,
      whatsappConsent: true,
    });
    setLoading(false);
    if (!res.success) {
      setError(res.message || 'Booking failed. Please try again.');
      return;
    }
    setSuccess(true);
    setStep('done');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-10 selection:bg-[#c7f36b] selection:text-[#0F172A] sm:px-6">
      <div className="mx-auto max-w-4xl">
        {success ? (
          <SuccessView />
        ) : (
          <>
            <div className="mb-6 rounded-[14px] border-2 border-[#0F172A] bg-[#0F172A] p-6 text-white shadow-[6px_6px_0px_#c7f36b]">
              <p className="mb-2 inline-flex rounded border border-slate-600 bg-[#1E293B] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-300">
                Guidance session booking
              </p>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Confirm Your 1-on-1 Guidance Session Slot
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-300">
                Already registered with GuideXpert? Enter your mobile number, choose an available
                slot, and confirm with your parent.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide text-slate-200">
                <li className="rounded border border-slate-600 bg-[#1E293B] px-2 py-1">
                  For registered students
                </li>
                <li className="rounded border border-emerald-800 bg-emerald-950/60 px-2 py-1 text-emerald-100">
                  Parent must attend
                </li>
              </ul>
            </div>

            {step === 'mobile' ? (
              <form
                onSubmit={handleCheckMobile}
                className="rounded-[14px] border-2 border-[#0F172A] bg-white p-5 shadow-[6px_6px_0px_#0F172A] sm:p-7"
                noValidate
              >
                <p className="mb-4 text-xs font-semibold text-slate-600">
                  Use the same mobile number you used on the{' '}
                  <a
                    href="/one-on-one-session"
                    className="font-bold text-[#0F172A] underline underline-offset-2"
                  >
                    1-on-1 session form
                  </a>
                  .
                </p>

                <NeoField label="Student mobile number" error={error} required className="sm:col-span-2">
                  <FormInput
                    id="guidance-mobile"
                    name="mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(normalizeMobile(e.target.value))}
                    error={error}
                    placeholder="10-digit mobile number"
                  />
                </NeoField>

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-[14px] border-2 border-[#0F172A] bg-[#c7f36b] px-6 py-3 text-sm font-black uppercase tracking-wide text-[#0F172A] shadow-[4px_4px_0px_#0F172A] transition-all hover:-translate-y-0.5 hover:bg-[#b0d95d] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                  >
                    {loading ? 'Checking…' : 'Continue'}
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={handleBook}
                className="rounded-[14px] border-2 border-[#0F172A] bg-white p-5 shadow-[6px_6px_0px_#0F172A] sm:p-7"
                noValidate
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <StudentDetailsCard student={student} />

                  <GuidanceSlotPicker
                    slots={slots}
                    value={selectedSlotId}
                    onChange={(id) => {
                      setSelectedSlotId(id);
                      setSlotError('');
                    }}
                    error={slotError}
                    label="Select your session slot"
                  />

                  <div className="space-y-3 sm:col-span-2">
                    <p className="text-sm font-black uppercase tracking-wide text-[#0F172A]">
                      Confirmations <span className="text-red-700">*</span>
                    </p>
                    <label className={neoCheckboxLabelClass}>
                      <input
                        type="checkbox"
                        checked={parentConfirmed}
                        onChange={(e) => setParentConfirmed(e.target.checked)}
                        className={neoCheckboxClass}
                      />
                      <span className="text-sm font-semibold text-[#0F172A]">
                        I confirm that I will attend the guidance session with my parent.
                      </span>
                    </label>
                    <label className={neoCheckboxLabelClass}>
                      <input
                        type="checkbox"
                        checked={whatsappConsent}
                        onChange={(e) => setWhatsappConsent(e.target.checked)}
                        className={neoCheckboxClass}
                      />
                      <span className="text-sm font-semibold text-[#0F172A]">
                        I agree to receive session updates and reminders through WhatsApp.
                      </span>
                    </label>
                  </div>
                </div>

                {error ? (
                  <p className="mt-5 rounded-[10px] border-2 border-red-900 bg-red-100 px-4 py-3 text-sm font-bold text-red-900">
                    {error}
                  </p>
                ) : null}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('mobile');
                      setError('');
                      setSlotError('');
                    }}
                    className="rounded-[14px] border-2 border-[#0F172A] bg-white px-5 py-3 text-sm font-black uppercase tracking-wide text-[#0F172A] shadow-[3px_3px_0px_#0F172A] transition-all hover:-translate-y-0.5"
                  >
                    Change number
                  </button>
                  <button
                    type="submit"
                    disabled={loading || slots.length === 0}
                    className="rounded-[14px] border-2 border-[#0F172A] bg-[#c7f36b] px-6 py-3 text-sm font-black uppercase tracking-wide text-[#0F172A] shadow-[4px_4px_0px_#0F172A] transition-all hover:-translate-y-0.5 hover:bg-[#b0d95d] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? 'Booking…' : 'Confirm my slot'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
