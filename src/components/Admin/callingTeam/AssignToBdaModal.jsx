import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { listBdas, bulkAssignLeadsToBda } from '../../../utils/callingTeamApi';

export default function AssignToBdaModal({ open, leadIds, onClose, onSuccess }) {
  const [bdas, setBdas] = useState([]);
  const [bdaId, setBdaId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingBdas, setLoadingBdas] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBdaId('');
    setReason('');
    setError('');
    setLoadingBdas(true);
    listBdas({ status: 'active' }).then((res) => {
      setLoadingBdas(false);
      if (res.success && Array.isArray(res.data?.data)) {
        setBdas(res.data.data);
        if (res.data.data.length === 0) {
          setError('No active BDAs. Add a BDA from Calling Team dashboard first.');
        }
      } else {
        setError(res.message || 'Could not load BDAs');
      }
    });
  }, [open]);

  if (!open) return null;

  const handleAssign = async () => {
    if (!bdaId) {
      setError('Select a BDA');
      return;
    }
    setLoading(true);
    setError('');
    const res = await bulkAssignLeadsToBda({ leadIds, bdaId, reason });
    setLoading(false);
    if (res.success) {
      onSuccess?.(res.data?.data);
      onClose();
    } else {
      setError(res.message || 'Assign failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-gray-900">Assign to BDA</h3>
          <button type="button" onClick={onClose} className="p-1 text-gray-500 hover:text-gray-800">
            <FiX />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-600">
            {leadIds.length} lead{leadIds.length !== 1 ? 's' : ''} selected
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
            onClick={handleAssign}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-blue text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Assigning…' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
}
