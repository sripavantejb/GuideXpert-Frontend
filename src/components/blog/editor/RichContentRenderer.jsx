import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';

export default function RichContentRenderer({ contentJson, contentHtml, className = '' }) {
  const editor = useEditor({
    editable: false,
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] } }), Link.configure({ openOnClick: true })],
    content: contentJson || contentHtml || '<p></p>',
    editorProps: {
      attributes: {
        class:
          `prose max-w-none prose-headings:font-extrabold prose-headings:text-slate-950 prose-p:text-slate-700 prose-p:leading-8 prose-a:text-primary-blue-800 prose-img:rounded-2xl ${className}`.trim(),
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (contentJson) {
      const current = JSON.stringify(editor.getJSON());
      const next = JSON.stringify(contentJson);
      if (current !== next) editor.commands.setContent(contentJson, false);
      return;
    }
    const nextHtml = contentHtml || '<p></p>';
    if (editor.getHTML() !== nextHtml) editor.commands.setContent(nextHtml, false);
  }, [editor, contentJson, contentHtml]);

  return <EditorContent editor={editor} />;
}

