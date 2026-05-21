import { useCallback, useEffect, useRef, useState } from 'react';
import { FiRefreshCw, FiUsers, FiZap } from 'react-icons/fi';
import {
  autoAssignLeadsByLanguage,
  getAutoAssignPreview,
} from '../../../utils/callingTeamApi';

function LangCard({ title, data, onAssign, assigning, assignError, splitDone }) {
  const canAssign = data?.activeBdas > 0 && data?.unassignedLeads > 0 && !splitDone;
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white border">
          {data?.unassignedLeads ?? 0} unassigned
        </span>
      </div>
      <p className="text-sm text-gray-600">
        {data?.activeBdas ?? 0} active {title} BDA{data?.activeBdas === 1 ? '' : 's'}
        {data?.activeBdas > 0 && data?.unassignedLeads > 0 && (
          <>
            {' '}
            → ~{data.perBdaEstimate} leads each
            {data.remainder > 0 ? ` (+${data.remainder} extra)` : ''}
          </>
        )}
      </p>
      {data?.bdas?.length > 0 ? (
        <ul className="text-xs text-gray-700 flex flex-wrap gap-2">
          {data.bdas.map((b) => (
            <li key={b.id} className="bg-white border rounded-md px-2 py-1">
              {b.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
          Create active BDAs with language <strong>{title}</strong> first.
        </p>
      )}
      {splitDone && data?.unassignedLeads === 0 ? (
        <p className="text-xs text-green-700 font-medium">All {title} leads assigned</p>
      ) : (
        <button
          type="button"
          disabled={!canAssign || assigning}
          onClick={() => onAssign(title)}
          className="mt-auto py-2 text-sm font-medium rounded-lg bg-primary-blue text-white disabled:opacity-40 hover:opacity-90"
        >
          {assigning ? 'Splitting…' : `Re-split ${title} leads`}
        </button>
      )}
      {assignError && <p className="text-xs text-red-600">{assignError}</p>}
    </div>
  );
}

export default function BdaLanguageAutoAssignPanel({ onAssigned, autoSplitOnLoad = true }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assigningLang, setAssigningLang] = useState('');
  const [assigningAll, setAssigningAll] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [langErrors, setLangErrors] = useState({});
  const [splitDone, setSplitDone] = useState(false);
  const autoRan = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const res = await getAutoAssignPreview();
    if (res.success) {
      setPreview(res.data?.data || res.data);
    } else {
      setError(res.message || 'Could not load assignment preview');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runAssignAll = useCallback(async () => {
    setAssigningAll(true);
    setSuccess('');
    setError('');
    const res = await autoAssignLeadsByLanguage({ language: 'all' });
    setAssigningAll(false);
    if (res.success) {
      const d = res.data?.data || res.data;
      const hindi = d?.Hindi?.assigned ?? 0;
      const telugu = d?.Telugu?.assigned ?? 0;
      setSuccess(`Split complete: ${hindi} Hindi + ${telugu} Telugu leads assigned equally to BDAs.`);
      setSplitDone(true);
      load();
      onAssigned?.();
      return true;
    }
    setError(res.message || 'Auto-split failed. Deploy latest backend if you see 404.');
    return false;
  }, [load, onAssigned]);

  const canAutoSplit =
    preview &&
    ((preview.Hindi?.activeBdas > 0 && preview.Hindi?.unassignedLeads > 0) ||
      (preview.Telugu?.activeBdas > 0 && preview.Telugu?.unassignedLeads > 0));

  useEffect(() => {
    if (!autoSplitOnLoad || loading || !preview || autoRan.current || !canAutoSplit) return;
    autoRan.current = true;
    runAssignAll();
  }, [autoSplitOnLoad, loading, preview, canAutoSplit, runAssignAll]);

  const runAssign = async (language) => {
    setAssigningLang(language);
    setLangErrors((e) => ({ ...e, [language]: '' }));
    setSuccess('');
    const res = await autoAssignLeadsByLanguage({ language });
    setAssigningLang('');
    if (res.success) {
      const d = res.data?.data || res.data;
      setSuccess(
        `${language}: assigned ${d.assigned ?? 0} of ${d.totalLeads ?? 0} leads equally among BDAs.`
      );
      load();
      onAssigned?.();
    } else {
      setLangErrors((e) => ({ ...e, [language]: res.message || 'Assign failed' }));
    }
  };

  const totalUnassigned =
    (preview?.Hindi?.unassignedLeads ?? 0) + (preview?.Telugu?.unassignedLeads ?? 0);

  return (
    <section className="bg-white rounded-xl border-2 border-primary-blue-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b bg-primary-blue-50 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <FiZap className="text-primary-blue" />
            Split leads by language (automatic)
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Hindi leads → Hindi BDAs (equal). Telugu leads → Telugu BDAs (equal). Uses form{' '}
            <strong>preferredLanguage</strong> from Section 2.
          </p>
        </div>
        <button type="button" onClick={load} className="p-2 border rounded-lg bg-white hover:bg-gray-50">
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {assigningAll && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-900">
            Splitting {totalUnassigned} unassigned leads by language… please wait.
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && (
          <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {success}
          </p>
        )}

        {loading && !assigningAll ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : (
          <>
            <button
              type="button"
              disabled={assigningAll || assigningLang || !canAutoSplit}
              onClick={runAssignAll}
              className="w-full py-3 text-sm font-semibold rounded-lg bg-primary-blue text-white hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiUsers />
              {assigningAll
                ? 'Splitting all leads…'
                : `Split all ${totalUnassigned} unassigned leads now (Hindi + Telugu)`}
            </button>

            <div className="grid gap-4 md:grid-cols-2">
              <LangCard
                title="Hindi"
                data={preview?.Hindi}
                onAssign={runAssign}
                assigning={assigningLang === 'Hindi'}
                assignError={langErrors.Hindi}
                splitDone={splitDone}
              />
              <LangCard
                title="Telugu"
                data={preview?.Telugu}
                onAssign={runAssign}
                assigning={assigningLang === 'Telugu'}
                assignError={langErrors.Telugu}
                splitDone={splitDone}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
