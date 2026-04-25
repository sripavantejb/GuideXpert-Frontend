import { useMemo, useState } from 'react';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';

const dashboardLeadOptions = ['0-10', '11-20', '21-30', '30+'];
const contactedLeadOptions = ['All', 'Most', 'Few', 'None'];
const natLeadOptions = ['0', '1-5', '5-10', '10+'];
const stuckStageOptions = ['First call', 'Follow-up', 'Closing for NAT'];
const supportNeededOptions = [
  'Help with first call script',
  'Help with follow-up strategy',
  'Help with NAT template',
  'Objection handling support',
  'Deal closing support',
  'Demo counselling session',
  'Other',
];

const initialForm = {
  name: '',
  registeredMobileNumber: '',
  dashboardLeadBucket: '',
  contactedLeadBucket: '',
  natLeadBucket: '',
  stuckStage: '',
  supportNeeded: '',
  otherQuestions: '',
};

function RadioGroup({ label, required = false, options, value, onChange, name }) {
  return (
    <fieldset className="rounded-xl border border-gray-200 bg-white p-4">
      <legend className="px-1 text-sm font-semibold text-gray-800">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </legend>
      <div className="mt-2 space-y-2">
        {options.map((option) => (
          <label key={option} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name={name}
              checked={value === option}
              onChange={() => onChange(option)}
              className="h-4 w-4 border-gray-300 text-primary-navy focus:ring-primary-navy"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function Help() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const apiBase = useMemo(() => getApiBaseUrl(), []);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        registeredMobileNumber: String(form.registeredMobileNumber || '').replace(/\D/g, '').slice(0, 10),
      };
      const res = await fetch(`${apiBase}/counsellor-support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || 'Unable to submit support request.');
      }
      setFeedback({ type: 'success', message: 'Support request submitted successfully.' });
      setForm(initialForm);
    } catch (error) {
      setFeedback({ type: 'error', message: error?.message || 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-primary-navy">Counsellor Support Form</h2>
        <p className="text-sm text-gray-500 mt-1">Share where you are getting stuck and what support you need.</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <label className="mb-1 block text-sm font-semibold text-gray-800">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
            className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-primary-blue-500"
            placeholder="Your name"
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <label className="mb-1 block text-sm font-semibold text-gray-800">
            Registered Mobile Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            inputMode="numeric"
            value={form.registeredMobileNumber}
            onChange={(e) => update('registeredMobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
            required
            className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-primary-blue-500"
            placeholder="10-digit number"
          />
        </div>

        <RadioGroup
          label="No of leads currently in your dashboard"
          required
          options={dashboardLeadOptions}
          value={form.dashboardLeadBucket}
          onChange={(v) => update('dashboardLeadBucket', v)}
          name="dashboardLeadBucket"
        />

        <RadioGroup
          label="Out of these, how many have you contacted?"
          required
          options={contactedLeadOptions}
          value={form.contactedLeadBucket}
          onChange={(v) => update('contactedLeadBucket', v)}
          name="contactedLeadBucket"
        />

        <RadioGroup
          label="How many leads are close to NAT institution?"
          required
          options={natLeadOptions}
          value={form.natLeadBucket}
          onChange={(v) => update('natLeadBucket', v)}
          name="natLeadBucket"
        />

        <RadioGroup
          label="At which stage are you getting stuck?"
          required
          options={stuckStageOptions}
          value={form.stuckStage}
          onChange={(v) => update('stuckStage', v)}
          name="stuckStage"
        />

        <RadioGroup
          label="What kind of support do you need?"
          required
          options={supportNeededOptions}
          value={form.supportNeeded}
          onChange={(v) => update('supportNeeded', v)}
          name="supportNeeded"
        />

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <label className="mb-1 block text-sm font-semibold text-gray-800">Any other questions do you have?</label>
          <textarea
            rows={4}
            value={form.otherQuestions}
            onChange={(e) => update('otherQuestions', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-blue-500"
            placeholder="Write your question"
          />
        </div>

        {feedback.message ? (
          <p className={`rounded-lg px-3 py-2 text-sm ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {feedback.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary-navy px-5 text-sm font-semibold text-white hover:bg-primary-navy/90 disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
