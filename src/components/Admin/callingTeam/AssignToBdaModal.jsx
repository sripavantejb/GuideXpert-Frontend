import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import {
  listBdas,
  bulkAssignLeadsToBda,
  bulkReassignLeadsToBda,
  reassignLeadToBda,
} from '../../../utils/callingTeamApi';

export default function AssignToBdaModal({
  open,
  leadIds,
  onClose,
  onSuccess,
  preferredLanguage = '',
  mode = 'assign',
  excludeBdaId = '',
  leadType = 'iit_counselling',
}) {
  const [bdas, setBdas] = useState([]);
  const [bdaId, setBdaId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingBdas, setLoadingBdas] = useState(false);

  const isReassign = mode === 'reassign';
  const isSingle = leadIds?.length === 1;

  useEffect(() => {
    if (!open) return;
    setBdaId('');
    setReason('');
    setError('');
    setLoadingBdas(true);
    listBdas({ status: 'active' }).then((res) => {
      setLoadingBdas(false);
      if (res.success && Array.isArray(res.data?.data)) {
        let list = res.data.data;
        if (excludeBdaId) {
          list = list.filter((b) => String(b.id || b.bdaId) !== String(excludeBdaId));
        }
        if (preferredLanguage) {
          const matched = list.filter((b) => b.language === preferredLanguage);
          if (matched.length > 0) list = matched;
        }
        setBdas(list);
        if (list.length === 0) {
          setError(
            preferredLanguage
              ? `No active BDAs with language ${preferredLanguage}. Create one in BDA profiles above.`
              : excludeBdaId
                ? 'No other active BDAs available for reassignment.'
                : 'No active BDAs. Add a BDA from BDA Management first.'
          );
        }
      } else {
        setError(res.message || 'Could not load BDAs');
      }
    });
  }, [open, preferredLanguage, excludeBdaId]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!bdaId) {
      setError('Select a BDA');
      return;
    }
    setLoading(true);
    setError('');

    let res;
    if (isReassign && isSingle) {
      res = await reassignLeadToBda(leadIds[0], { bdaId, reason, leadType });
    } else if (isReassign) {
      res = await bulkReassignLeadsToBda({ leadIds, bdaId, reason, leadType });
    } else {
      res = await bulkAssignLeadsToBda({ leadIds, bdaId, reason, leadType });
    }

    setLoading(false);
    if (res.success) {
      onSuccess?.(res.data?.data);
      onClose();
    } else {
      setError(res.message || (isReassign ? 'Reassign failed' : 'Assign failed'));
    }
  };

  const title = isReassign
    ? isSingle
      ? 'Reassign lead'
      : 'Reassign to BDA'
    : 'Assign to BDA';

  const submitLabel = isReassign
    ? loading
      ? 'Reassigning…'
      : isSingle
        ? 'Reassign'
        : 'Reassign leads'
    : loading
      ? 'Assigning…'
      : 'Assign';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button type="button" onClick={onClose} className="p-1 text-gray-500 hover:text-gray-800">
            <FiX />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-600">
            {leadIds.length} lead{leadIds.length !== 1 ? 's' : ''} selected
            {preferredLanguage ? (
              <span className="block text-xs text-gray-500 mt-0.5">
                Showing active BDAs for <strong>{preferredLanguage}</strong> when available
              </span>
            ) : null}
          </p>
          <label className="block text-sm font-medium text-gray-700">BDA</label>
          <select
            value={bdaId}
            onChange={(e) => setBdaId(e.target.value)}
            disabled={loadingBdas || bdas.length === 0}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50"
          >
            <option value="">
              {loadingBdas ? 'Loading BDAs…' : bdas.length === 0 ? 'No active BDAs' : 'Select BDA…'}
            </option>
            {bdas.map((b) => (
              <option key={b.id || b.bdaId} value={b.id || b.bdaId}>
                {b.name}
                {b.language ? ` · ${b.language}` : ''}
                {b.phone ? ` (${b.phone})` : ''}
              </option>
            ))}
          </select>
          <label className="block text-sm font-medium text-gray-700">Reason (optional)</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="Reassignment reason"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700">
            Cancel
          </button>
          <button
            type="button"
            disabled={loading || loadingBdas || bdas.length === 0}
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-blue text-white hover:opacity-90 disabled:opacity-50"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
