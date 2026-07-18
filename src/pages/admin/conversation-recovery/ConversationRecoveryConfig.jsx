import { useCallback, useEffect, useState } from 'react';
import { FiLoader, FiSave } from 'react-icons/fi';
import {
  getRecoveryConfig,
  putRecoveryConfig,
} from '../../../utils/conversationRecoveryAdminApi';

export default function ConversationRecoveryConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({
    featureEnabled: true,
    maxAttempts: 3,
    delayHours: 24,
    retryIntervalHours: 72,
    intervals: '24,72,168',
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    sendWindowEnabled: false,
    sendWindowStart: '09:00',
    sendWindowEnd: '20:00',
    dailySendLimit: 0,
    timezone: 'Asia/Kolkata',
    templateId: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getRecoveryConfig();
    const cfg = res.data?.data ?? res.data ?? {};
    setForm({
      featureEnabled: cfg.featureEnabled !== false,
      maxAttempts: cfg.maxAttempts ?? 3,
      delayHours: cfg.delayHours ?? cfg.intervalsHours?.[0] ?? 24,
      retryIntervalHours: cfg.retryIntervalHours ?? cfg.intervalsHours?.[1] ?? 72,
      intervals: (cfg.intervalsHours || [24, 72, 168]).join(','),
      quietHoursEnabled: Boolean(cfg.quietHoursEnabled),
      quietHoursStart: cfg.quietHoursStart || '22:00',
      quietHoursEnd: cfg.quietHoursEnd || '08:00',
      sendWindowEnabled: Boolean(cfg.sendWindowEnabled),
      sendWindowStart: cfg.sendWindowStart || '09:00',
      sendWindowEnd: cfg.sendWindowEnd || '20:00',
      dailySendLimit: cfg.dailySendLimit ?? 0,
      timezone: cfg.timezone || 'Asia/Kolkata',
      templateId: cfg.templateId || '',
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    if (!window.confirm('Save campaign configuration? Changes apply without redeploy.')) return;
    setSaving(true);
    setMessage(null);
    const intervalsHours = form.intervals
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    const res = await putRecoveryConfig({
      featureEnabled: form.featureEnabled,
      maxAttempts: Number(form.maxAttempts),
      delayHours: Number(form.delayHours),
      retryIntervalHours: Number(form.retryIntervalHours),
      intervalsHours,
      quietHoursEnabled: form.quietHoursEnabled,
      quietHoursStart: form.quietHoursStart,
      quietHoursEnd: form.quietHoursEnd,
      sendWindowEnabled: form.sendWindowEnabled,
      sendWindowStart: form.sendWindowStart,
      sendWindowEnd: form.sendWindowEnd,
      dailySendLimit: Number(form.dailySendLimit),
      timezone: form.timezone,
      reason: 'admin_config_update',
    });
    setMessage(res.success ? 'Saved (live)' : res.message || 'Save failed');
    if (res.success) await load();
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-600">
        <FiLoader className="h-5 w-5 animate-spin" /> Loading config…
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      <p className="text-sm text-slate-600">
        Campaign controls apply immediately via AppSettings — no deployment required.
      </p>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={form.featureEnabled}
          onChange={(e) => setField('featureEnabled', e.target.checked)}
        />
        Enable campaign
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Delay (hours)
          <input type="number" min={1} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={form.delayHours} onChange={(e) => setField('delayHours', e.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          Retry interval (hours)
          <input type="number" min={1} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={form.retryIntervalHours} onChange={(e) => setField('retryIntervalHours', e.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          Max attempts
          <input type="number" min={1} max={10} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={form.maxAttempts} onChange={(e) => setField('maxAttempts', e.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          Daily send limit (0 = unlimited)
          <input type="number" min={0} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={form.dailySendLimit} onChange={(e) => setField('dailySendLimit', e.target.value)} />
        </label>
      </div>
      <label className="block text-sm font-medium">
        Intervals CSV (optional full override)
        <input type="text" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={form.intervals} onChange={(e) => setField('intervals', e.target.value)} />
      </label>
      <fieldset className="rounded-xl border border-slate-200 p-4 space-y-3">
        <legend className="px-1 text-sm font-semibold">Quiet hours</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.quietHoursEnabled} onChange={(e) => setField('quietHoursEnabled', e.target.checked)} />
          Enabled
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">Start<input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={form.quietHoursStart} onChange={(e) => setField('quietHoursStart', e.target.value)} /></label>
          <label className="text-sm">End<input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={form.quietHoursEnd} onChange={(e) => setField('quietHoursEnd', e.target.value)} /></label>
        </div>
      </fieldset>
      <fieldset className="rounded-xl border border-slate-200 p-4 space-y-3">
        <legend className="px-1 text-sm font-semibold">Send window</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.sendWindowEnabled} onChange={(e) => setField('sendWindowEnabled', e.target.checked)} />
          Enabled
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">Start<input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={form.sendWindowStart} onChange={(e) => setField('sendWindowStart', e.target.value)} /></label>
          <label className="text-sm">End<input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={form.sendWindowEnd} onChange={(e) => setField('sendWindowEnd', e.target.value)} /></label>
        </div>
      </fieldset>
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
        Template: <span className="font-mono text-xs">{form.templateId || '(not configured)'}</span>
      </div>
      <button type="button" disabled={saving} onClick={save} className="inline-flex items-center gap-2 rounded-lg bg-primary-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        <FiSave className="h-4 w-4" />
        {saving ? 'Saving…' : 'Save config'}
      </button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
