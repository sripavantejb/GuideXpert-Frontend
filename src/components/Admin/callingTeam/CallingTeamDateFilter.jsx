import { useState } from 'react';

const PRESETS = [
  { id: '', label: 'All time' },
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'last7', label: 'Last 7 Days' },
  { id: 'last30', label: 'Last 30 Days' },
  { id: 'custom', label: 'Custom' },
];

export default function CallingTeamDateFilter({ value, onChange }) {
  const [localFrom, setLocalFrom] = useState(value?.fromDate || '');
  const [localTo, setLocalTo] = useState(value?.toDate || '');

  const applyPreset = (preset) => {
    if (preset === 'custom') {
      onChange({ preset: 'custom', fromDate: localFrom, toDate: localTo });
      return;
    }
    onChange({ preset, fromDate: '', toDate: '' });
  };

  const applyCustom = () => {
    onChange({ preset: 'custom', fromDate: localFrom, toDate: localTo });
  };

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.id || 'all'}
            type="button"
            onClick={() => applyPreset(p.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              (value?.preset || '') === p.id
                ? 'bg-primary-blue text-white border-primary-blue'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {value?.preset === 'custom' && (
        <>
          <input
            type="date"
            value={localFrom}
            onChange={(e) => setLocalFrom(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
          />
          <input
            type="date"
            value={localTo}
            onChange={(e) => setLocalTo(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={applyCustom}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-800 text-white"
          >
            Apply
          </button>
        </>
      )}
    </div>
  );
}
