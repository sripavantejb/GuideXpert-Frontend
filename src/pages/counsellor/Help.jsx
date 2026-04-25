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
    <fieldset className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <legend className="px-1 text-sm font-semibold text-slate-800">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </legend>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition ${
              value === option
                ? 'border-primary-navy bg-primary-navy/5 text-primary-navy'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <input
              type="radio"
              name={name}
              checked={value === option}
              onChange={() => onChange(option)}
              className="h-4 w-4 border-slate-300 text-primary-navy focus:ring-primary-navy"
            />
            <span className="font-medium">{option}</span>
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
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-r from-slate-900 via-primary-navy to-blue-900 px-6 py-7 text-white shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100/90">GuideXpert Support Desk</p>
        <h2
          className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl"
          style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.35)' }}
        >
          Counsellor Support Form
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-blue-100">
          Tell us where you're blocked in your lead journey. Our team will review your request and help you close faster.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary-navy focus:ring-2 focus:ring-primary-blue-500/20"
              placeholder="Enter your full name"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">
              Registered Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={form.registeredMobileNumber}
              onChange={(e) => update('registeredMobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
              required
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary-navy focus:ring-2 focus:ring-primary-blue-500/20"
              placeholder="10-digit mobile number"
            />
          </div>
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

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Any other questions do you have?</label>
          <textarea
            rows={4}
            value={form.otherQuestions}
            onChange={(e) => update('otherQuestions', e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-navy focus:ring-2 focus:ring-primary-blue-500/20"
            placeholder="Share additional context so we can support you better"
          />
        </div>

        {feedback.message ? (
          <p
            className={`rounded-xl border px-4 py-3 text-sm font-medium ${
              feedback.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {feedback.message}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-500">Your request is reviewed by the support team and prioritized by urgency.</p>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-linear-to-r from-primary-navy to-blue-800 px-6 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
