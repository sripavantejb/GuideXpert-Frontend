import { createElement } from 'react';
import { FiUser, FiSmartphone } from 'react-icons/fi';

const WEIGHTS = ['300', '400', '500', '600', '700', '800'];

function FieldLabel({ children, hint }) {
  return (
    <span className="flex items-baseline justify-between gap-2">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-gray-500">{children}</span>
      {hint ? <span className="text-[0.625rem] font-normal normal-case text-gray-400">{hint}</span> : null}
    </span>
  );
}

function AlignmentPills({ value, onChange }) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-gray-50/80 p-1">
      {['left', 'center', 'right', 'justify'].map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`min-w-0 flex-1 rounded-lg px-2 py-2 text-center text-xs font-medium transition sm:text-[0.8125rem] ${
            (value ?? 'left') === v
              ? 'bg-white text-primary-navy shadow-sm ring-1 ring-gray-200'
              : 'text-gray-600 hover:bg-white/80'
          }`}
        >
          {v.charAt(0).toUpperCase() + v.slice(1)}
        </button>
      ))}
    </div>
  );
}

function OverlaySection({ title, icon, field, onChange, accentClass }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ring-1 ring-black/[0.02] ${accentClass}`}>
      <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
          {createElement(icon, { className: 'h-5 w-5', 'aria-hidden': true })}
        </span>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">Position & typography</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <FieldLabel>Position (%)</FieldLabel>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[0.625rem] text-gray-400">X</span>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={field.x ?? 0}
                onChange={(e) => onChange({ x: Number(e.target.value) || 0 })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm tabular-nums focus:border-primary-blue-400 focus:outline-none focus:ring-2 focus:ring-primary-blue-400/20"
              />
            </label>
            <label className="block">
              <span className="text-[0.625rem] text-gray-400">Y</span>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={field.y ?? 0}
                onChange={(e) => onChange({ y: Number(e.target.value) || 0 })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm tabular-nums focus:border-primary-blue-400 focus:outline-none focus:ring-2 focus:ring-primary-blue-400/20"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <FieldLabel>Size (px)</FieldLabel>
            <input
              type="number"
              min={4}
              max={400}
              value={field.fontSize ?? 16}
              onChange={(e) => onChange({ fontSize: Number(e.target.value) || 16 })}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm tabular-nums focus:border-primary-blue-400 focus:outline-none focus:ring-2 focus:ring-primary-blue-400/20"
            />
          </label>
          <label className="block">
            <FieldLabel>Weight</FieldLabel>
            <select
              value={String(field.fontWeight ?? '400')}
              onChange={(e) => onChange({ fontWeight: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-blue-400 focus:outline-none focus:ring-2 focus:ring-primary-blue-400/20"
            >
              {WEIGHTS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <FieldLabel>Alignment</FieldLabel>
          <AlignmentPills value={field.textAlign} onChange={(v) => onChange({ textAlign: v })} />
        </label>

        <label className="block">
          <FieldLabel>Color</FieldLabel>
          <div className="mt-1.5 flex gap-2">
            <input
              type="color"
              value={/^#/.test(field.color || '') ? field.color : '#111827'}
              onChange={(e) => onChange({ color: e.target.value })}
              className="h-11 w-14 cursor-pointer rounded-xl border border-gray-200 bg-white p-1"
            />
            <input
              type="text"
              value={field.color ?? '#111827'}
              onChange={(e) => onChange({ color: e.target.value })}
              className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono focus:border-primary-blue-400 focus:outline-none focus:ring-2 focus:ring-primary-blue-400/20"
            />
          </div>
        </label>
      </div>
    </div>
  );
}

export default function PosterElementToolbar({ nameField, mobileField, onChangeName, onChangeMobile }) {
  return (
    <div className="space-y-5">
      <OverlaySection
        title="Name"
        icon={FiUser}
        field={nameField}
        onChange={onChangeName}
        accentClass="border-l-4 border-l-violet-400/90"
      />
      <OverlaySection
        title="Mobile number"
        icon={FiSmartphone}
        field={mobileField}
        onChange={onChangeMobile}
        accentClass="border-l-4 border-l-sky-400/90"
      />
    </div>
  );
}
