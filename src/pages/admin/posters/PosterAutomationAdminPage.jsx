import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  FiSave,
  FiTrash2,
  FiUpload,
  FiImage,
  FiFileText,
  FiAlertCircle,
  FiRefreshCw,
  FiGlobe,
  FiSidebar,
  FiCopy,
  FiCheck,
} from 'react-icons/fi';
import {
  listPosterTemplates,
  createPosterTemplate,
  updatePosterTemplate,
  deletePosterTemplate,
  publishPosterTemplate,
  unpublishPosterTemplate,
} from '../../../utils/adminApi';
import { clearPosterRouteCache } from '../../../components/Posters/usePosterByRoute';
import DashboardLayout from '../../../components/Admin/DashboardLayout';
import PosterEditorCanvas from './PosterEditorCanvas';
import PosterListSidebar from './PosterListSidebar';
import PosterElementToolbar from './PosterElementToolbar';

function normalizeRouteClient(route) {
  let s = String(route ?? '').trim();
  if (!s) return '/';
  s = s.split('?')[0].split('#')[0];
  if (!s.startsWith('/')) s = `/${s}`;
  return s.toLowerCase();
}

function defaultNameField() {
  return { x: 12, y: 12, fontSize: 22, color: '#111827', fontWeight: '600', textAlign: 'left' };
}

function defaultMobileField() {
  return { x: 12, y: 24, fontSize: 18, color: '#111827', fontWeight: '500', textAlign: 'left' };
}

function emptyDraft() {
  return {
    name: 'New poster',
    route: '/p/my-campaign',
    svgTemplate: '',
    nameField: defaultNameField(),
    mobileField: defaultMobileField(),
    published: false,
  };
}

/** True when upstream does not expose poster admin routes (wrong proxy or old deploy). */
function isPosterAdmin404(res) {
  return Boolean(res && res.success === false && res.status === 404);
}

const POSTER_API_404_SAVE_HINT =
  'The poster API returned 404. Fix the backend/proxy (see the yellow notice above); Save cannot reach the server until then.';

function cloneDraftFromPoster(p) {
  return {
    name: p.name || '',
    route: p.route || '/p/my-campaign',
    svgTemplate: p.svgTemplate || '',
    nameField: p.nameField && typeof p.nameField === 'object' ? { ...p.nameField } : defaultNameField(),
    mobileField: p.mobileField && typeof p.mobileField === 'object' ? { ...p.mobileField } : defaultMobileField(),
    published: !!p.published,
  };
}

function TemplateTokensReference({ previewVariables }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Frontend usage</h3>
      <p className="mt-2 text-xs leading-relaxed text-gray-500">
        On the site, URLs must use the <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.6875rem]">/p/…</code> prefix (same as this template&apos;s route). Pass real values with{' '}
        <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.6875rem]">DynamicRoutePoster</code> — only{' '}
        <strong className="font-medium text-gray-700">name</strong> and <strong className="font-medium text-gray-700">mobile</strong> are supported.
      </p>
      <dl className="mt-4 space-y-2.5 text-xs">
        <div className="flex justify-between gap-3 border-b border-gray-50 pb-2">
          <dt className="text-gray-600">variables.name</dt>
          <dd className="truncate text-right text-gray-800">{previewVariables.name}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-gray-600">variables.mobile</dt>
          <dd className="truncate text-right text-gray-800">{previewVariables.mobile}</dd>
        </div>
      </dl>
    </div>
  );
}

export default function PosterAutomationAdminPage() {
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [draft, setDraft] = useState(() => emptyDraft());
  const [baseline, setBaseline] = useState(null);
  const [selectedOverlayKey, setSelectedOverlayKey] = useState(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [posterApiMisconfigured, setPosterApiMisconfigured] = useState(false);
  const fileRef = useRef(null);
  const posterExportRef = useRef(null);

  const previewVariables = useMemo(
    () => ({
      name: 'Sample name',
      mobile: '98765 43210',
    }),
    []
  );

  const publicUrl = useMemo(() => {
    const path = normalizeRouteClient(draft.route);
    if (typeof window === 'undefined') return path;
    return `${window.location.origin}${path}`;
  }, [draft.route]);

  const loadList = useCallback(async () => {
    setError('');
    const res = await listPosterTemplates();
    if (!res.success) {
      if (isPosterAdmin404(res)) {
        setPosterApiMisconfigured(true);
      }
      setError(res.message || 'Failed to load posters');
      setPosters([]);
      return;
    }
    setPosterApiMisconfigured(false);
    const list = res.data?.posters ?? res.data?.data?.posters;
    setPosters(Array.isArray(list) ? list : []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadList();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadList]);

  const isDirty = useMemo(() => {
    if (isNew) return true;
    if (!baseline) return false;
    return JSON.stringify(draft) !== JSON.stringify(baseline);
  }, [draft, baseline, isNew]);

  const selectPoster = (id) => {
    const p = posters.find((x) => x.id === id);
    if (!p) return;
    setIsNew(false);
    setSelectedId(id);
    const d = cloneDraftFromPoster(p);
    setDraft(d);
    setBaseline(JSON.parse(JSON.stringify(d)));
    setSelectedOverlayKey(null);
  };

  const handleCreate = () => {
    setIsNew(true);
    setSelectedId(null);
    const d = emptyDraft();
    setDraft(d);
    setBaseline(JSON.parse(JSON.stringify(d)));
    setSelectedOverlayKey(null);
  };

  const handleDiscard = () => {
    if (isNew) {
      handleCreate();
      return;
    }
    if (baseline) {
      setDraft(JSON.parse(JSON.stringify(baseline)));
    }
    setSelectedOverlayKey(null);
  };

  const handleSave = async () => {
    const routeNorm = normalizeRouteClient(draft.route);
    if (!draft.name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!routeNorm.startsWith('/p/') || routeNorm.length <= 3) {
      setError('Frontend route must start with /p/ (for example /p/winter-drive) so visitors get a matching public page.');
      return;
    }
    if (!draft.svgTemplate.trim()) {
      setError('Upload an SVG template first.');
      return;
    }
    if (!/<svg[\s>/]/i.test(draft.svgTemplate)) {
      setError('SVG template must contain an <svg> root.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        name: draft.name.trim(),
        route: routeNorm,
        svgTemplate: draft.svgTemplate,
        nameField: draft.nameField,
        mobileField: draft.mobileField,
      };
      if (isNew) {
        const res = await createPosterTemplate(payload);
        if (!res.success) {
          if (isPosterAdmin404(res)) {
            setPosterApiMisconfigured(true);
            setError(POSTER_API_404_SAVE_HINT);
          } else {
            setError(res.message || 'Save failed');
          }
          return;
        }
        const created = res.data?.poster ?? res.data;
        if (created?.id) {
          clearPosterRouteCache(routeNorm);
          setIsNew(false);
          setSelectedId(created.id);
          const d = cloneDraftFromPoster(created);
          setDraft(d);
          setBaseline(JSON.parse(JSON.stringify(d)));
        }
        await loadList();
      } else if (selectedId) {
        const res = await updatePosterTemplate(selectedId, payload);
        if (!res.success) {
          if (isPosterAdmin404(res)) {
            setPosterApiMisconfigured(true);
            setError(POSTER_API_404_SAVE_HINT);
          } else {
            setError(res.message || 'Save failed');
          }
          return;
        }
        clearPosterRouteCache(routeNorm);
        const updated = res.data?.poster ?? res.data;
        if (baseline) {
          const prev = normalizeRouteClient(baseline.route);
          if (prev !== routeNorm) clearPosterRouteCache(prev);
        }
        if (updated && typeof updated === 'object') {
          const d = cloneDraftFromPoster(updated);
          setDraft(d);
          setBaseline(JSON.parse(JSON.stringify(d)));
        } else {
          const merged = { ...draft, ...payload, id: selectedId };
          setDraft(merged);
          setBaseline(JSON.parse(JSON.stringify(merged)));
        }
        await loadList();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isNew || !selectedId) return;
    if (!window.confirm('Delete this poster configuration?')) return;
    setSaving(true);
    setError('');
    try {
      const routeBefore = normalizeRouteClient(draft.route);
      const res = await deletePosterTemplate(selectedId);
      if (!res.success) {
        const missing = isPosterAdmin404(res);
        if (missing) setPosterApiMisconfigured(true);
        setError(missing ? POSTER_API_404_SAVE_HINT : res.message || 'Delete failed');
        return;
      }
      clearPosterRouteCache(routeBefore);
      setSelectedId(null);
      setIsNew(false);
      setDraft(emptyDraft());
      setBaseline(null);
      setSelectedOverlayKey(null);
      await loadList();
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (isNew || !selectedId || isDirty) return;
    setPublishing(true);
    setError('');
    try {
      const res = await publishPosterTemplate(selectedId);
      if (!res.success) {
        const missing = isPosterAdmin404(res);
        if (missing) setPosterApiMisconfigured(true);
        setError(missing ? POSTER_API_404_SAVE_HINT : res.message || 'Publish failed');
        return;
      }
      const p = res.data?.poster;
      if (p) {
        const d = cloneDraftFromPoster(p);
        setDraft(d);
        setBaseline(JSON.parse(JSON.stringify(d)));
        clearPosterRouteCache(normalizeRouteClient(d.route));
      }
      await loadList();
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (isNew || !selectedId || isDirty) return;
    setPublishing(true);
    setError('');
    try {
      const res = await unpublishPosterTemplate(selectedId);
      if (!res.success) {
        const missing = isPosterAdmin404(res);
        if (missing) setPosterApiMisconfigured(true);
        setError(missing ? POSTER_API_404_SAVE_HINT : res.message || 'Unpublish failed');
        return;
      }
      const p = res.data?.poster;
      if (p) {
        const d = cloneDraftFromPoster(p);
        setDraft(d);
        setBaseline(JSON.parse(JSON.stringify(d)));
        clearPosterRouteCache(normalizeRouteClient(d.route));
      }
      await loadList();
    } finally {
      setPublishing(false);
    }
  };

  const copyPublicUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setUrlCopied(true);
      window.setTimeout(() => setUrlCopied(false), 2000);
    } catch {
      setError('Could not copy URL to clipboard.');
    }
  };

  const updateFieldPosition = (key, x, y) => {
    const k = key === 'name' ? 'nameField' : 'mobileField';
    setDraft((d) => ({
      ...d,
      [k]: { ...d[k], x, y },
    }));
  };

  const onSvgFile = (file) => {
    if (!file || file.type !== 'image/svg+xml') {
      setError('Please choose an .svg file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      setDraft((d) => ({ ...d, svgTemplate: text }));
      setError('');
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f) onSvgFile(f);
  };

  const handleExportPng = async () => {
    const node = posterExportRef.current;
    if (!(node instanceof HTMLElement)) return;
    setExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(draft.name || 'poster').replace(/\s+/g, '-').slice(0, 48)}.png`;
      a.click();
    } catch (err) {
      console.error(err);
      setError('PNG export failed.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    const node = posterExportRef.current;
    if (!(node instanceof HTMLElement)) return;
    setExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const w = canvas.width;
      const h = canvas.height;
      const pdf = new jsPDF({
        orientation: w > h ? 'landscape' : 'portrait',
        unit: 'px',
        format: [w, h],
      });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h);
      pdf.save(`${(draft.name || 'poster').replace(/\s+/g, '-').slice(0, 48)}.pdf`);
    } catch (err) {
      console.error(err);
      setError('PDF export failed.');
    } finally {
      setExporting(false);
    }
  };

  const routeNorm = normalizeRouteClient(draft.route);
  const routeOkForPublic = routeNorm.startsWith('/p/') && routeNorm.length > 3;
  const publishActionsEnabled =
    !isNew && !!selectedId && !isDirty && routeOkForPublic && !!draft.svgTemplate.trim();

  const toolBtn =
    'inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-800 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <DashboardLayout
      title="Poster automation"
      subtitle="Design an SVG template, position name and mobile overlays, then save and publish to a public URL under /p/… End users verify with mobile against activation records."
    >
      {posterApiMisconfigured ? (
        <div
          className="mb-4 rounded-2xl border-2 border-amber-400 bg-amber-50 px-4 py-4 text-sm text-amber-950 shadow-sm sm:px-5"
          role="alert"
        >
          <div className="flex gap-3">
            <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
            <div className="min-w-0 space-y-3">
              <div>
                <p className="font-semibold text-amber-950">Poster API not reachable (404)</p>
                <p className="mt-1.5 leading-relaxed text-amber-950/95">
                  The browser calls <code className="rounded bg-amber-100/90 px-1.5 py-0.5 font-mono text-[0.8125rem]">/api/admin/posters</code>.
                  A 404 means the server that received the request does not expose that route yet (common: hosted API not redeployed, or Vite is proxying to the wrong host).
                </p>
              </div>
              <div>
                <p className="font-medium text-amber-950">Local development</p>
                <ol className="mt-2 list-decimal space-y-1.5 pl-5 leading-relaxed">
                  <li>
                    Run <code className="rounded bg-amber-100/90 px-1 py-0.5 font-mono text-[0.8125rem]">GuideXpert-Backend</code> (MongoDB + env + port you use, e.g. 5000).
                  </li>
                  <li>
                    Copy <code className="rounded bg-amber-100/90 px-1 py-0.5 font-mono text-[0.8125rem]">.env.development.local.example</code> to{' '}
                    <code className="rounded bg-amber-100/90 px-1 py-0.5 font-mono text-[0.8125rem]">.env.development.local</code> and set{' '}
                    <code className="rounded bg-amber-100/90 px-1 py-0.5 font-mono text-[0.8125rem]">VITE_PROXY_TARGET=http://localhost:5000</code> (match your backend port).
                  </li>
                  <li>
                    Restart <code className="rounded bg-amber-100/90 px-1 py-0.5 font-mono text-[0.8125rem]">npm run dev</code> and confirm the terminal line{' '}
                    <code className="rounded bg-amber-100/90 px-1 py-0.5 font-mono text-[0.8125rem]">[vite] dev proxy: /api → …</code> points at your machine.
                  </li>
                  <li className="marker:font-normal">
                    Optionally set <code className="rounded bg-amber-100/90 px-1 py-0.5 font-mono text-[0.8125rem]">VITE_API_URL=http://localhost:5000/api</code> so login and poster calls use the same host (see <code className="rounded bg-amber-100/90 px-1 py-0.5 font-mono text-[0.8125rem]">.env.example</code>).
                  </li>
                </ol>
              </div>
              <p className="leading-relaxed text-amber-950/95">
                <span className="font-medium">Production:</span> deploy the latest backend so{' '}
                <code className="rounded bg-amber-100/90 px-1 py-0.5 font-mono text-[0.8125rem]">GET /api/admin/posters</code> exists on the API host your app uses.
              </p>
              <p className="text-xs text-amber-900/90">
                This notice stays until loading the list succeeds. Use Refresh list after fixing the proxy or deployment.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 shadow-sm">
          <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-medium">Something went wrong</p>
            <p className="mt-0.5 text-red-800/90">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError('')}
            className="shrink-0 text-xs font-medium text-red-700 underline-offset-2 hover:underline"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-5 xl:flex-row xl:items-stretch xl:gap-6">
        <aside className="w-full shrink-0 xl:w-[280px]">
          <PosterListSidebar
            posters={posters}
            selectedId={selectedId}
            isNew={isNew}
            onSelect={selectPoster}
            onCreate={handleCreate}
            disabled={loading || saving}
          />
        </aside>

        <div className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm ring-1 ring-black/[0.03]">
            <div className="flex flex-col gap-4 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold tracking-tight text-primary-navy">Template editor</h2>
                  {isDirty ? (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-amber-900 ring-1 ring-amber-200/80">
                      Unsaved
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[0.6875rem] font-medium uppercase tracking-wide text-slate-600">
                      Saved
                    </span>
                  )}
                  {!isNew && selectedId && draft.published ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-emerald-900 ring-1 ring-emerald-200/80">
                      Live
                    </span>
                  ) : !isNew && selectedId ? (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[0.6875rem] font-medium uppercase tracking-wide text-slate-600">
                      Draft
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-sm text-gray-600">{draft.name || 'Untitled template'}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !isDirty}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-[0.97] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <FiSave className="h-4 w-4" aria-hidden />
                  {saving ? 'Saving…' : 'Save'}
                </button>
                {!isNew && selectedId ? (
                  <button
                    type="button"
                    onClick={handleDiscard}
                    disabled={saving || !isDirty}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Discard
                  </button>
                ) : null}
                {!isNew && selectedId ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/80 px-3 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    <FiTrash2 className="h-4 w-4" aria-hidden />
                    Delete
                  </button>
                ) : null}
              </div>
            </div>

            <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/90 to-white px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-900/80">Publishing</h3>
                  {isNew || !selectedId ? (
                    <p className="mt-1.5 text-sm leading-relaxed text-emerald-900/80">
                      <strong className="font-semibold text-emerald-950">Save this template</strong> (use <span className="font-medium">Save</span> above) to unlock publishing. Only saved templates can go live at a{' '}
                      <code className="rounded bg-white/80 px-1 py-0.5 font-mono text-[0.8125rem] text-emerald-950">/p/…</code> URL.
                    </p>
                  ) : (
                    <p className="mt-1.5 text-sm text-slate-600">
                      {draft.published
                        ? 'This template is live. Unpublish to hide it from the public page; visitors will get a “not found” until you publish again.'
                        : 'Publishing makes this design available at your public URL. Save any edits first, then publish.'}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={
                      saving || publishing || isNew || !selectedId || !publishActionsEnabled || draft.published
                    }
                    title={
                      isNew || !selectedId
                        ? 'Save the template first'
                        : isDirty
                          ? 'Save changes before publishing'
                          : !routeOkForPublic
                            ? 'Use a route starting with /p/'
                            : !draft.svgTemplate.trim()
                              ? 'Add an SVG first'
                              : undefined
                    }
                    className="inline-flex min-h-[2.75rem] min-w-[7.5rem] items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {publishing ? 'Publishing…' : 'Publish'}
                  </button>
                  <button
                    type="button"
                    onClick={handleUnpublish}
                    disabled={
                      saving || publishing || isNew || !selectedId || !publishActionsEnabled || !draft.published
                    }
                    className="inline-flex min-h-[2.75rem] items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {publishing ? 'Updating…' : 'Unpublish'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".svg,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onSvgFile(f);
                    e.target.value = '';
                  }}
                />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={loading || saving} className={toolBtn}>
                  <FiUpload className="h-4 w-4 text-gray-500" aria-hidden />
                  Upload SVG
                </button>
                <button
                  type="button"
                  onClick={handleExportPng}
                  disabled={exporting || !draft.svgTemplate.trim() || loading}
                  className={toolBtn}
                >
                  <FiImage className="h-4 w-4 text-gray-500" aria-hidden />
                  {exporting ? 'Exporting…' : 'Export PNG'}
                </button>
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={exporting || !draft.svgTemplate.trim() || loading}
                  className={toolBtn}
                >
                  <FiFileText className="h-4 w-4 text-gray-500" aria-hidden />
                  {exporting ? 'Exporting…' : 'Export PDF'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => void loadList()}
                disabled={loading || saving}
                className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-transparent px-2 py-2 text-sm font-medium text-gray-600 hover:bg-white hover:ring-1 hover:ring-gray-200 sm:self-auto"
              >
                <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden />
                Refresh list
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-gray-500">Display name</span>
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-primary-blue-400 focus:outline-none focus:ring-2 focus:ring-primary-blue-400/20"
                    placeholder="e.g. Certificate poster"
                  />
                </label>
                <label className="block">
                  <span className="flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-gray-500">
                    <FiGlobe className="h-3.5 w-3.5" aria-hidden />
                    Frontend route
                  </span>
                  <input
                    value={draft.route}
                    onChange={(e) => setDraft((d) => ({ ...d, route: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-mono text-sm text-gray-900 shadow-sm focus:border-primary-blue-400 focus:outline-none focus:ring-2 focus:ring-primary-blue-400/20"
                    placeholder="/p/winter-drive"
                  />
                  <span className="mt-2 block text-[0.6875rem] text-gray-400">
                    Normalized key:{' '}
                    <code className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-gray-700">
                      {normalizeRouteClient(draft.route)}
                    </code>
                    {!routeOkForPublic ? (
                      <span className="mt-1 block text-amber-700">Must start with /p/ so it matches the public app route.</span>
                    ) : null}
                  </span>
                </label>
              </div>

              {!isNew && selectedId && routeOkForPublic ? (
                <div className="mb-6 rounded-2xl border border-slate-200/90 bg-slate-50/80 px-4 py-3 sm:px-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-slate-500">Public page URL</p>
                      <p className="mt-1 truncate font-mono text-sm text-slate-800">{publicUrl}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void copyPublicUrl()}
                      className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 sm:self-auto"
                    >
                      {urlCopied ? <FiCheck className="h-4 w-4 text-emerald-600" aria-hidden /> : <FiCopy className="h-4 w-4" aria-hidden />}
                      {urlCopied ? 'Copied' : 'Copy URL'}
                    </button>
                  </div>
                  <p className="mt-2 text-[0.6875rem] leading-relaxed text-slate-500">
                    Visitors open this link, enter their mobile, and downloads unlock after a match in Training Feedback.
                  </p>
                </div>
              ) : null}

              {loading ? (
                <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FiRefreshCw className="h-5 w-5 animate-spin" aria-hidden />
                    Loading…
                  </div>
                </div>
              ) : (
                <PosterEditorCanvas
                  ref={posterExportRef}
                  svgTemplate={draft.svgTemplate}
                  nameField={draft.nameField}
                  mobileField={draft.mobileField}
                  variables={previewVariables}
                  selectedKey={selectedOverlayKey}
                  onSelectKey={setSelectedOverlayKey}
                  onUpdateFieldPosition={updateFieldPosition}
                  onFileDrop={handleDrop}
                  emptyHint="Drop an SVG here or use Upload SVG"
                />
              )}
            </div>
          </div>
        </div>

        <aside className="w-full shrink-0 xl:w-[380px]">
          <div className="space-y-5 xl:sticky xl:top-4">
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-slate-50/80 to-white p-1 shadow-sm ring-1 ring-black/[0.03]">
              <div className="rounded-[0.875rem] border border-gray-100/80 bg-white px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-navy/10 text-primary-navy">
                    <FiSidebar className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Inspector</h3>
                    <p className="text-xs text-gray-500">Name & mobile — position and style</p>
                  </div>
                </div>
              </div>
            </div>
            <PosterElementToolbar
              nameField={draft.nameField}
              mobileField={draft.mobileField}
              onChangeName={(patch) => setDraft((d) => ({ ...d, nameField: { ...d.nameField, ...patch } }))}
              onChangeMobile={(patch) => setDraft((d) => ({ ...d, mobileField: { ...d.mobileField, ...patch } }))}
            />
            <TemplateTokensReference previewVariables={previewVariables} />
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
