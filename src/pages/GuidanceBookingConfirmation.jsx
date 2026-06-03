import { useState } from 'react';
import { FiCalendar, FiCheck, FiPhone, FiUsers } from 'react-icons/fi';
import { bookGuidanceSlot, checkGuidanceMobile } from '../utils/guidanceBookingApi';

function normalizeMobile(val) {
  return String(val || '')
    .replace(/\D/g, '')
    .slice(-10)
    .slice(0, 10);
}

export default function GuidanceBookingConfirmation() {
  const [mobile, setMobile] = useState('');
  const [step, setStep] = useState('mobile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [student, setStudent] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [parentConfirmed, setParentConfirmed] = useState(false);
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [success, setSuccess] = useState(false);

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
      setError(res.message || 'This mobile number is not found. Please contact the GuideXpert team.');
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
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedSlotId) {
      setError('Please select a session slot.');
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#0f2744] text-white flex items-center justify-center font-bold text-sm">
            GX
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">GuideXpert Guidance Session</h1>
            <p className="text-sm text-slate-600">Confirm your one-on-one slot booking</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
            <FiCheck className="mx-auto h-12 w-12 text-emerald-600 mb-4" aria-hidden />
            <h2 className="text-xl font-semibold text-emerald-900 mb-2">Booking confirmed</h2>
            <p className="text-emerald-800">
              Your guidance session slot has been booked successfully. Our team will send details on
              WhatsApp.
            </p>
          </div>
        ) : step === 'mobile' ? (
          <form onSubmit={handleCheckMobile} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-slate-800 mb-1">
                Student mobile number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
                <input
                  id="mobile"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(normalizeMobile(e.target.value))}
                  placeholder="10-digit mobile number"
                  className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-base focus:ring-2 focus:ring-[#0f2744]/20 focus:border-[#0f2744] outline-none"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Use the same number you registered with on GuideXpert.
              </p>
            </div>
            {error ? (
              <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#0f2744] text-white font-semibold hover:bg-[#1a3a5c] disabled:opacity-60"
            >
              {loading ? 'Checking…' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleBook} className="space-y-6">
            {student ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-[#0f2744] font-semibold mb-3">
                  <FiUsers aria-hidden />
                  Your details
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-slate-500">Name</dt>
                    <dd className="font-medium text-slate-900">{student.studentName}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Class</dt>
                    <dd className="font-medium text-slate-900">{student.currentClass}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">City</dt>
                    <dd className="font-medium text-slate-900">{student.city || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Language</dt>
                    <dd className="font-medium text-slate-900">{student.preferredLanguage}</dd>
                  </div>
                </dl>
              </div>
            ) : null}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-[#0f2744] font-semibold mb-3">
                <FiCalendar aria-hidden />
                Book a slot
              </div>
              {slots.length === 0 ? (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  No slots are available right now. Please contact the GuideXpert team.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {slots.map((slot) => (
                    <label
                      key={slot.id}
                      className={`cursor-pointer rounded-xl border p-4 transition ${
                        selectedSlotId === slot.id
                          ? 'border-[#0f2744] ring-2 ring-[#0f2744]/20 bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="slot"
                        value={slot.id}
                        checked={selectedSlotId === slot.id}
                        onChange={() => setSelectedSlotId(slot.id)}
                        className="sr-only"
                      />
                      <p className="font-semibold text-slate-900">{slot.sessionTitle}</p>
                      <p className="text-sm text-slate-600 mt-1">
                        {slot.slotDate} · {slot.slotTime}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {slot.counselorName}
                        {slot.collegeName ? ` · ${slot.collegeName}` : ''}
                      </p>
                      <p className="text-xs text-emerald-700 mt-1">{slot.spotsLeft} spots left</p>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={parentConfirmed}
                  onChange={(e) => setParentConfirmed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0f2744]"
                />
                <span className="text-sm text-slate-800">
                  I confirm that I will attend the guidance session with my parent.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappConsent}
                  onChange={(e) => setWhatsappConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0f2744]"
                />
                <span className="text-sm text-slate-800">
                  I agree to receive session updates and reminders through WhatsApp.
                </span>
              </label>
            </div>

            {error ? (
              <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep('mobile');
                  setError('');
                }}
                className="py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-medium"
              >
                Change number
              </button>
              <button
                type="submit"
                disabled={loading || slots.length === 0}
                className="flex-1 py-3 rounded-xl bg-[#0f2744] text-white font-semibold hover:bg-[#1a3a5c] disabled:opacity-60"
              >
                {loading ? 'Booking…' : 'Confirm booking'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
