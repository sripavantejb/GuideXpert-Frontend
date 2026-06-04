import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiRefreshCw, FiUserCheck, FiUserPlus } from 'react-icons/fi';
import AssignToBdaModal from './AssignToBdaModal';
import TableSkeleton from '../../UI/TableSkeleton';
import { languageBadgeClass } from '../../../constants/bdaLanguage';
import { bdaLeadFiltersToQuery } from '../../../constants/bdaLeadFilters';
import {
  bulkMapFilteredLeadsToRespectiveBda,
  bulkMapLeadsToRespectiveBda,
  getCallingTeamLeads,
} from '../../../utils/callingTeamApi';
import { getLeadClassStatus } from '../../../utils/callingDataLeadMapper';

const BULK_ASSIGN_MAX = 200;

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function MeetBadge({ attended, label }) {
  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
        attended
          ? 'bg-green-100 text-green-900 border border-green-200'
          : 'bg-gray-100 text-gray-500 border border-gray-200'
      }`}
    >
      {label}: {attended ? 'Yes' : 'No'}
    </span>
  );
}

export default function BdaUnassignedLeadPool({ appliedFilters, filterVersion, onAssigned }) {
  const keepExistingBda = appliedFilters?.keepExistingBda === true;
  const meetPresence = appliedFilters?.meetPresence || '';
  const meetFilterActive = meetPresence === 'attended' || meetPresence === 'not_attended';
  const meetLabel =
    meetPresence === 'attended'
      ? 'attended meet'
      : meetPresence === 'not_attended'
        ? 'did not attend meet'
        : '';
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [selected, setSelected] = useState(new Set());
  const [assignOpen, setAssignOpen] = useState(false);
  const [mapConfirmOpen, setMapConfirmOpen] = useState(false);
  const [mapAllConfirmOpen, setMapAllConfirmOpen] = useState(false);
  const [mapping, setMapping] = useState(false);

  const filtersReady = appliedFilters != null;

  const load = useCallback(async () => {
    if (!filtersReady) {
      setRows([]);
      setPagination({ totalPages: 1, total: 0 });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    const params = {
      page,
      limit: 25,
      unassignedOnly: 'true',
      ...bdaLeadFiltersToQuery(appliedFilters),
    };
    const res = await getCallingTeamLeads(params);
    if (res.success) {
      setRows(res.data?.data || []);
      setPagination(res.data?.pagination || { page: 1, totalPages: 1, total: 0 });
      setSelected(new Set());
    } else {
      setError(res.message || 'Failed to load unassigned leads');
    }
    setLoading(false);
  }, [page, appliedFilters, filtersReady]);

  useEffect(() => {
    load();
  }, [load]);

  const pageIds = useMemo(() => rows.map((r) => r.id), [rows]);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const selectedIds = useMemo(() => Array.from(selected), [selected]);
  const selectedRows = useMemo(
    () => rows.filter((r) => selected.has(r.id)),
    [rows, selected]
  );
  const selectedWithPriorBda = useMemo(
    () => selectedRows.filter((r) => !!(r.assignedBdaId || r.assignedBdaName)),
    [selectedRows]
  );
  const selectedUnassigned = useMemo(
    () => selectedRows.filter((r) => !(r.assignedBdaId || r.assignedBdaName)),
    [selectedRows]
  );
  const priorBdaIds = useMemo(
    () => selectedWithPriorBda.map((r) => r.id).slice(0, BULK_ASSIGN_MAX),
    [selectedWithPriorBda]
  );
  const unassignedIds = useMemo(
    () => selectedUnassigned.map((r) => r.id).slice(0, BULK_ASSIGN_MAX),
    [selectedUnassigned]
  );
  const overBulkLimit = selectedIds.length > BULK_ASSIGN_MAX;

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAssignSuccess = (result) => {
    const updated = result?.updated ?? 0;
    const failed = result?.failed?.length ?? 0;
    const kept = result?.skippedSameBda ?? 0;
    const skippedUnassigned = result?.skippedUnassigned ?? 0;
    const keptNote = kept > 0 ? ` ${kept} already on their BDA.` : '';
    const skipNote =
      skippedUnassigned > 0 ? ` ${skippedUnassigned} skipped (no previous BDA).` : '';
    setSuccess(
      failed > 0
        ? `Processed ${updated} lead(s).${keptNote}${skipNote} ${failed} failed — refresh and retry.`
        : `Processed ${updated} lead(s).${keptNote}${skipNote}`
    );
    load();
    onAssigned?.();
  };

  const handleMapRespective = async () => {
    if (priorBdaIds.length === 0) {
      setError('None of the selected leads have a previous BDA. Use Assign unassigned instead.');
      return;
    }
    setMapping(true);
    setError('');
    const res = await bulkMapLeadsToRespectiveBda({ leadIds: priorBdaIds });
    setMapping(false);
    setMapConfirmOpen(false);
    if (res.success) {
      handleAssignSuccess(res.data?.data);
    } else {
      setError(res.message || 'Could not map leads to respective BDAs');
    }
  };

  const handleMapAllInFilter = async () => {
    if (!meetFilterActive) {
      setError('Set Meet attendance to Attended or Did not attend meet, then Apply filters.');
      return;
    }
    setMapping(true);
    setError('');
    const res = await bulkMapFilteredLeadsToRespectiveBda(appliedFilters);
    setMapping(false);
    setMapAllConfirmOpen(false);
    if (res.success) {
      handleAssignSuccess(res.data?.data);
    } else {
      setError(res.message || 'Could not map filtered leads to respective BDAs');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900 m-0">
            {keepExistingBda ? 'All filtered leads' : 'Filtered unassigned leads'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {keepExistingBda
              ? meetFilterActive
                ? `Leads in your ${meetLabel} filter are listed with their BDA. Use “Map all in meet filter” so every previously assigned lead stays with the same BDA.`
                : 'Set Meet attendance (attended / not attended), Apply filters, then map all or selected leads to their respective BDA.'
              : 'Unassigned leads only. Select rows and assign to a BDA.'}{' '}
            Max {BULK_ASSIGN_MAX} per action.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={!filtersReady}
          className="p-2 border rounded-lg hover:bg-gray-50 shrink-0 disabled:opacity-40"
          aria-label="Refresh pool"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="px-4 py-3 border-b flex flex-wrap items-center gap-2 bg-gray-50/80">
        {keepExistingBda ? (
          <>
            <button
              type="button"
              disabled={!filtersReady || !meetFilterActive || mapping}
              onClick={() => setMapAllConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-primary-blue text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              title={
                meetFilterActive
                  ? undefined
                  : 'Choose Attended meet or Did not attend meet first'
              }
            >
              <FiUserCheck className="w-4 h-4" />
              Map all in meet filter to respective BDA
            </button>
            <button
              type="button"
              disabled={
                !filtersReady ||
                priorBdaIds.length === 0 ||
                overBulkLimit ||
                mapping
              }
              onClick={() => setMapConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-primary-blue text-primary-blue bg-white hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiUserCheck className="w-4 h-4" />
              Map selected ({priorBdaIds.length > 0 ? priorBdaIds.length : 0})
            </button>
            <button
              type="button"
              disabled={!filtersReady || unassignedIds.length === 0 || overBulkLimit}
              onClick={() => setAssignOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiUserPlus className="w-4 h-4" />
              Assign {unassignedIds.length > 0 ? unassignedIds.length : ''} unassigned to BDA
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={!filtersReady || selectedIds.length === 0 || overBulkLimit}
            onClick={() => setAssignOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-primary-blue text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiUserPlus className="w-4 h-4" />
            Assign {selectedIds.length > 0 ? selectedIds.length : ''} to BDA
          </button>
        )}
      </div>

      {(error || success || overBulkLimit) && (
        <div className="px-4 py-3 space-y-2 border-b">
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
          {overBulkLimit && (
            <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Select at most {BULK_ASSIGN_MAX} leads per assignment. You have {selectedIds.length}{' '}
              selected.
            </p>
          )}
        </div>
      )}

      {!filtersReady ? (
        <div className="px-4 py-12 text-center text-gray-500 text-sm">
          Apply filters above to load leads for assignment.
        </div>
      ) : loading ? (
        <div className="p-4">
          <TableSkeleton rows={8} cols={keepExistingBda ? 10 : 9} />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase text-left">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allPageSelected}
                      onChange={toggleAll}
                      aria-label="Select all on page"
                    />
                  </th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Current studying</th>
                  <th className="px-4 py-3">Language</th>
                  <th className="px-4 py-3">English meet</th>
                  <th className="px-4 py-3">Hindi meet</th>
                  <th className="px-4 py-3">Slot date</th>
                  {keepExistingBda ? <th className="px-4 py-3">Assigned BDA</th> : null}
                  <th className="px-4 py-3">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={keepExistingBda ? 10 : 9} className="px-4 py-10 text-center text-gray-500">
                      {keepExistingBda
                        ? 'No leads match the current filters.'
                        : 'No unassigned leads match the current filters.'}
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/80">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(row.id)}
                          onChange={() => toggleOne(row.id)}
                          aria-label={`Select ${row.fullName}`}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{row.fullName || '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{row.phone || '—'}</td>
                      <td
                        className="px-4 py-3 text-gray-700 max-w-[200px] truncate"
                        title={getLeadClassStatus(row)}
                      >
                        {getLeadClassStatus(row)}
                      </td>
                      <td className="px-4 py-3">
                        {row.preferredLanguage ? (
                          <span
                            className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${languageBadgeClass(row.preferredLanguage)}`}
                          >
                            {row.preferredLanguage}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <MeetBadge attended={row.meetEnglish} label="Eng" />
                      </td>
                      <td className="px-4 py-3">
                        <MeetBadge attended={row.meetHindi} label="Hin" />
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {row.slotBookingDate || '—'}
                      </td>
                      {keepExistingBda ? (
                        <td className="px-4 py-3">
                          {row.assignedBdaName ? (
                            <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200">
                              {row.assignedBdaName}
                            </span>
                          ) : (
                            <span className="text-xs text-amber-800 font-medium">Unassigned</span>
                          )}
                        </td>
                      ) : null}
                      <td className="px-4 py-3 text-gray-600">{formatDateTime(row.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-gray-100 text-sm text-gray-600">
            <span>
              <strong className="text-gray-800">{pagination.total ?? 0}</strong>{' '}
              matching {keepExistingBda ? 'leads' : 'unassigned'}
              {selectedIds.length > 0 && (
                <span className="text-primary-blue font-medium">
                  {' '}
                  · {selectedIds.length} selected
                </span>
              )}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Prev
              </button>
              <span className="tabular-nums">
                {page} / {pagination.totalPages || 1}
              </span>
              <button
                type="button"
                disabled={page >= (pagination.totalPages || 1)}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {mapAllConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 m-0">Map meet filter to respective BDA</h3>
            <p className="text-sm text-gray-600 m-0">
              Every <strong>previously assigned</strong> lead in your current filter (
              <strong>{meetLabel}</strong>
              {appliedFilters?.meetFrom || appliedFilters?.meetTo
                ? `, dates ${appliedFilters.meetFrom || '…'} – ${appliedFilters.meetTo || '…'}`
                : ''}
              ) will be mapped back to the <strong>same BDA</strong> they already had. Unassigned
              leads in this filter are not changed.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setMapAllConfirmOpen(false)}
                className="px-4 py-2 text-sm text-gray-700"
                disabled={mapping}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMapAllInFilter}
                disabled={mapping}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-blue text-white hover:opacity-90 disabled:opacity-50"
              >
                {mapping ? 'Mapping…' : 'Map all in filter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {mapConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 m-0">Map to respective BDA</h3>
            <p className="text-sm text-gray-600 m-0">
              <strong>{priorBdaIds.length}</strong> lead{priorBdaIds.length !== 1 ? 's' : ''} will each
              be mapped to the BDA they were previously assigned to.
              {selectedUnassigned.length > 0 && (
                <span className="block mt-2 text-amber-900">
                  {selectedUnassigned.length} unassigned lead
                  {selectedUnassigned.length !== 1 ? 's' : ''} in your selection will be skipped. Use
                  &quot;Assign unassigned to BDA&quot; for those.
                </span>
              )}
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setMapConfirmOpen(false)}
                className="px-4 py-2 text-sm text-gray-700"
                disabled={mapping}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMapRespective}
                disabled={mapping}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-blue text-white hover:opacity-90 disabled:opacity-50"
              >
                {mapping ? 'Mapping…' : 'Confirm map'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AssignToBdaModal
        open={assignOpen}
        leadIds={
          keepExistingBda
            ? unassignedIds
            : selectedIds.slice(0, BULK_ASSIGN_MAX)
        }
        preferredLanguage={appliedFilters?.preferredLanguage || ''}
        onClose={() => setAssignOpen(false)}
        onSuccess={(data) => {
          setAssignOpen(false);
          handleAssignSuccess(data);
        }}
      />
    </div>
  );
}
