import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiRefreshCw, FiUsers, FiZap } from 'react-icons/fi';
import { bdaLeadFiltersToQuery } from '../../../constants/bdaLeadFilters';
import {
  autoAssignLeadsByLanguage,
  getAutoAssignPreview,
} from '../../../utils/callingTeamApi';

const AUTO_ASSIGN_STORAGE_KEY = 'guideXpert_bdaAutoAssignOnLoad';

function readAutoAssignPreference() {
  try {
    return localStorage.getItem(AUTO_ASSIGN_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function LangCard({ title, data, onAssign, assigning, assignError, disabled }) {
  const unassigned = data?.unassignedLeads ?? 0;
  const canAssign = !disabled && data?.activeBdas > 0 && unassigned > 0;
  const hasBdas = (data?.bdas?.length ?? 0) > 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700">
          {data?.unassignedLeads ?? 0} in filtered set
        </span>
      </div>

      <p className="text-sm text-gray-600">
        <span className="font-medium text-gray-800">{data?.activeBdas ?? 0}</span> active {title}{' '}
        BDA{data?.activeBdas === 1 ? '' : 's'}
        {data?.activeBdas > 0 && data?.unassignedLeads > 0 && (
          <span className="text-gray-500">
            {' '}
            → ~{data.perBdaEstimate} each
            {data.remainder > 0 ? ` (+${data.remainder} extra)` : ''}
          </span>
        )}
      </p>

      {hasBdas ? (
        <ul className="flex flex-wrap gap-1.5">
          {data.bdas.map((b) => (
            <li
              key={b.id}
              className="inline-flex items-center bg-white border border-gray-200 rounded-md px-2 py-1 text-xs font-medium text-gray-800"
            >
              {b.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Create active BDAs with language <strong>{title}</strong> first.
        </p>
      )}

      {unassigned === 0 ? (
        <p className="text-center text-xs font-medium text-green-700 py-2 rounded-lg bg-green-50 border border-green-200">
          No unassigned {title} leads in filtered set
        </p>
      ) : (
        <button
          type="button"
          disabled={!canAssign || assigning}
          onClick={() => onAssign(title)}
          className="w-full py-2.5 text-sm font-medium rounded-lg bg-primary-blue text-white disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:opacity-90"
        >
          {assigning ? 'Splitting…' : `Split ${title} leads (${unassigned})`}
        </button>
      )}
      {assignError && <p className="text-xs text-red-600">{assignError}</p>}
    </div>
  );
}

export default function BdaLanguageAutoAssignPanel({
  appliedFilters,
  filterVersion,
  onAssigned,
}) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assigningLang, setAssigningLang] = useState('');
  const [assigningAll, setAssigningAll] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [langErrors, setLangErrors] = useState({});
  const [autoAssignOnLoad, setAutoAssignOnLoad] = useState(readAutoAssignPreference);
  const autoRan = useRef(false);

  const filtersReady = appliedFilters != null;
  const filterParams = useMemo(
    () => (filtersReady ? bdaLeadFiltersToQuery(appliedFilters) : {}),
    [filtersReady, appliedFilters, filterVersion]
  );

  const load = useCallback(async () => {
    if (!filtersReady) {
      setPreview(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    const res = await getAutoAssignPreview(filterParams);
    if (res.success) {
      setPreview(res.data?.data || res.data);
    } else {
      setError(res.message || 'Could not load assignment preview');
    }
    setLoading(false);
  }, [filtersReady, filterParams]);

  useEffect(() => {
    autoRan.current = false;
    load();
  }, [load]);

  const runAssignAll = useCallback(async () => {
    if (!filtersReady) return false;
    setAssigningAll(true);
    setSuccess('');
    setError('');
    const res = await autoAssignLeadsByLanguage({
      language: 'all',
      filterParams,
    });
    setAssigningAll(false);
    if (res.success) {
      const d = res.data?.data || res.data;
      const hindi = d?.Hindi?.assigned ?? 0;
      const telugu = d?.Telugu?.assigned ?? 0;
      setSuccess(`Split complete: ${hindi} Hindi + ${telugu} Telugu leads assigned equally to BDAs.`);
      load();
      onAssigned?.();
      return true;
    }
    setError(res.message || 'Auto-split failed. Deploy latest backend if you see 404.');
    return false;
  }, [load, onAssigned, filterParams, filtersReady]);

  const canAutoSplit =
    filtersReady &&
    preview &&
    ((preview.Hindi?.activeBdas > 0 && preview.Hindi?.unassignedLeads > 0) ||
      (preview.Telugu?.activeBdas > 0 && preview.Telugu?.unassignedLeads > 0));

  useEffect(() => {
    if (!autoAssignOnLoad || !filtersReady || loading || !preview || autoRan.current || !canAutoSplit)
      return;
    autoRan.current = true;
    runAssignAll();
  }, [autoAssignOnLoad, filtersReady, loading, preview, canAutoSplit, runAssignAll]);

  const setAutoAssignPreference = (enabled) => {
    setAutoAssignOnLoad(enabled);
    try {
      localStorage.setItem(AUTO_ASSIGN_STORAGE_KEY, enabled ? '1' : '0');
    } catch {
      /* ignore */
    }
    if (!enabled) {
      autoRan.current = false;
      return;
    }
    if (filtersReady && !loading && preview && canAutoSplit && !assigningAll && !assigningLang) {
      autoRan.current = true;
      runAssignAll();
    }
  };

  const runAssign = async (language) => {
    if (!filtersReady) return;
    setAssigningLang(language);
    setLangErrors((e) => ({ ...e, [language]: '' }));
    setSuccess('');
    const res = await autoAssignLeadsByLanguage({ language, filterParams });
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

  const summary = preview?.summary;
  const totalInPool = summary?.totalInPool ?? 0;
  const hindiTeluguUnassigned =
    summary?.hindiTeluguUnassigned ??
    (preview?.Hindi?.unassignedLeads ?? 0) + (preview?.Telugu?.unassignedLeads ?? 0);
  const otherLanguage = summary?.otherOrMissingLanguage ?? 0;

  return (
    <div className="bg-white rounded-xl border border-primary-blue-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b bg-primary-blue-50/80 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2 m-0">
            <FiZap className="text-primary-blue" aria-hidden />
            Split filtered leads by language
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Hindi → Hindi BDAs, Telugu → Telugu BDAs (equal split). Only affects leads in the
            filtered set above.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={!filtersReady}
          className="p-2 border rounded-lg hover:bg-gray-50 shrink-0 disabled:opacity-40"
          aria-label="Refresh split preview"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {!filtersReady && (
          <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            Apply filters above to preview and split leads by language.
          </p>
        )}

        {assigningAll && (
          <p className="text-sm text-blue-900 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            Splitting {hindiTeluguUnassigned} filtered unassigned leads by language… please wait.
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {success}
          </p>
        )}

        {filtersReady && loading && !assigningAll ? (
          <p className="text-sm text-gray-500">Loading assignment preview…</p>
        ) : null}

        {filtersReady && !loading && (
          <>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium text-gray-900">
                {totalInPool} total in filtered set
              </span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-600">
                {hindiTeluguUnassigned} Hindi/Telugu (auto-split)
              </span>
              {otherLanguage > 0 && (
                <>
                  <span className="text-gray-400">·</span>
                  <span className="text-amber-800">
                    {otherLanguage} missing Hindi/Telugu — assign manually in the table above
                  </span>
                </>
              )}
            </div>

            {totalInPool === 0 && (
              <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                No unassigned leads match the current filters.
              </p>
            )}

            <label className="flex items-start gap-2.5 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoAssignOnLoad}
                onChange={(e) => setAutoAssignPreference(e.target.checked)}
                className="mt-0.5 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">Auto-assign on page load</span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  When enabled, splits filtered Hindi/Telugu leads each time you open BDA Management
                  (once per visit, after filters are applied).
                </span>
              </span>
            </label>

            <button
              type="button"
              disabled={assigningAll || !!assigningLang || !canAutoSplit}
              onClick={runAssignAll}
              className="w-full py-2.5 text-sm font-medium rounded-lg bg-primary-blue text-white hover:enabled:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              <FiUsers className="w-4 h-4 shrink-0" aria-hidden />
              {assigningAll
                ? 'Splitting all leads…'
                : `Split ${hindiTeluguUnassigned} Hindi + Telugu from filtered set`}
            </button>

            <div className="grid gap-3 sm:grid-cols-2">
              <LangCard
                title="Hindi"
                data={preview?.Hindi}
                onAssign={runAssign}
                assigning={assigningLang === 'Hindi'}
                assignError={langErrors.Hindi}
                disabled={!filtersReady}
              />
              <LangCard
                title="Telugu"
                data={preview?.Telugu}
                onAssign={runAssign}
                assigning={assigningLang === 'Telugu'}
                assignError={langErrors.Telugu}
                disabled={!filtersReady}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
