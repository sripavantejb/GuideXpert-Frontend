function ToolButton({ onClick, label, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? 'border-primary-navy bg-primary-navy text-white'
          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}

export default function EditorToolbar({ editor, onInsertTemplate }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
      <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} label="H1" active={editor.isActive('heading', { level: 1 })} />
      <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} label="H2" active={editor.isActive('heading', { level: 2 })} />
      <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} label="H3" active={editor.isActive('heading', { level: 3 })} />
      <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} label="Bold" active={editor.isActive('bold')} />
      <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} label="Italic" active={editor.isActive('italic')} />
      <ToolButton onClick={() => editor.chain().focus().toggleBulletList().run()} label="Bullets" active={editor.isActive('bulletList')} />
      <ToolButton onClick={() => editor.chain().focus().toggleOrderedList().run()} label="Numbers" active={editor.isActive('orderedList')} />
      <ToolButton onClick={() => editor.chain().focus().toggleBlockquote().run()} label="Highlight" active={editor.isActive('blockquote')} />
      <ToolButton
        onClick={() => {
          const url = window.prompt('Enter CTA link URL');
          if (!url) return;
          editor.chain().focus().insertContent(`<p><a href="${url}">Start Today →</a></p>`).run();
        }}
        label="CTA Link"
      />
      <ToolButton onClick={() => onInsertTemplate('intro')} label="Intro" />
      <ToolButton onClick={() => onInsertTemplate('how')} label="How It Works" />
      <ToolButton onClick={() => onInsertTemplate('why')} label="Why This Works" />
      <ToolButton onClick={() => onInsertTemplate('steps')} label="Steps" />
    </div>
  );
}

