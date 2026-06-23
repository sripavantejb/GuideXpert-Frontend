import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { listBdas, transferAllLeadsFromBda } from '../../../utils/callingTeamApi';

export default function TransferAllLeadsModal({
  open,
  sourceBdaId,
  sourceBdaName,
  leadCount,
  onClose,
  onSuccess,
}) {
  const [bdas, setBdas] = useState([]);
  const [targetBdaId, setTargetBdaId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingBdas, setLoadingBdas] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTargetBdaId('');
    setReason('');
    setError('');
    setConfirmed(false);
    setLoadingBdas(true);
    listBdas({ status: 'active' }).then((res) => {
      setLoadingBdas(false);
      if (res.success && Array.isArray(res.data?.data)) {
        const list = res.data.data.filter(
          (b) => String(b.id || b.bdaId) !== String(sourceBdaId)
        );
        setBdas(list);
        if (list.length === 0) {
          setError('No other active BDAs available for transfer.');
        }
      } else {
        setError(res.message || 'Could not load BDAs');
      }
    });
  }, [open, sourceBdaId]);

  if (!open) return null;

  const handleTransfer = async () => {
    if (!targetBdaId) {
      setError('Select a target BDA');
      return;
    }
    if (!confirmed) {
      setError('Please confirm the transfer');
      return;
    }
    setLoading(true);
    setError('');
    const res = await transferAllLeadsFromBda(sourceBdaId, { targetBdaId, reason });
    setLoading(false);
    if (res.success) {
      onSuccess?.(res.data?.data);
      onClose();
    } else {
      setError(res.message || 'Transfer failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-gray-900">Transfer all leads</h3>
          <button type="button" onClick={onClose} className="p-1 text-gray-500 hover:text-gray-800">
            <FiX />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-600">
            Move all <strong>{leadCount ?? 0}</strong> assigned lead{leadCount !== 1 ? 's' : ''} from{' '}
            <strong>{sourceBdaName || 'this BDA'}</strong> to another BDA.
          </p>
          <label className="block text-sm font-medium text-gray-700">Target BDA</label>
          <select
            value={targetBdaId}
            onChange={(e) => setTargetBdaId(e.target.value)}
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
              </option>
            ))}
          </select>
          <label className="block text-sm font-medium text-gray-700">Reason (optional)</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="Transfer reason"
          />
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              I understand this will reassign all leads from {sourceBdaName || 'this BDA'} to the
              selected BDA.
            </span>
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700">
            Cancel
          </button>
          <button
            type="button"
            disabled={loading || loadingBdas || bdas.length === 0}
            onClick={handleTransfer}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-blue text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Transferring…' : 'Transfer all'}
          </button>
        </div>
      </div>
    </div>
  );
}
