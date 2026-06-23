import { useState } from 'react';
import { CopilotRailSection, RailEmptyState } from './CopilotRailSection';
import { formatCopilotDate } from './copilotUtils';

export default function CopilotNotesPanel({ notes, onAdd, adding, disabled }) {
  const [text, setText] = useState('');
  const items = notes || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const ok = await onAdd(trimmed);
    if (ok) setText('');
  };

  return (
    <CopilotRailSection title="Internal notes" subtitle="Not sent to the user.">
      <div className="space-y-3">
        {items.length > 0 ? (
          <ul className="space-y-1.5">
            {items.map((note, idx) => (
              <li
                key={`${note.createdAt || idx}-${idx}`}
                className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <p className="text-xs leading-snug text-slate-800 whitespace-pre-wrap">{note.text}</p>
                <p className="mt-1 text-[10px] text-slate-400">{formatCopilotDate(note.createdAt)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <RailEmptyState>No notes yet.</RailEmptyState>
        )}

        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-slate-50/50 p-2.5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Add an internal note…"
            disabled={disabled || adding}
            className="w-full resize-none rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary-blue-300 focus:outline-none focus:ring-2 focus:ring-primary-blue-100 disabled:bg-slate-50"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={disabled || adding || !text.trim()}
              className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-900 disabled:opacity-50"
            >
              {adding ? 'Saving…' : 'Add note'}
            </button>
          </div>
        </form>
      </div>
    </CopilotRailSection>
  );
}
