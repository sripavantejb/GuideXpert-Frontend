import {
  CALL_STATUS_OPTIONS,
  DEMO_STATUS_OPTIONS,
  LEAD_STATUS_OPTIONS,
  NIAT_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from '../../constants/callingTeamCrm';

/**
 * CRM update form for BDA portal — same dropdowns/fields as admin lead drawer.
 */
export default function BdaLeadCrmForm({ form, setForm, onSave, saving, saveMsg, simplified = false }) {
  if (simplified) {
    return (
      <div className="space-y-4 border-t border-gray-100 pt-4">
        <p className="text-sm font-semibold text-gray-900">Update lead</p>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Lead status</label>
          <input
            type="text"
            value={form.leadStatus || ''}
            onChange={(e) => setForm((f) => ({ ...f, leadStatus: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="Lead status"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Remark (required)</label>
          <textarea
            value={form.remark || ''}
            onChange={(e) => setForm((f) => ({ ...f, remark: e.target.value }))}
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="Add call notes or follow-up details"
          />
        </div>
        {saveMsg && <p className={`text-sm ${saveMsg === 'Saved' ? 'text-green-600' : 'text-red-600'}`}>{saveMsg}</p>}
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="w-full py-2.5 rounded-lg bg-primary-blue text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save update'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 border-t border-gray-100 pt-4">
      <p className="text-sm font-semibold text-gray-900">Update lead (your assigned leads only)</p>

      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">Call status</label>
        <select
          value={form.callStatus}
          onChange={(e) => setForm((f) => ({ ...f, callStatus: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          {CALL_STATUS_OPTIONS.map((o) => (
            <option key={`call-${o.value}`} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">Lead status</label>
        <select
          value={form.leadStatus}
          onChange={(e) => setForm((f) => ({ ...f, leadStatus: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          {LEAD_STATUS_OPTIONS.map((o) => (
            <option key={`lead-${o.value}`} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Demo status</label>
          <select
            value={form.demoStatus}
            onChange={(e) => setForm((f) => ({ ...f, demoStatus: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {DEMO_STATUS_OPTIONS.map((o) => (
              <option key={`demo-${o.value}`} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">NIAT registration</label>
          <select
            value={form.niatStatus}
            onChange={(e) => setForm((f) => ({ ...f, niatStatus: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {NIAT_STATUS_OPTIONS.map((o) => (
              <option key={`niat-${o.value}`} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">Payment status</label>
        <select
          value={form.paymentStatus}
          onChange={(e) => setForm((f) => ({ ...f, paymentStatus: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          {PAYMENT_STATUS_OPTIONS.map((o) => (
            <option key={`pay-${o.value}`} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3 space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
          <input
            type="checkbox"
            checked={!!form.callbackNeeded}
            onChange={(e) => setForm((f) => ({ ...f, callbackNeeded: e.target.checked }))}
          />
          Callback needed
        </label>
        {form.callbackNeeded && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600">Callback date *</label>
                <input
                  type="date"
                  required
                  value={form.callbackDate}
                  onChange={(e) => setForm((f) => ({ ...f, callbackDate: e.target.value }))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Callback time *</label>
                <input
                  type="time"
                  required
                  value={form.callbackTime}
                  onChange={(e) => setForm((f) => ({ ...f, callbackTime: e.target.value }))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-600">Callback note</label>
              <input
                value={form.callbackNote}
                onChange={(e) => setForm((f) => ({ ...f, callbackNote: e.target.value }))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white"
                placeholder="Reason or context for callback"
              />
            </div>
          </>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">Remarks * (required every update)</label>
        <textarea
          value={form.remark}
          onChange={(e) => setForm((f) => ({ ...f, remark: e.target.value }))}
          rows={4}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          placeholder="What happened on this call? Student response, next steps…"
        />
      </div>

      {saveMsg && (
        <p className={`text-sm ${saveMsg === 'Saved' ? 'text-green-700' : 'text-red-600'}`}>{saveMsg}</p>
      )}

      <button
        type="button"
        disabled={saving}
        onClick={onSave}
        className="w-full py-2.5 rounded-lg bg-primary-blue text-white font-medium hover:opacity-90 disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save lead update'}
      </button>
    </div>
  );
}
