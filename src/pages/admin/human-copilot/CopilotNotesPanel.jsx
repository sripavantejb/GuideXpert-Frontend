import { useState } from 'react';
import { formatCopilotDate, PANEL_CLASS } from './copilotUtils';

export default function CopilotNotesPanel({ notes, onAdd, adding, disabled }) {
  const [text, setText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const ok = await onAdd(trimmed);
    if (ok) setText('');
  };

  return (
    <section className={`${PANEL_CLASS} flex min-h-0 flex-col overflow-hidden`}>
      <div className="border-b border-slate-200/80 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Internal notes</h2>
        <p className="mt-0.5 text-xs text-slate-500">Not sent to the user.</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3">
        {(notes || []).length === 0 ? (
          <p className="text-xs text-slate-500">No notes yet.</p>
        ) : (
          <ul className="space-y-2">
            {notes.map((note, idx) => (
              <li
                key={`${note.createdAt || idx}-${idx}`}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <p className="text-xs text-slate-800 whitespace-pre-wrap">{note.text}</p>
                <p className="mt-1 text-[10px] text-slate-400">{formatCopilotDate(note.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-slate-200/80 p-4 space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Add an internal note…"
          disabled={disabled || adding}
          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-900 focus:border-primary-blue-300 focus:outline-none disabled:bg-slate-50"
        />
        <button
          type="submit"
          disabled={disabled || adding || !text.trim()}
          className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-900 disabled:opacity-50"
        >
          {adding ? 'Saving…' : 'Add note'}
        </button>
      </form>
    </section>
  );
}
