import { useCallback, useEffect, useRef, useState } from 'react';
import MobileOtpField from '../components/forms/MobileOtpField';
import { FormInput, FormSelect, NeoField } from '../components/oneOnOneSession/FormControls';
import GuidanceSlotPicker from '../components/oneOnOneSession/GuidanceSlotPicker';
import { COLLEGE_BUDGET_OPTIONS, CURRENT_CLASS_OPTIONS, PREFERRED_LANGUAGE_OPTIONS } from '../constants/oneOnOneCounselingForm';
import { bookGuidanceSlot, checkGuidanceMobile, getGuidanceActiveSlots } from '../utils/guidanceBookingApi';
import { captureUtmFirstTouch, getStoredUtm } from '../utils/utm';

function normalizeMobile(val) {
  return String(val || '')
    .replace(/\D/g, '')
    .slice(-10)
    .slice(0, 10);
}

function prefillColleges(student) {
  const list = Array.isArray(student?.preferredColleges) ? student.preferredColleges : [];
  return {
    college1: list[0] || '',
    college2: list[1] || '',
    college3: list[2] || '',
  };
}

function validateCounselingPreferences({
  collegeBudget,
  parentOccupation,
  preferredCollege1,
  preferredCollege2,
  preferredCollege3,
}) {
  const errors = {};
  if (!COLLEGE_BUDGET_OPTIONS.includes(collegeBudget)) {
    errors.collegeBudget = 'Please select college budget per year.';
  }
  const occ = String(parentOccupation || '').trim();
  if (occ.length < 2) {
    errors.parentOccupation = 'Please enter parent occupation.';
  }
  const colleges = [preferredCollege1, preferredCollege2, preferredCollege3]
    .map((s) => String(s || '').trim())
    .filter(Boolean);
  if (colleges.length < 1) {
    errors.preferredColleges = 'Please enter at least one preferred college.';
  }
  return { errors, preferredColleges: colleges };
}

function validateStudentProfile({ studentName, currentClass, city, preferredLanguage }) {
  const errors = {};
  const name = String(studentName || '').trim();
  if (name.length < 2 || name.length > 100) {
    errors.studentName = 'Student name must be 2–100 characters.';
  }
  if (!CURRENT_CLASS_OPTIONS.includes(currentClass)) {
    errors.currentClass = 'Please select your current class.';
  }
  const cityVal = String(city || '').trim();
  if (cityVal.length < 2 || cityVal.length > 80) {
    errors.city = 'City / town must be 2–80 characters.';
  }
  if (!PREFERRED_LANGUAGE_OPTIONS.includes(preferredLanguage)) {
    errors.preferredLanguage = 'Please select a preferred language.';
  }
  return errors;
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

function StudentDetailsForm({
  mobile,
  studentName,
  setStudentName,
  currentClass,
  setCurrentClass,
  city,
  setCity,
  preferredLanguage,
  setPreferredLanguage,
  fieldErrors,
}) {
  return (
    <div className="space-y-5 sm:col-span-2">
      <p className="text-sm font-black uppercase tracking-wide text-[#0F172A]">
        Your details <span className="text-red-700">*</span>
      </p>
      <p className="text-xs font-medium text-slate-500">
        Fill in your details below to complete your guidance session booking.
      </p>

      <NeoField label="Mobile number" className="sm:col-span-2">
        <FormInput
          id="guidance-mobile-readonly"
          name="mobileReadonly"
          type="tel"
          value={mobile}
          readOnly
          disabled
          className="bg-slate-100"
        />
      </NeoField>

      <NeoField label="Student name" error={fieldErrors.studentName} required>
        <FormInput
          id="guidance-studentName"
          name="studentName"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          error={fieldErrors.studentName}
          placeholder="Your full name"
          maxLength={100}
        />
      </NeoField>

      <NeoField label="Current class" error={fieldErrors.currentClass} required>
        <FormSelect
          id="guidance-currentClass"
          name="currentClass"
          value={currentClass}
          onChange={(e) => setCurrentClass(e.target.value)}
          error={fieldErrors.currentClass}
          options={CURRENT_CLASS_OPTIONS}
          placeholder="Select class"
        />
      </NeoField>

      <NeoField label="City / town" error={fieldErrors.city} required>
        <FormInput
          id="guidance-city"
          name="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          error={fieldErrors.city}
          placeholder="e.g. Hyderabad"
          maxLength={80}
        />
      </NeoField>

      <NeoField label="Preferred language" error={fieldErrors.preferredLanguage} required>
        <FormSelect
          id="guidance-preferredLanguage"
          name="preferredLanguage"
          value={preferredLanguage}
          onChange={(e) => setPreferredLanguage(e.target.value)}
          error={fieldErrors.preferredLanguage}
          options={PREFERRED_LANGUAGE_OPTIONS}
          placeholder="Select language"
        />
      </NeoField>
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

function CounselingPreferencesSection({
  collegeBudget,
  setCollegeBudget,
  parentOccupation,
  setParentOccupation,
  preferredCollege1,
  setPreferredCollege1,
  preferredCollege2,
  setPreferredCollege2,
  preferredCollege3,
  setPreferredCollege3,
  fieldErrors,
}) {
  return (
    <div className="space-y-5 sm:col-span-2">
      <p className="text-sm font-black uppercase tracking-wide text-[#0F172A]">
        Counseling preferences <span className="text-red-700">*</span>
      </p>

      <NeoField
        label="College budget per year"
        error={fieldErrors.collegeBudget}
        required
        className="sm:col-span-2"
      >
        <FormSelect
          id="guidance-collegeBudget"
          name="collegeBudget"
          required
          value={collegeBudget}
          onChange={(e) => setCollegeBudget(e.target.value)}
          error={fieldErrors.collegeBudget}
          options={COLLEGE_BUDGET_OPTIONS}
          placeholder="Select budget"
        />
      </NeoField>

      <NeoField label="Parent occupation" error={fieldErrors.parentOccupation} required>
        <FormInput
          id="guidance-parentOccupation"
          name="parentOccupation"
          value={parentOccupation}
          onChange={(e) => setParentOccupation(e.target.value)}
          error={fieldErrors.parentOccupation}
          placeholder="e.g. Business, Government employee, Homemaker"
          maxLength={120}
        />
      </NeoField>

      <div className="sm:col-span-2">
        <p className="mb-3 text-sm font-black uppercase tracking-wide text-[#0F172A]">
          Preferred colleges <span className="text-red-700">*</span>
        </p>
        {fieldErrors.preferredColleges ? (
          <p className="mb-2 text-xs font-bold text-red-700">{fieldErrors.preferredColleges}</p>
        ) : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NeoField label="College 1">
            <FormInput
              id="guidance-college1"
              name="preferredCollege1"
              value={preferredCollege1}
              onChange={(e) => setPreferredCollege1(e.target.value)}
              placeholder="e.g. IIT Hyderabad"
              maxLength={150}
            />
          </NeoField>
          <NeoField label="College 2">
            <FormInput
              id="guidance-college2"
              name="preferredCollege2"
              value={preferredCollege2}
              onChange={(e) => setPreferredCollege2(e.target.value)}
              placeholder="e.g. NIT Warangal"
              maxLength={150}
            />
          </NeoField>
          <NeoField label="College 3">
            <FormInput
              id="guidance-college3"
              name="preferredCollege3"
              value={preferredCollege3}
              onChange={(e) => setPreferredCollege3(e.target.value)}
              placeholder="e.g. BITS Pilani"
              maxLength={150}
            />
          </NeoField>
        </div>
        <p className="mt-2 text-xs font-medium text-slate-500">
          Enter at least one college you are interested in.
        </p>
      </div>
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [needsProfile, setNeedsProfile] = useState(false);
  const [student, setStudent] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [currentClass, setCurrentClass] = useState('');
  const [city, setCity] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [collegeBudget, setCollegeBudget] = useState('');
  const [parentOccupation, setParentOccupation] = useState('');
  const [preferredCollege1, setPreferredCollege1] = useState('');
  const [preferredCollege2, setPreferredCollege2] = useState('');
  const [preferredCollege3, setPreferredCollege3] = useState('');
  const [parentConfirmed, setParentConfirmed] = useState(false);
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [success, setSuccess] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const pendingCheckRef = useRef(null);

  useEffect(() => {
    document.title = 'Confirm Your Guidance Session Slot | GuideXpert';
    captureUtmFirstTouch();
  }, []);

  const resetOtpState = useCallback(() => {
    setOtpRequired(false);
    setOtpVerified(false);
    pendingCheckRef.current = null;
  }, []);

  const applyStudentPrefill = (s) => {
    setStudent(s);
    setCollegeBudget(s?.collegeBudget || '');
    setParentOccupation(s?.parentOccupation || '');
    const c = prefillColleges(s);
    setPreferredCollege1(c.college1);
    setPreferredCollege2(c.college2);
    setPreferredCollege3(c.college3);
  };

  const resetNewStudentProfile = () => {
    setStudent(null);
    setNeedsProfile(true);
    setStudentName('');
    setCurrentClass('');
    setCity('');
    setPreferredLanguage('');
    setCollegeBudget('');
    setParentOccupation('');
    setPreferredCollege1('');
    setPreferredCollege2('');
    setPreferredCollege3('');
  };

  const goToBookingStep = (nextSlots) => {
    setSlots(nextSlots);
    setStep('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const proceedWithCheckResult = useCallback((res) => {
    if (res.found) {
      applyStudentPrefill(res.data?.student || null);
      setNeedsProfile(false);
      setStudentName('');
      setCurrentClass('');
      setCity('');
      setPreferredLanguage('');
    } else {
      resetNewStudentProfile();
    }
    goToBookingStep(res.data?.slots || []);
    resetOtpState();
  }, [resetOtpState]);

  const handleOtpVerifiedChange = useCallback(
    (verified) => {
      setOtpVerified(verified);
      if (verified && pendingCheckRef.current) {
        const pending = pendingCheckRef.current;
        pendingCheckRef.current = null;
        proceedWithCheckResult(pending);
      }
    },
    [proceedWithCheckResult]
  );

  const handleCheckMobile = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    const digits = normalizeMobile(mobile);
    if (digits.length !== 10) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    setLoading(true);
    const res = await checkGuidanceMobile(digits);
    setLoading(false);

    if (!res.success) {
      const legacyNotFound =
        res.status === 404 &&
        /not found/i.test(String(res.message || ''));
      if (legacyNotFound) {
        setLoading(true);
        const slotsRes = await getGuidanceActiveSlots();
        setLoading(false);
        if (!slotsRes.success) {
          setError(slotsRes.message || 'Something went wrong. Please try again.');
          setStudent(null);
          setSlots([]);
          return;
        }
        const legacyRes = {
          success: true,
          found: false,
          needsProfile: true,
          needsOtp: true,
          data: { slots: slotsRes.data || [] },
        };
        if (!otpVerified) {
          pendingCheckRef.current = legacyRes;
          setOtpRequired(true);
          return;
        }
        proceedWithCheckResult(legacyRes);
        return;
      }
      setError(res.message || 'Something went wrong. Please try again.');
      setStudent(null);
      setSlots([]);
      return;
    }

    if (res.alreadyBooked) {
      setError(res.message || 'A slot is already booked with this mobile number.');
      applyStudentPrefill(res.data?.student || null);
      setNeedsProfile(false);
      setSlots([]);
      return;
    }

    if (res.needsOtp && !otpVerified) {
      pendingCheckRef.current = res;
      setOtpRequired(true);
      return;
    }

    proceedWithCheckResult(res);
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setError('');
    setSlotError('');
    setFieldErrors({});

    let profileErrors = {};
    if (needsProfile) {
      profileErrors = validateStudentProfile({
        studentName,
        currentClass,
        city,
        preferredLanguage,
      });
    }

    const { errors, preferredColleges } = validateCounselingPreferences({
      collegeBudget,
      parentOccupation,
      preferredCollege1,
      preferredCollege2,
      preferredCollege3,
    });
    const allErrors = { ...profileErrors, ...errors };
    if (Object.keys(allErrors).length > 0) {
      setFieldErrors(allErrors);
      return;
    }
    if (!selectedSlotId) {
      setSlotError('Please select a session slot.');
      return;
    }
    if (!parentConfirmed || !whatsappConsent) {
      setError('Please confirm parent attendance and WhatsApp consent.');
      return;
    }
    setLoading(true);
    const utm = getStoredUtm();
    const payload = {
      mobileNumber: normalizeMobile(mobile),
      slotId: selectedSlotId,
      parentAttendanceConfirmed: true,
      whatsappConsent: true,
      collegeBudget,
      parentOccupation: parentOccupation.trim(),
      preferredColleges,
      ...(needsProfile
        ? {
            studentName: studentName.trim(),
            currentClass,
            city: city.trim(),
            preferredLanguage,
          }
        : {}),
      ...(utm || {}),
    };
    const res = await bookGuidanceSlot(payload);
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
                Enter your mobile number, share your details and counseling preferences, choose a
                slot, and confirm with your parent.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide text-slate-200">
                <li className="rounded border border-slate-600 bg-[#1E293B] px-2 py-1">
                  Direct booking available
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
                {otpRequired ? (
                  <p className="mb-4 text-xs font-semibold text-slate-600">
                    Verify your mobile number to continue booking.
                  </p>
                ) : (
                  <p className="mb-4 text-xs font-semibold text-slate-600">
                    New here? You can book directly below. Already filled the{' '}
                    <a
                      href="/one-on-one-session"
                      className="font-bold text-[#0F172A] underline underline-offset-2"
                    >
                      1-on-1 session form
                    </a>
                    ? We will prefill your details when we find your number.
                  </p>
                )}

                {otpRequired ? (
                  <MobileOtpField
                    label="Student mobile number"
                    mobileNumber={mobile}
                    onMobileChange={(digits) => {
                      setMobile(digits);
                      setOtpVerified(false);
                      pendingCheckRef.current = null;
                    }}
                    error={error}
                    onVerifiedChange={handleOtpVerifiedChange}
                    requireName={false}
                    occupation="Guidance Session Booking"
                  />
                ) : (
                  <NeoField label="Student mobile number" error={error} required className="sm:col-span-2">
                    <FormInput
                      id="guidance-mobile"
                      name="mobile"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => {
                        setMobile(normalizeMobile(e.target.value));
                        resetOtpState();
                      }}
                      error={error}
                      placeholder="10-digit mobile number"
                    />
                  </NeoField>
                )}

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={loading || (otpRequired && !otpVerified)}
                    title={
                      otpRequired && !otpVerified
                        ? 'Verify your mobile number with OTP to continue'
                        : undefined
                    }
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
                  {needsProfile ? (
                    <StudentDetailsForm
                      mobile={normalizeMobile(mobile)}
                      studentName={studentName}
                      setStudentName={setStudentName}
                      currentClass={currentClass}
                      setCurrentClass={setCurrentClass}
                      city={city}
                      setCity={setCity}
                      preferredLanguage={preferredLanguage}
                      setPreferredLanguage={setPreferredLanguage}
                      fieldErrors={fieldErrors}
                    />
                  ) : (
                    <StudentDetailsCard student={student} />
                  )}

                  <CounselingPreferencesSection
                    collegeBudget={collegeBudget}
                    setCollegeBudget={setCollegeBudget}
                    parentOccupation={parentOccupation}
                    setParentOccupation={setParentOccupation}
                    preferredCollege1={preferredCollege1}
                    setPreferredCollege1={setPreferredCollege1}
                    preferredCollege2={preferredCollege2}
                    setPreferredCollege2={setPreferredCollege2}
                    preferredCollege3={preferredCollege3}
                    setPreferredCollege3={setPreferredCollege3}
                    fieldErrors={fieldErrors}
                  />

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
                      setNeedsProfile(false);
                      setError('');
                      setSlotError('');
                      setFieldErrors({});
                      resetOtpState();
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
