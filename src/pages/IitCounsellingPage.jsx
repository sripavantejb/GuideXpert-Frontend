import { useMemo, useState } from 'react';

const STREAM_OPTIONS = ['MPC', 'BiPC', 'Commerce', 'Arts', 'Other'];
const BOARD_OPTIONS = ['CBSE', 'State Board', 'ICSE', 'Other'];
const JEE_MAIN_STATUS_OPTIONS = ['Appeared', 'Not Appeared'];
const JEE_ADVANCED_STATUS_OPTIONS = ['Qualified', 'Not Qualified', 'Not Appeared'];
const OTHER_EXAMS_OPTIONS = ['EAMCET', 'BITSAT', 'NIAT', 'Other'];
const CAREER_PATH_OPTIONS = ['Engineering', 'Medicine', 'Others'];
const ENGINEERING_BRANCH_OPTIONS = ['Computer Science (CSE)', 'Electronics (ECE)', 'Mechanical', 'Civil', 'Not Sure'];
const TIME_SLOT_OPTIONS = ['Morning', 'Afternoon', 'Evening'];

const initialFormData = {
  fullName: '',
  mobileNumber: '',
  email: '',
  cityState: '',
  schoolCollegeName: '',
  class12Stream: '',
  board: '',
  marksPercentage: '',
  jeeMainStatus: '',
  jeeMainScoreRank: '',
  jeeAdvancedStatus: '',
  otherExamsAttempted: [],
  preferredCareerPath: '',
  preferredEngineeringBranch: '',
  preferredColleges: '',
  sessionExpectation: '',
  preferredTimeSlot: '',
};

const neoInputClass =
  'w-full rounded-[10px] border-2 border-[#0F172A] bg-white px-4 py-3 text-sm font-semibold text-[#0F172A] outline-none transition-all focus:-translate-y-0.5 focus:shadow-[3px_3px_0px_#0F172A]';

const neoLabelClass = 'mb-2 block text-sm font-black uppercase tracking-wide text-[#0F172A]';

export default function IitCounsellingPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState({ ok: false, message: '' });

  const requiredFields = useMemo(
    () => [
      'fullName',
      'mobileNumber',
      'email',
      'cityState',
      'schoolCollegeName',
      'class12Stream',
      'board',
      'marksPercentage',
      'jeeMainStatus',
      'jeeMainScoreRank',
      'jeeAdvancedStatus',
      'preferredCareerPath',
      'preferredEngineeringBranch',
      'preferredColleges',
      'sessionExpectation',
      'preferredTimeSlot',
    ],
    []
  );

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const toggleOtherExam = (exam) => {
    setFormData((prev) => {
      const hasExam = prev.otherExamsAttempted.includes(exam);
      return {
        ...prev,
        otherExamsAttempted: hasExam
          ? prev.otherExamsAttempted.filter((item) => item !== exam)
          : [...prev.otherExamsAttempted, exam],
      };
    });
  };

  const validate = () => {
    const nextErrors = {};

    requiredFields.forEach((key) => {
      if (!String(formData[key] ?? '').trim()) nextErrors[key] = 'This field is required.';
    });
    if (!Array.isArray(formData.otherExamsAttempted) || formData.otherExamsAttempted.length === 0) {
      nextErrors.otherExamsAttempted = 'Please select at least one option.';
    }

    if (formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber.trim())) {
      nextErrors.mobileNumber = 'Enter a valid 10-digit mobile number.';
    }
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitState({ ok: false, message: '' });

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      // Placeholder endpoint for upcoming backend integration.
      const response = await fetch('/api/iit-counselling/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.message || 'Could not submit the form right now.');
      }

      setSubmitState({ ok: true, message: 'Submitted successfully. Our team will connect with you soon.' });
      setFormData(initialFormData);
    } catch (error) {
      setSubmitState({
        ok: false,
        message: error?.message || 'Submission failed. Please try again in a moment.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-10 selection:bg-[#c7f36b] selection:text-[#0F172A] sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 rounded-[14px] border-2 border-[#0F172A] bg-[#0F172A] p-6 text-white shadow-[6px_6px_0px_#c7f36b]">
          <p className="mb-2 inline-flex rounded border border-slate-600 bg-[#1E293B] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-300">
            IIT Counselling Intake
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Book Your IITian Counselling Session</h1>
          <p className="mt-2 text-sm font-medium text-slate-300">
            Fill this form and we will use your profile to guide your next steps.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[14px] border-2 border-[#0F172A] bg-white p-5 shadow-[6px_6px_0px_#0F172A] sm:p-7"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="1. Full Name" error={errors.fullName}>
              <input
                className={neoInputClass}
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
              />
            </Field>
            <Field label="2. Mobile Number (WhatsApp preferred)" error={errors.mobileNumber}>
              <input
                className={neoInputClass}
                inputMode="numeric"
                maxLength={10}
                value={formData.mobileNumber}
                onChange={(e) => handleInputChange('mobileNumber', e.target.value.replace(/\D/g, ''))}
              />
            </Field>
            <Field label="3. Email ID" error={errors.email}>
              <input
                className={neoInputClass}
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </Field>
            <Field label="4. City & State" error={errors.cityState}>
              <input
                className={neoInputClass}
                value={formData.cityState}
                onChange={(e) => handleInputChange('cityState', e.target.value)}
              />
            </Field>
            <Field label="5. School / College Name" error={errors.schoolCollegeName}>
              <input
                className={neoInputClass}
                value={formData.schoolCollegeName}
                onChange={(e) => handleInputChange('schoolCollegeName', e.target.value)}
              />
            </Field>
            <ChoiceGroup
              label="6. Class 12 Stream"
              required
              options={STREAM_OPTIONS}
              value={formData.class12Stream}
              onChange={(value) => handleInputChange('class12Stream', value)}
              error={errors.class12Stream}
            />
            <ChoiceGroup
              label="7. Board"
              options={BOARD_OPTIONS}
              value={formData.board}
              onChange={(value) => handleInputChange('board', value)}
              error={errors.board}
            />
            <Field label="8. 12th Marks / Expected Percentage" error={errors.marksPercentage}>
              <input
                className={neoInputClass}
                value={formData.marksPercentage}
                onChange={(e) => handleInputChange('marksPercentage', e.target.value)}
              />
            </Field>
            <ChoiceGroup
              label="9. JEE Main Status"
              options={JEE_MAIN_STATUS_OPTIONS}
              value={formData.jeeMainStatus}
              onChange={(value) => handleInputChange('jeeMainStatus', value)}
              error={errors.jeeMainStatus}
            />
            <Field label="10. JEE Main Score / Rank" error={errors.jeeMainScoreRank}>
              <input
                className={neoInputClass}
                value={formData.jeeMainScoreRank}
                onChange={(e) => handleInputChange('jeeMainScoreRank', e.target.value)}
              />
            </Field>
            <ChoiceGroup
              label="11. JEE Advanced Status"
              options={JEE_ADVANCED_STATUS_OPTIONS}
              value={formData.jeeAdvancedStatus}
              onChange={(value) => handleInputChange('jeeAdvancedStatus', value)}
              error={errors.jeeAdvancedStatus}
            />
            <CheckboxGroup
              label="12. Other Exams Attempted"
              options={OTHER_EXAMS_OPTIONS}
              values={formData.otherExamsAttempted}
              onToggle={toggleOtherExam}
              error={errors.otherExamsAttempted}
            />
            <ChoiceGroup
              label="14. Preferred Career Path"
              required
              options={CAREER_PATH_OPTIONS}
              value={formData.preferredCareerPath}
              onChange={(value) => handleInputChange('preferredCareerPath', value)}
              error={errors.preferredCareerPath}
            />
            <ChoiceGroup
              label="15. Preferred Engineering Branch (if applicable)"
              options={ENGINEERING_BRANCH_OPTIONS}
              value={formData.preferredEngineeringBranch}
              onChange={(value) => handleInputChange('preferredEngineeringBranch', value)}
              error={errors.preferredEngineeringBranch}
            />
          </div>

          <div className="mt-5 space-y-5">
            <Field label="16. Preferred Colleges" error={errors.preferredColleges}>
              <input
                className={neoInputClass}
                value={formData.preferredColleges}
                onChange={(e) => handleInputChange('preferredColleges', e.target.value)}
              />
            </Field>
            <Field label="17. What do you expect from this IITian counselling session?" error={errors.sessionExpectation}>
              <textarea
                className={`${neoInputClass} min-h-[110px] resize-y`}
                value={formData.sessionExpectation}
                onChange={(e) => handleInputChange('sessionExpectation', e.target.value)}
              />
            </Field>
            <ChoiceGroup
              label="18. Preferred Time Slot"
              required
              options={TIME_SLOT_OPTIONS}
              value={formData.preferredTimeSlot}
              onChange={(value) => handleInputChange('preferredTimeSlot', value)}
              error={errors.preferredTimeSlot}
            />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Fields marked required are mandatory.</p>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-[14px] border-2 border-[#0F172A] bg-[#c7f36b] px-6 py-3 text-sm font-black uppercase tracking-wide text-[#0F172A] shadow-[4px_4px_0px_#0F172A] transition-all hover:-translate-y-0.5 hover:bg-[#b0d95d] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Submitting...' : 'Submit Form'}
            </button>
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

function ChoiceGroup({ label, options, value, onChange, error, required = false }) {
  return (
    <div className="sm:col-span-1">
      <p className={neoLabelClass}>
        {label} {required ? <span className="text-red-700">*</span> : null}
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

function CheckboxGroup({ label, options, values, onToggle, error }) {
  return (
    <div className="sm:col-span-1">
      <p className={neoLabelClass}>{label}</p>
      <div className="space-y-2 rounded-[10px] border-2 border-[#0F172A] bg-[#F8FAFC] p-3">
        {options.map((option) => {
          const id = `${label}-${option}`;
          return (
            <label key={option} htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#0F172A]">
              <input
                id={id}
                type="checkbox"
                checked={values.includes(option)}
                onChange={() => onToggle(option)}
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
