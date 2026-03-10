import { useState, useEffect, useCallback, useRef } from 'react';
import { FiPlus, FiChevronLeft, FiTrash2 } from 'react-icons/fi';

const NOTES_STORAGE_KEY = 'webinar_notes';
const TITLE_LENGTH = 40;
const PREVIEW_LINES = 2;

function loadNotes() {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotes(notes) {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.warn('webinar notes persist', e);
  }
}

function getTitle(text) {
  if (!text || !text.trim()) return 'New note';
  const first = text.trim().split(/\n/)[0].trim();
  return first.length > TITLE_LENGTH ? first.slice(0, TITLE_LENGTH) + '…' : first;
}

function getPreview(text) {
  if (!text || !text.trim()) return '';
  const lines = text.trim().split(/\n/).filter(Boolean);
  if (lines.length <= 1) return '';
  return lines.slice(1, PREVIEW_LINES + 1).join(' ').slice(0, 60) + (lines.length > PREVIEW_LINES ? '…' : '');
}

function formatTimestamp(iso) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function NotesPanel({ sessionId }) {
  const [notes, setNotes] = useState(loadNotes);
  const [selectedId, setSelectedId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [isNewNote, setIsNewNote] = useState(false);
  const saveTimeoutRef = useRef(null);

  const sessionNotes = notes.filter((n) => n.sessionId === sessionId);
  const sortedNotes = [...sessionNotes].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const selectedNote = selectedId ? notes.find((n) => n.id === selectedId) : null;

  const persist = useCallback((next) => {
    setNotes(next);
    saveNotes(next);
  }, []);

  const debouncedSave = useCallback((id, text) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const trimmed = (text || '').trim();
      setNotes((prev) => {
        const idx = prev.findIndex((n) => n.id === id);
        if (idx < 0) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], text: trimmed || next[idx].text, timestamp: new Date().toISOString() };
        saveNotes(next);
        return next;
      });
    }, 500);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (selectedNote) setEditingText(selectedNote.text || '');
    if (isNewNote) setEditingText('');
  }, [selectedId, isNewNote, selectedNote?.id]);

  const handleBack = useCallback(() => {
    if (isNewNote && editingText.trim()) {
      const newNote = {
        id: `n-${Date.now()}`,
        sessionId,
        text: editingText.trim(),
        timestamp: new Date().toISOString(),
      };
      setNotes((prev) => {
        const next = [...prev, newNote];
        saveNotes(next);
        return next;
      });
    }
    setSelectedId(null);
    setIsNewNote(false);
  }, [isNewNote, editingText, sessionId]);

  const handleTextChange = (value) => {
    setEditingText(value);
    if (selectedNote) debouncedSave(selectedNote.id, value);
  };

  const handleBlur = useCallback(() => {
    if (isNewNote && editingText.trim()) {
      const newNote = {
        id: `n-${Date.now()}`,
        sessionId,
        text: editingText.trim(),
        timestamp: new Date().toISOString(),
      };
      persist([...notes, newNote]);
      setIsNewNote(false);
      setSelectedId(newNote.id);
      setEditingText(newNote.text);
    } else if (selectedNote && editingText.trim() !== (selectedNote.text || '')) {
      persist(
        notes.map((n) =>
          n.id === selectedNote.id ? { ...n, text: editingText.trim() || n.text, timestamp: new Date().toISOString() } : n
        )
      );
    }
  }, [selectedNote, isNewNote, editingText, notes, persist, sessionId]);

  const handleNewNote = () => {
    setSelectedId(null);
    setIsNewNote(true);
    setEditingText('');
  };

  const handleDelete = () => {
    if (selectedId) persist(notes.filter((n) => n.id !== selectedId));
    setSelectedId(null);
    setIsNewNote(false);
  };

  const showDetail = selectedId || isNewNote;

  if (!sessionId) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">My notes</h3>
        <p className="text-sm text-gray-400 mt-2">Select a session to view or add notes.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden transition-shadow duration-200 hover:shadow-md">
      {/* Header */}
      <div className="border-b border-gray-100 px-5 py-3.5 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">My notes</h3>
        {!showDetail && (
          <button
            type="button"
            onClick={handleNewNote}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-navy text-white text-xs font-semibold hover:bg-primary-navy/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2 shadow-sm"
          >
            <FiPlus className="w-3.5 h-3.5" />
            New note
          </button>
        )}
      </div>

      {showDetail ? (
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-gray-100 min-h-[44px] bg-gray-50/60">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-navy hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/50 rounded px-1 min-h-[36px]"
            >
              <FiChevronLeft className="w-4 h-4" />
              Done
            </button>
            {selectedId && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                aria-label="Delete note"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="p-5">
            <textarea
              value={editingText}
              onChange={(e) => handleTextChange(e.target.value)}
              onBlur={handleBlur}
              placeholder="Start typing your note…"
              rows={8}
              className="w-full text-sm text-gray-800 border-0 focus:outline-none focus:ring-0 resize-none placeholder:text-gray-400 bg-transparent"
              aria-label="Note content"
              style={{ minHeight: '120px' }}
            />
          </div>
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto">
          {sortedNotes.length === 0 ? (
            <div className="p-8 flex flex-col items-center text-center">
              <span className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                <FiPlus className="w-5 h-5 text-gray-400" aria-hidden />
              </span>
              <p className="text-sm text-gray-500 font-medium">No notes yet</p>
              <button
                type="button"
                onClick={handleNewNote}
                className="mt-2 text-sm font-semibold text-primary-navy hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/50 rounded"
              >
                Add your first note
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {sortedNotes.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(n.id);
                      setIsNewNote(false);
                      setEditingText(n.text || '');
                    }}
                    className="w-full text-left px-5 py-3.5 flex items-start gap-3 min-h-[52px] hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/30 focus-visible:ring-inset"
                  >
                    <span className="w-2 h-2 rounded-full bg-primary-navy/30 mt-2 flex-shrink-0" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{getTitle(n.text)}</p>
                      {getPreview(n.text) && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{getPreview(n.text)}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 mt-0.5">{formatTimestamp(n.timestamp)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
