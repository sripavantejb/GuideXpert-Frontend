import { useEffect, useMemo, useState } from 'react';

const STUDENT_PARENT_OPTIONS = ['Student', 'Parent'];
const CLASS_OPTIONS = ['12th Appearing', '12th Passed'];
const STREAM_OPTIONS = ['MPC', 'BiPC', 'Commerce', 'Others'];
const SLOT_BOOKING_OPTIONS = ['Yes', 'No', 'Need another time'];
const CAREER_DECISION_OPTIONS = ['Very clear', 'Somewhat clear', 'Completely confused'];
const COLLEGE_DECISION_OPTIONS = ['Self', 'Parents', 'Both'];
const BUDGET_OPTIONS = ['<1L', '1-3L', '3-6L', '6L+'];
const COLLEGE_PRIORITY_OPTIONS = ['Placements', 'Brand', 'Fees', 'Skills', 'Abroad opportunities', 'All the above'];
const HELP_OPTIONS = ['Scholarship Test', 'Career Counseling with IITian', 'How to choose the right college', 'Not sure'];
const ONE_TO_ONE_OPTIONS = ['Yes', 'Maybe', 'No'];
const CONFUSION_OPTIONS = ['Course', 'College', 'Placements', 'Parent pressure', 'Not sure'];

const initialFormData = {
  fullName: '',
  mobileNumber: '',
  studentOrParent: '',
  classStatus: '',
  stream: '',
  city: '',
  slotBooking: '',
  top5Colleges: '',
  careerDecisionClarity: '',
  collegeDecisionStakeholder: '',
  expectedBudget: '',
  topCollegePriority: '',
  helpNeeded: '',
  wantsOneToOneSession: '',
  biggestConfusion: '',
};

const neoInputClass =
  'w-full rounded-[10px] border-2 border-[#0F172A] bg-white px-4 py-3 text-sm font-semibold text-[#0F172A] outline-none transition-all focus:-translate-y-0.5 focus:shadow-[3px_3px_0px_#0F172A]';

const neoLabelClass = 'mb-2 block text-sm font-black uppercase tracking-wide text-[#0F172A]';

export default function IitCounsellingPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [submissionId, setSubmissionId] = useState('');
  const [visitorFingerprint, setVisitorFingerprint] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState({ ok: false, message: '' });

  const stepConfig = useMemo(() => ({
    1: ['fullName', 'mobileNumber', 'studentOrParent', 'classStatus', 'stream', 'city', 'slotBooking', 'top5Colleges'],
    2: ['careerDecisionClarity', 'collegeDecisionStakeholder', 'expectedBudget', 'topCollegePriority'],
    3: ['helpNeeded', 'wantsOneToOneSession', 'biggestConfusion'],
  }), []);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const payload = {
      path: window.location.pathname,
      query: window.location.search,
      referrer: document.referrer || '',
      utm_source: queryParams.get('utm_source') || '',
      utm_medium: queryParams.get('utm_medium') || '',
      utm_campaign: queryParams.get('utm_campaign') || '',
      utm_content: queryParams.get('utm_content') || '',
    };

    fetch('/api/iit-counselling/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        const fingerprint = result?.data?.visitorFingerprint;
        if (response.ok && typeof fingerprint === 'string' && fingerprint) {
          setVisitorFingerprint(fingerprint);
        }
      })
      .catch(() => {});
  }, []);

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validateStep = (step) => {
    const nextErrors = {};
    const fields = stepConfig[step] || [];
    fields.forEach((key) => {
      if (!String(formData[key] ?? '').trim()) nextErrors[key] = 'This field is required.';
    });
    if (formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber.trim())) {
      nextErrors.mobileNumber = 'Enter a valid 10-digit mobile number.';
    }
    return nextErrors;
  };

  const saveCurrentStep = async () => {
    const nextErrors = validateStep(currentStep);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return false;

    const endpoint = currentStep === 1
      ? '/api/iit-counselling/section1'
      : currentStep === 2
        ? '/api/iit-counselling/section2'
        : '/api/iit-counselling/section3';

    const payload = currentStep === 1
      ? {
          fullName: formData.fullName.trim(),
          mobileNumber: formData.mobileNumber.trim(),
          studentOrParent: formData.studentOrParent,
          classStatus: formData.classStatus,
          stream: formData.stream,
          city: formData.city.trim(),
          slotBooking: formData.slotBooking,
          visitorFingerprint,
          top5Colleges: formData.top5Colleges
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 5),
        }
      : currentStep === 2
        ? {
            submissionId,
            careerDecisionClarity: formData.careerDecisionClarity,
            collegeDecisionStakeholder: formData.collegeDecisionStakeholder,
            expectedBudget: formData.expectedBudget,
            topCollegePriority: formData.topCollegePriority,
          }
        : {
            submissionId,
            helpNeeded: formData.helpNeeded,
            wantsOneToOneSession: formData.wantsOneToOneSession,
            biggestConfusion: formData.biggestConfusion,
          };

    setSubmitting(true);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.message || 'Could not save this step right now.');
      }
      if (result?.data?.submissionId) {
        setSubmissionId(result.data.submissionId);
      }
      return true;
    } catch (error) {
      setSubmitState({
        ok: false,
        message: error?.message || 'Failed to save this step. Please try again.',
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitState({ ok: false, message: '' });

    const saved = await saveCurrentStep();
    if (!saved) return;

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    const whatsappUrl = `https://wa.me/919009000914?text=${encodeURIComponent('Hi')}`;
    window.location.assign(whatsappUrl);
  };

  const goBack = () => {
    if (currentStep > 1) {
      setErrors({});
      setSubmitState({ ok: false, message: '' });
      setCurrentStep((prev) => prev - 1);
    }
  };

  const stepTitle = currentStep === 1 ? 'Section 1: Basic Details' : currentStep === 2 ? 'Section 2' : 'Section 3';

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-10 selection:bg-[#c7f36b] selection:text-[#0F172A] sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 rounded-[14px] border-2 border-[#0F172A] bg-[#0F172A] p-6 text-white shadow-[6px_6px_0px_#c7f36b]">
          <p className="mb-2 inline-flex rounded border border-slate-600 bg-[#1E293B] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-300">
            IIT Counselling Intake
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Book Your IITian Counselling Session</h1>
          <p className="mt-2 text-sm font-medium text-slate-300">
            Step {currentStep} of 3 - {stepTitle}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[14px] border-2 border-[#0F172A] bg-white p-5 shadow-[6px_6px_0px_#0F172A] sm:p-7"
        >
          {currentStep === 1 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="1. Full Name" error={errors.fullName}>
                <input className={neoInputClass} value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} />
              </Field>
              <Field label="2. Mobile Number" error={errors.mobileNumber}>
                <input className={neoInputClass} inputMode="numeric" maxLength={10} value={formData.mobileNumber} onChange={(e) => handleInputChange('mobileNumber', e.target.value.replace(/\D/g, ''))} />
              </Field>
              <ChoiceGroup label="3. Student or Parent?" options={STUDENT_PARENT_OPTIONS} value={formData.studentOrParent} onChange={(value) => handleInputChange('studentOrParent', value)} error={errors.studentOrParent} />
              <ChoiceGroup label="4. Class" options={CLASS_OPTIONS} value={formData.classStatus} onChange={(value) => handleInputChange('classStatus', value)} error={errors.classStatus} />
              <ChoiceGroup label="5. Stream" options={STREAM_OPTIONS} value={formData.stream} onChange={(value) => handleInputChange('stream', value)} error={errors.stream} />
              <Field label="6. City" error={errors.city}>
                <input className={neoInputClass} value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} />
              </Field>
              <ChoiceGroup label="7. SLOT Booking (FREE IITian session this Sunday?)" options={SLOT_BOOKING_OPTIONS} value={formData.slotBooking} onChange={(value) => handleInputChange('slotBooking', value)} error={errors.slotBooking} />
              <Field label="8. Your Top 5 colleges (comma separated)" error={errors.top5Colleges}>
                <textarea className={`${neoInputClass} min-h-[100px]`} value={formData.top5Colleges} onChange={(e) => handleInputChange('top5Colleges', e.target.value)} />
              </Field>
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <ChoiceGroup label="9. Career decision clarity" options={CAREER_DECISION_OPTIONS} value={formData.careerDecisionClarity} onChange={(value) => handleInputChange('careerDecisionClarity', value)} error={errors.careerDecisionClarity} />
              <ChoiceGroup label="10. Who decides college?" options={COLLEGE_DECISION_OPTIONS} value={formData.collegeDecisionStakeholder} onChange={(value) => handleInputChange('collegeDecisionStakeholder', value)} error={errors.collegeDecisionStakeholder} />
              <ChoiceGroup label="11. Expected annual budget" options={BUDGET_OPTIONS} value={formData.expectedBudget} onChange={(value) => handleInputChange('expectedBudget', value)} error={errors.expectedBudget} />
              <ChoiceGroup label="12. What matters most?" options={COLLEGE_PRIORITY_OPTIONS} value={formData.topCollegePriority} onChange={(value) => handleInputChange('topCollegePriority', value)} error={errors.topCollegePriority} />
            </div>
          ) : null}

          {currentStep === 3 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <ChoiceGroup label="13. What would you like help with?" options={HELP_OPTIONS} value={formData.helpNeeded} onChange={(value) => handleInputChange('helpNeeded', value)} error={errors.helpNeeded} />
              <ChoiceGroup label="14. Need 1:1 personalized guidance?" options={ONE_TO_ONE_OPTIONS} value={formData.wantsOneToOneSession} onChange={(value) => handleInputChange('wantsOneToOneSession', value)} error={errors.wantsOneToOneSession} />
              <ChoiceGroup label="15. Biggest confusion right now?" options={CONFUSION_OPTIONS} value={formData.biggestConfusion} onChange={(value) => handleInputChange('biggestConfusion', value)} error={errors.biggestConfusion} />
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Data is saved section by section.</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goBack}
                disabled={currentStep === 1 || submitting}
                className="rounded-[14px] border-2 border-[#0F172A] bg-white px-6 py-3 text-sm font-black uppercase tracking-wide text-[#0F172A] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-[14px] border-2 border-[#0F172A] bg-[#c7f36b] px-6 py-3 text-sm font-black uppercase tracking-wide text-[#0F172A] shadow-[4px_4px_0px_#0F172A] transition-all hover:-translate-y-0.5 hover:bg-[#b0d95d] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? 'Saving...' : currentStep === 3 ? 'Submit Final Section' : 'Save & Next'}
              </button>
            </div>
          </div>

          {submitState.message ? (
            <p
              className={`mt-4 rounded-[10px] border-2 px-4 py-3 text-sm font-bold ${
                submitState.ok
                  ? 'border-emerald-900 bg-emerald-100 text-emerald-900'
                  : 'border-red-900 bg-red-100 text-red-900'
              }`}
            >
              {submitState.message}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}

function Field({ label, children, error }) {
  return (
    <div className="sm:col-span-1">
      <label className={neoLabelClass}>{label}</label>
      {children}
      {error ? <p className="mt-1 text-xs font-bold text-red-700">{error}</p> : null}
    </div>
  );
}

function ChoiceGroup({ label, options, value, onChange, error }) {
  return (
    <div className="sm:col-span-1">
      <p className={neoLabelClass}>
        {label}
      </p>
      <div className="space-y-2 rounded-[10px] border-2 border-[#0F172A] bg-[#F8FAFC] p-3">
        {options.map((option) => {
          const id = `${label}-${option}`;
          return (
            <label key={option} htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#0F172A]">
              <input
                id={id}
                type="radio"
                checked={value === option}
                onChange={() => onChange(option)}
                className="h-4 w-4 border-2 border-[#0F172A] accent-[#0F172A]"
              />
              {option}
            </label>
          );
        })}
      </div>
      {error ? <p className="mt-1 text-xs font-bold text-red-700">{error}</p> : null}
    </div>
  );
}
