import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';
import EditorToolbar from './EditorToolbar';

function getTemplate(kind) {
  if (kind === 'intro') {
    return '<p>Students today need clear guidance to make smarter admission decisions.</p>';
  }
  if (kind === 'how') {
    return '<h2>Here Is How It Works</h2><p>We analyze your profile, goals, and preferences to provide structured recommendations.</p>';
  }
  if (kind === 'why') {
    return '<h2>Why This Works</h2><blockquote><p>Clarity improves confidence, and confidence improves decisions.</p></blockquote>';
  }
  if (kind === 'steps') {
    return '<h3>Step-by-Step</h3><ol><li>Define goals</li><li>Compare options</li><li>Choose your best-fit path</li></ol>';
  }
  return '<p></p>';
}

export default function RichBlogEditor({ valueJson, valueHtml, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: 'Write your article content here...' }),
      Link.configure({ openOnClick: true, autolink: true }),
    ],
    content: valueJson || valueHtml || '<p></p>',
    editorProps: {
      attributes: {
        class:
          'prose max-w-none min-h-[420px] p-4 outline-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-8 prose-a:text-primary-blue-800',
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange({
        contentJson: ed.getJSON(),
        contentHtml: ed.getHTML(),
      });
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (valueJson) {
      const currentJson = JSON.stringify(editor.getJSON());
      const nextJson = JSON.stringify(valueJson);
      if (currentJson !== nextJson) editor.commands.setContent(valueJson, false);
      return;
    }
    const nextHtml = valueHtml || '<p></p>';
    if (editor.getHTML() !== nextHtml) editor.commands.setContent(nextHtml, false);
  }, [editor, valueJson, valueHtml]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
      <EditorToolbar
        editor={editor}
        onInsertTemplate={(kind) => {
          if (!editor) return;
          editor.chain().focus().insertContent(getTemplate(kind)).run();
        }}
      />
      <EditorContent editor={editor} />
    </div>
  );
}

