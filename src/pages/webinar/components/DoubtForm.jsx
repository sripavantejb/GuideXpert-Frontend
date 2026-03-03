import { useState } from 'react';
import { FiSend } from 'react-icons/fi';

export default function DoubtForm({ onSubmit, sessionId = null, compact = false, onTitleChange }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  const handleTitleChange = (e) => {
    const v = e.target.value;
    setTitle(v);
    onTitleChange?.(v);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    onSubmit({
      title: t,
      description: description.trim() || null,
      sessionId: sessionId || null,
      attachment: attachmentName || null,
    });
    setTitle('');
    setDescription('');
    setAttachmentName('');
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? 'flex flex-col gap-2 min-w-0' : 'flex flex-col gap-3 min-w-0'}>
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Question title"
        className="w-full min-w-0 px-3 py-2 min-h-[44px] text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy bg-white"
        aria-label="Question title"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={compact ? 2 : 3}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy bg-white resize-none"
        aria-label="Description"
      />
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs text-gray-500 flex items-center gap-1 cursor-pointer">
          <input
            type="file"
            className="sr-only"
            onChange={(e) => setAttachmentName(e.target.files?.[0]?.name ?? '')}
            aria-label="Attach file"
          />
          <span className="px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50">
            Attach file
          </span>
        </label>
        {attachmentName && (
          <span className="text-xs text-gray-500 truncate max-w-[160px]">{attachmentName}</span>
        )}
      </div>
      <button
        type="submit"
        className="px-3 py-2 min-h-[44px] rounded-lg bg-primary-navy text-white hover:bg-primary-navy/90 transition-colors shrink-0 flex items-center justify-center gap-1.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/50"
        aria-label="Submit question"
      >
        <FiSend className="w-4 h-4" />
        Submit
      </button>
    </form>
  );
}
