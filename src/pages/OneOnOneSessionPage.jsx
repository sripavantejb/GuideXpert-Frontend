import { useCallback, useEffect, useMemo, useState } from 'react';
import MobileOtpField from '../components/forms/MobileOtpField';
import {
  ChoiceGroup,
  FormInput,
  FormSelect,
  FormTextarea,
  NeoField,
} from '../components/oneOnOneSession/FormControls';
import SessionSlotPicker from '../components/oneOnOneSession/SessionSlotPicker';
import {
  BIGGEST_CONCERN_OPTIONS,
  COLLEGE_BUDGET_OPTIONS,
  CURRENT_CLASS_OPTIONS,
  INITIAL_FORM_STATE,
  INTERESTED_BRANCH_OPTIONS,
  PREFERRED_LANGUAGE_OPTIONS,
  SESSION_ATTENDEE_OPTIONS,
} from '../constants/oneOnOneCounselingForm';
import { submitOneOnOneCounselingLead } from '../utils/api';
import { getApiBaseUrl } from '../utils/apiBaseUrl';
import {
  getOneOnOneCounselingSlots,
  msUntilNextISTMidnight,
} from '../utils/oneOnOneCounselingSlots';
import { resolveUtmAttribution, trackOneOnOneSessionVisit } from '../utils/oneOnOneSessionTracking';
import {
  hasValidationErrors,
  validateOneOnOneForm,
} from '../utils/oneOnOneCounselingValidation';

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
        Booking successful
      </p>
      <h2 className="text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl">
        Your session request is confirmed
      </h2>
      <p className="mx-auto mt-4 max-w-lg text-sm font-medium leading-relaxed text-slate-600">
        Thank you for booking your free 1-on-1 IITian career counseling session with GuideXpert.
      </p>

      <div className="mx-auto mt-8 max-w-xl rounded-[12px] border-2 border-[#0F172A] bg-[#c7f36b] p-5 text-left shadow-[4px_4px_0px_#0F172A] sm:p-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]/80">
          What happens next
        </p>
        <p className="mt-2 text-base font-black leading-snug text-[#0F172A] sm:text-lg">
          Our executive will get in touch with you shortly on WhatsApp for the exact confirmation of
          your preferred session slot.
        </p>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-[#0F172A]/85">
          The time you selected is your preference — we will confirm the final slot with you before
          the session.
        </p>
      </div>

      <p className="mx-auto mt-6 max-w-md text-xs font-bold uppercase tracking-wide text-slate-500">
        Keep WhatsApp notifications on so you don&apos;t miss our message.
      </p>
    </div>
  );
}

export default function OneOnOneSessionPage() {
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [slotOptionsTick, setSlotOptionsTick] = useState(0);
  const [visitorFingerprint, setVisitorFingerprint] = useState('');

  const apiBase = useMemo(() => getApiBaseUrl(), []);
  const sessionSlotOptions = useMemo(() => {
    void slotOptionsTick;
    return getOneOnOneCounselingSlots();
  }, [slotOptionsTick]);
  const handleOtpVerifiedChange = useCallback((verified) => {
    setOtpVerified(verified);
    if (verified) {
      setErrors((prev) => ({ ...prev, mobileNumber: '' }));
    }
  }, []);

  useEffect(() => {
    document.title = 'Book 1-on-1 IITian Career Counseling | GuideXpert';
    let cancelled = false;
    const utmPayload = resolveUtmAttribution();
    trackOneOnOneSessionVisit(apiBase, utmPayload).then((fingerprint) => {
      if (!cancelled && fingerprint) setVisitorFingerprint(fingerprint);
    });
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  useEffect(() => {
    const bump = () => setSlotOptionsTick((t) => t + 1);
    const intervalId = window.setInterval(bump, 60_000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') bump();
    };
    document.addEventListener('visibilitychange', onVisibility);

    let cancelled = false;
    let midnightTimerId;
    const scheduleMidnightRefresh = () => {
      midnightTimerId = window.setTimeout(() => {
        if (cancelled) return;
        bump();
        scheduleMidnightRefresh();
      }, msUntilNextISTMidnight());
    };
    scheduleMidnightRefresh();

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearTimeout(midnightTimerId);
    };
  }, []);

  useEffect(() => {
    if (!form.preferredTimeSlot) return;
    if (!sessionSlotOptions.some((o) => o.value === form.preferredTimeSlot)) {
      setForm((prev) => ({ ...prev, preferredTimeSlot: '' }));
    }
  }, [sessionSlotOptions, form.preferredTimeSlot]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleMobileChange = (key, raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    setField(key, digits);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const nextErrors = validateOneOnOneForm(form);
    if (!otpVerified) {
      nextErrors.mobileNumber = 'Please verify your mobile number with OTP first.';
    }
    if (!form.preferredTimeSlot?.trim()) {
      nextErrors.preferredTimeSlot =
        nextErrors.preferredTimeSlot || 'Please select a session slot';
    } else if (!sessionSlotOptions.some((o) => o.value === form.preferredTimeSlot)) {
      nextErrors.preferredTimeSlot = 'Please select a valid session slot (next 2 days, IST).';
    }
    setErrors(nextErrors);
    if (hasValidationErrors(nextErrors)) {
      setSubmitError('Please complete all required fields before submitting.');
      requestAnimationFrame(() => {
        document
          .querySelector('[aria-invalid="true"]')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }

    setSubmitting(true);
    try {
      const utmPayload = resolveUtmAttribution();
      let fingerprint = visitorFingerprint;
      if (!fingerprint) {
        fingerprint = await trackOneOnOneSessionVisit(apiBase, utmPayload);
        if (fingerprint) setVisitorFingerprint(fingerprint);
      }

      const payload = {
        studentName: form.studentName.trim(),
        mobileNumber: form.mobileNumber.replace(/\D/g, ''),
        parentName: form.parentName.trim(),
        parentMobileNumber: form.parentMobileNumber.replace(/\D/g, ''),
        sessionAttendee: form.sessionAttendee,
        currentClass: form.currentClass,
        city: form.city.trim(),
        entranceExamRank: form.entranceExamRank.trim(),
        interestedBranch: form.interestedBranch,
        collegeBudget: form.collegeBudget,
        biggestConcern: form.biggestConcern,
        preferredLanguage: form.preferredLanguage,
        preferredTimeSlot: form.preferredTimeSlot,
        additionalQuestions: form.additionalQuestions.trim() || undefined,
        ...utmPayload,
        ...(fingerprint ? { visitorFingerprint: fingerprint } : {}),
      };

      const result = await submitOneOnOneCounselingLead(payload);
      if (result.success) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSubmitError(result.message || 'Unable to submit. Please try again.');
      }
    } catch {
      setSubmitError('Connection issue. Please check your network and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-10 selection:bg-[#c7f36b] selection:text-[#0F172A] sm:px-6">
      <div className="mx-auto max-w-4xl">
        {!submitted ? (
          <>
            <div className="mb-6 rounded-[14px] border-2 border-[#0F172A] bg-[#0F172A] p-6 text-white shadow-[6px_6px_0px_#c7f36b]">
              <p className="mb-2 inline-flex rounded border border-slate-600 bg-[#1E293B] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-300">
                1-on-1 Career Counseling
              </p>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Book Your 1-on-1 IITian Career Counseling Session
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-300">
                Get clarity on college selection, branch selection, placements, fees, and future career
                options — guided by experienced IITians.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide text-slate-200">
                <li className="rounded border border-slate-600 bg-[#1E293B] px-2 py-1">1-on-1 personalized</li>
                <li className="rounded border border-emerald-800 bg-emerald-950/60 px-2 py-1 text-emerald-100">
                  100% free counseling
                </li>
              </ul>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-[14px] border-2 border-[#0F172A] bg-white p-5 shadow-[6px_6px_0px_#0F172A] sm:p-7"
              noValidate
            >
              <p className="mb-4 text-xs font-semibold text-slate-600">
                Fields marked with <span className="text-red-700">*</span> are required.
              </p>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <NeoField
                  label="1. Student Name"
                  error={errors.studentName}
                  className="sm:col-span-2"
                  required
                >
                  <FormInput
                    id="studentName"
                    name="studentName"
                    autoComplete="name"
                    required
                    value={form.studentName}
                    onChange={(e) => setField('studentName', e.target.value)}
                    error={errors.studentName}
                    placeholder="Full name"
                  />
                </NeoField>

                <MobileOtpField
                  label="2. Mobile Number"
                  required
                  fullName={form.studentName}
                  mobileNumber={form.mobileNumber}
                  onMobileChange={(digits) => setField('mobileNumber', digits)}
                  error={errors.mobileNumber}
                  onVerifiedChange={handleOtpVerifiedChange}
                  occupation="1-on-1 Counseling"
                />

                <ChoiceGroup
                  label="3. Current Class"
                  name="currentClass"
                  options={CURRENT_CLASS_OPTIONS}
                  value={form.currentClass}
                  onChange={(value) => setField('currentClass', value)}
                  error={errors.currentClass}
                  required
                />

                <NeoField label="4. City / Town" error={errors.city} required>
                  <FormInput
                    id="city"
                    name="city"
                    autoComplete="address-level2"
                    required
                    value={form.city}
                    onChange={(e) => setField('city', e.target.value)}
                    error={errors.city}
                    placeholder="e.g. Hyderabad, Vijayawada"
                  />
                </NeoField>

                <NeoField
                  label="5. Entrance Exam Rank"
                  error={errors.entranceExamRank}
                  className="sm:col-span-2"
                  required
                >
                  <FormInput
                    id="entranceExamRank"
                    name="entranceExamRank"
                    required
                    value={form.entranceExamRank}
                    onChange={(e) => setField('entranceExamRank', e.target.value)}
                    error={errors.entranceExamRank}
                    placeholder="e.g. JEE Main rank / EAMCET rank / Not appeared yet"
                  />
                </NeoField>

                <NeoField label="6. Parent Name" error={errors.parentName} required>
                  <FormInput
                    id="parentName"
                    name="parentName"
                    required
                    value={form.parentName}
                    onChange={(e) => setField('parentName', e.target.value)}
                    error={errors.parentName}
                    placeholder="Parent / guardian name"
                  />
                </NeoField>

                <NeoField label="7. Parent Mobile Number" error={errors.parentMobileNumber} required>
                  <FormInput
                    id="parentMobileNumber"
                    name="parentMobileNumber"
                    inputMode="numeric"
                    required
                    value={form.parentMobileNumber}
                    onChange={(e) => handleMobileChange('parentMobileNumber', e.target.value)}
                    error={errors.parentMobileNumber}
                    placeholder="10-digit number"
                    maxLength={10}
                  />
                </NeoField>

                <NeoField
                  label="8. Who Will Attend the Session?"
                  error={errors.sessionAttendee}
                  className="sm:col-span-2"
                  required
                >
                  <FormSelect
                    id="sessionAttendee"
                    name="sessionAttendee"
                    required
                    value={form.sessionAttendee}
                    onChange={(e) => setField('sessionAttendee', e.target.value)}
                    error={errors.sessionAttendee}
                    options={SESSION_ATTENDEE_OPTIONS}
                    placeholder="Select who will attend"
                  />
                </NeoField>

                <NeoField label="9. Interested Branch" error={errors.interestedBranch} required>
                  <FormSelect
                    id="interestedBranch"
                    name="interestedBranch"
                    required
                    value={form.interestedBranch}
                    onChange={(e) => setField('interestedBranch', e.target.value)}
                    error={errors.interestedBranch}
                    options={INTERESTED_BRANCH_OPTIONS}
                    placeholder="Select branch"
                  />
                </NeoField>

                <NeoField label="10. College Budget" error={errors.collegeBudget} required>
                  <FormSelect
                    id="collegeBudget"
                    name="collegeBudget"
                    required
                    value={form.collegeBudget}
                    onChange={(e) => setField('collegeBudget', e.target.value)}
                    error={errors.collegeBudget}
                    options={COLLEGE_BUDGET_OPTIONS}
                    placeholder="Select budget"
                  />
                </NeoField>

                <NeoField
                  label="11. Biggest Concern"
                  error={errors.biggestConcern}
                  className="sm:col-span-2"
                  required
                >
                  <FormSelect
                    id="biggestConcern"
                    name="biggestConcern"
                    required
                    value={form.biggestConcern}
                    onChange={(e) => setField('biggestConcern', e.target.value)}
                    error={errors.biggestConcern}
                    options={BIGGEST_CONCERN_OPTIONS}
                    placeholder="Select your biggest concern"
                  />
                </NeoField>

                <ChoiceGroup
                  label="12. Preferred Language"
                  name="preferredLanguage"
                  options={PREFERRED_LANGUAGE_OPTIONS}
                  value={form.preferredLanguage}
                  onChange={(value) => setField('preferredLanguage', value)}
                  error={errors.preferredLanguage}
                  required
                />

                <SessionSlotPicker
                  label="13. Preferred Session Slot"
                  name="preferredTimeSlot"
                  options={sessionSlotOptions}
                  value={form.preferredTimeSlot}
                  onChange={(value) => setField('preferredTimeSlot', value)}
                  error={errors.preferredTimeSlot}
                  required
                />
                <p className="-mt-2 text-xs font-semibold text-slate-600 sm:col-span-2">
                  3-hour slots from 9 AM–9 PM (IST) for the next 2 calendar days. Slots update at
                  12:00 AM IST.
                </p>

                <NeoField
                  label="14. Additional Questions (optional)"
                  error={errors.additionalQuestions}
                  className="sm:col-span-2"
                >
                  <FormTextarea
                    id="additionalQuestions"
                    name="additionalQuestions"
                    value={form.additionalQuestions}
                    onChange={(e) => setField('additionalQuestions', e.target.value)}
                    error={errors.additionalQuestions}
                    placeholder="Any specific questions for our counselor?"
                  />
                </NeoField>
              </div>

              {submitError ? (
                <p className="mt-5 rounded-[10px] border-2 border-red-900 bg-red-100 px-4 py-3 text-sm font-bold text-red-900">
                  {submitError}
                </p>
              ) : null}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  We&apos;ll contact you on WhatsApp to confirm your session.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-[14px] border-2 border-[#0F172A] bg-[#c7f36b] px-6 py-3 text-sm font-black uppercase tracking-wide text-[#0F172A] shadow-[4px_4px_0px_#0F172A] transition-all hover:-translate-y-0.5 hover:bg-[#b0d95d] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Booking…' : 'Book My Free Counseling Session'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <SuccessView />
        )}
      </div>
    </div>
  );
}
