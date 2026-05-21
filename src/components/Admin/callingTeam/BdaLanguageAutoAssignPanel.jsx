import { useCallback, useEffect, useState } from 'react';
import { FiRefreshCw, FiUsers } from 'react-icons/fi';
import {
  autoAssignLeadsByLanguage,
  getAutoAssignPreview,
} from '../../../utils/callingTeamApi';

function LangCard({ title, data, onAssign, assigning, assignError }) {
  const canAssign = data?.activeBdas > 0 && data?.unassignedLeads > 0;
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white border">
          {data?.unassignedLeads ?? 0} unassigned leads
        </span>
      </div>
      <p className="text-sm text-gray-600">
        {data?.activeBdas ?? 0} active BDA{data?.activeBdas === 1 ? '' : 's'}
        {data?.activeBdas > 0 && data?.unassignedLeads > 0 && (
          <>
            {' '}
            — ~{data.perBdaEstimate} leads each
            {data.remainder > 0 ? ` (+${data.remainder} extra to first BDAs)` : ''}
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
          Add active BDAs with language <strong>{title}</strong> above before auto-assigning.
        </p>
      )}
      <button
        type="button"
        disabled={!canAssign || assigning}
        onClick={() => onAssign(title)}
        className="mt-auto py-2 text-sm font-medium rounded-lg bg-primary-blue text-white disabled:opacity-40 hover:opacity-90"
      >
        {assigning ? 'Assigning…' : `Split all ${title} leads equally`}
      </button>
      {assignError && <p className="text-xs text-red-600">{assignError}</p>}
    </div>
  );
}

export default function BdaLanguageAutoAssignPanel({ onAssigned }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assigningLang, setAssigningLang] = useState('');
  const [assigningAll, setAssigningAll] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [langErrors, setLangErrors] = useState({});

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

  const runAssign = async (language) => {
    setAssigningLang(language);
    setLangErrors((e) => ({ ...e, [language]: '' }));
    setSuccess('');
    const res = await autoAssignLeadsByLanguage({ language });
    setAssigningLang('');
    if (res.success) {
      const d = res.data?.data || res.data;
      setSuccess(
        `${language}: assigned ${d.assigned ?? 0} of ${d.totalLeads ?? 0} leads` +
          (d.failed?.length ? ` (${d.failed.length} failed)` : '')
      );
      load();
      onAssigned?.();
    } else {
      setLangErrors((e) => ({ ...e, [language]: res.message || 'Assign failed' }));
    }
  };

  const runAssignAll = async () => {
    setAssigningAll(true);
    setSuccess('');
    setError('');
    const res = await autoAssignLeadsByLanguage({ language: 'all' });
    setAssigningAll(false);
    if (res.success) {
      const d = res.data?.data || res.data;
      const hindi = d?.Hindi?.assigned ?? 0;
      const telugu = d?.Telugu?.assigned ?? 0;
      setSuccess(`Assigned ${hindi} Hindi + ${telugu} Telugu leads (equal split per language).`);
      load();
      onAssigned?.();
    } else {
      setError(res.message || 'Assign failed');
    }
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <FiUsers className="text-primary-blue" />
            Auto-assign leads by preferred language
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Uses <code className="text-xs bg-gray-100 px-1 rounded">preferredLanguage</code> from IIT form
            Section 2. Splits unassigned leads equally among active BDAs with the same language.
          </p>
        </div>
        <button type="button" onClick={load} className="p-2 border rounded-lg hover:bg-gray-50" aria-label="Refresh">
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{success}</p>}

        {loading ? (
          <p className="text-sm text-gray-500">Loading preview…</p>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <LangCard
                title="Hindi"
                data={preview?.Hindi}
                onAssign={runAssign}
                assigning={assigningLang === 'Hindi'}
                assignError={langErrors.Hindi}
              />
              <LangCard
                title="Telugu"
                data={preview?.Telugu}
                onAssign={runAssign}
                assigning={assigningLang === 'Telugu'}
                assignError={langErrors.Telugu}
              />
            </div>
            <button
              type="button"
              disabled={assigningAll || assigningLang}
              onClick={runAssignAll}
              className="w-full py-2.5 text-sm font-medium rounded-lg border-2 border-primary-blue text-primary-navy hover:bg-primary-blue-50 disabled:opacity-50"
            >
              {assigningAll ? 'Assigning both languages…' : 'Assign all Hindi + Telugu (equal split each)'}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
