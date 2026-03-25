import RichContentRenderer from './RichContentRenderer';

function formatDate(iso) {
  if (!iso) return new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function EditorPreview({ title, subtitle, author, category, coverImage, contentJson, contentHtml, createdAt }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live Preview</p>
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
        <div className="relative aspect-[16/8]">
          <img
            src={coverImage}
            alt={title || 'Preview cover'}
            className="h-full w-full object-cover opacity-85"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25" />
        </div>
        <div className="p-5">
          <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90 ring-1 ring-white/20">
            {category || 'General'}
          </span>
          <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">
            {title || 'Article title preview'}
          </h2>
          <p className="mt-2 text-sm text-white/80">{subtitle || 'Subtitle preview goes here.'}</p>
          <p className="mt-3 text-xs text-white/75">
            <span className="font-semibold text-white">{author || 'Publisher'}</span> · {formatDate(createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <RichContentRenderer contentJson={contentJson} contentHtml={contentHtml} />
      </div>
    </div>
  );
}

