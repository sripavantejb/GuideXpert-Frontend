import { useCallback, useEffect, useMemo, useState } from 'react';
import MobileOtpField from '../components/forms/MobileOtpField';
import {
  ChoiceGroup,
  FormInput,
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
import {
  getOneOnOneCounselingSlots,
  msUntilNextISTMidnight,
} from '../utils/oneOnOneCounselingSlots';
import { captureUtmFirstTouch, getStoredUtm } from '../utils/utm';
import {
  hasValidationErrors,
  validateOneOnOneForm,
} from '../utils/oneOnOneCounselingValidation';

function SuccessView() {
  return (
    <div className="rounded-[14px] border-2 border-[#0F172A] bg-white p-8 text-center shadow-[6px_6px_0px_#0F172A] sm:p-12">
      <p className="mb-3 inline-flex rounded border-2 border-emerald-800 bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-900">
        Booking received
      </p>
      <h2 className="text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl">You&apos;re all set!</h2>
      <p className="mx-auto mt-4 max-w-lg text-sm font-medium leading-relaxed text-slate-600">
        Thank you! Our GuideXpert team will contact you shortly on WhatsApp.
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

  const utm = useMemo(() => getStoredUtm(), []);
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
    captureUtmFirstTouch();
  }, []);

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
    if (
      form.preferredTimeSlot &&
      !sessionSlotOptions.some((o) => o.value === form.preferredTimeSlot)
    ) {
      nextErrors.preferredTimeSlot = 'Please select a valid session slot (next 2 days, IST).';
    }
    setErrors(nextErrors);
    if (hasValidationErrors(nextErrors)) {
      setSubmitError('Please fix the highlighted fields before submitting.');
      return;
    }

    setSubmitting(true);
    try {
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
        ...(utm || {}),
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
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <NeoField label="1. Student Name" error={errors.studentName} className="sm:col-span-2">
                  <FormInput
                    id="studentName"
                    name="studentName"
                    autoComplete="name"
                    value={form.studentName}
                    onChange={(e) => setField('studentName', e.target.value)}
                    error={errors.studentName}
                    placeholder="Full name"
                  />
                </NeoField>

                <MobileOtpField
                  label="2. Mobile Number"
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
                />

                <NeoField label="4. City / Town" error={errors.city}>
                  <FormInput
                    id="city"
                    name="city"
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={(e) => setField('city', e.target.value)}
                    error={errors.city}
                    placeholder="e.g. Hyderabad, Vijayawada"
                  />
                </NeoField>

                <NeoField label="5. Entrance Exam Rank" error={errors.entranceExamRank} className="sm:col-span-2">
                  <FormInput
                    id="entranceExamRank"
                    name="entranceExamRank"
                    value={form.entranceExamRank}
                    onChange={(e) => setField('entranceExamRank', e.target.value)}
                    error={errors.entranceExamRank}
                    placeholder="e.g. JEE Main rank / EAMCET rank / Not appeared yet"
                  />
                </NeoField>

                <NeoField label="6. Parent Name" error={errors.parentName}>
                  <FormInput
                    id="parentName"
                    name="parentName"
                    value={form.parentName}
                    onChange={(e) => setField('parentName', e.target.value)}
                    error={errors.parentName}
                    placeholder="Parent / guardian name"
                  />
                </NeoField>

                <NeoField label="7. Parent Mobile Number" error={errors.parentMobileNumber}>
                  <FormInput
                    id="parentMobileNumber"
                    name="parentMobileNumber"
                    inputMode="numeric"
                    value={form.parentMobileNumber}
                    onChange={(e) => handleMobileChange('parentMobileNumber', e.target.value)}
                    error={errors.parentMobileNumber}
                    placeholder="10-digit number"
                    maxLength={10}
                  />
                </NeoField>

                <ChoiceGroup
                  label="8. Who Will Attend the Session?"
                  name="sessionAttendee"
                  className="sm:col-span-2"
                  options={SESSION_ATTENDEE_OPTIONS}
                  value={form.sessionAttendee}
                  onChange={(value) => setField('sessionAttendee', value)}
                  error={errors.sessionAttendee}
                />

                <ChoiceGroup
                  label="9. Interested Branch"
                  name="interestedBranch"
                  options={INTERESTED_BRANCH_OPTIONS}
                  value={form.interestedBranch}
                  onChange={(value) => setField('interestedBranch', value)}
                  error={errors.interestedBranch}
                />

                <ChoiceGroup
                  label="10. College Budget"
                  name="collegeBudget"
                  options={COLLEGE_BUDGET_OPTIONS}
                  value={form.collegeBudget}
                  onChange={(value) => setField('collegeBudget', value)}
                  error={errors.collegeBudget}
                />

                <ChoiceGroup
                  label="11. Biggest Concern"
                  name="biggestConcern"
                  layout="grid"
                  className="sm:col-span-2"
                  options={BIGGEST_CONCERN_OPTIONS}
                  value={form.biggestConcern}
                  onChange={(value) => setField('biggestConcern', value)}
                  error={errors.biggestConcern}
                />

                <ChoiceGroup
                  label="12. Preferred Language"
                  name="preferredLanguage"
                  options={PREFERRED_LANGUAGE_OPTIONS}
                  value={form.preferredLanguage}
                  onChange={(value) => setField('preferredLanguage', value)}
                  error={errors.preferredLanguage}
                />

                <SessionSlotPicker
                  label="13. Preferred Session Slot"
                  name="preferredTimeSlot"
                  options={sessionSlotOptions}
                  value={form.preferredTimeSlot}
                  onChange={(value) => setField('preferredTimeSlot', value)}
                  error={errors.preferredTimeSlot}
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
                  disabled={submitting || !otpVerified}
                  title={!otpVerified ? 'Verify your mobile number with OTP to continue' : undefined}
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
