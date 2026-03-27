import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAdminLeadsExport, getStoredToken } from '../../utils/adminApi';
import { useAdminDateRange } from '../../contexts/AdminDashboardContext';
import { ALL_SLOT_IDS } from '../../utils/adminLeadFiltersShared';

function formatSlotIdForDropdown(slotId) {
  if (!slotId || typeof slotId !== 'string') return slotId || '';
  const match = slotId.match(/^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)_(7PM|11AM|3PM|6PM)$/i);
  if (match) {
    const dayNames = { MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday', THURSDAY: 'Thursday', FRIDAY: 'Friday', SATURDAY: 'Saturday', SUNDAY: 'Sunday' };
    const time = match[2].replace(/(\d+)(AM|PM)/i, '$1 $2');
    return `${dayNames[match[1]] || match[1]} ${time}`;
  }
  return slotId;
}

export default function Export() {
  const [searchParams] = useSearchParams();
  const { dateRange, leadListFilters } = useAdminDateRange();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [utm_content, setUtm_content] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- prefill from ?from/?to/?slot/?utm or dashboard context */
  useEffect(() => {
    if (searchParams.toString()) {
      setFrom(searchParams.get('from') || '');
      setTo(searchParams.get('to') || '');
      setSelectedSlot(searchParams.get('slot') || searchParams.get('selectedSlot') || '');
      setUtm_content(searchParams.get('utm') || searchParams.get('utm_content') || '');
      return;
    }
    setFrom(dateRange.from || '');
    setTo(dateRange.to || '');
    setSelectedSlot(leadListFilters.selectedSlot || '');
    setUtm_content(leadListFilters.utm_content || '');
  }, [searchParams, dateRange.from, dateRange.to, leadListFilters.selectedSlot, leadListFilters.utm_content]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleExport = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    if (selectedSlot) params.selectedSlot = selectedSlot;
    if (utm_content) params.utm_content = utm_content;
    const result = await getAdminLeadsExport(params, getStoredToken());
    setLoading(false);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.message || 'Export failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Export leads</h2>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <p className="text-sm text-gray-600 mb-4">
          Download all leads as a CSV file (includes UTM/Influencer columns). Optionally filter by date range, slot, or influencer. Defaults match the header <strong className="font-medium text-gray-800">Filters</strong> when you open this page without query parameters.
        </p>

        <form onSubmit={handleExport} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="export-from" className="block text-sm font-medium text-gray-700 mb-1">
                From date (optional)
              </label>
              <input
                id="export-from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="export-to" className="block text-sm font-medium text-gray-700 mb-1">
                To date (optional)
              </label>
              <input
                id="export-to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label htmlFor="export-slot" className="block text-sm font-medium text-gray-700 mb-1">
              Slot (optional)
            </label>
            <select
              id="export-slot"
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none"
            >
              <option value="">All slots</option>
              {ALL_SLOT_IDS.map((slotId) => (
                <option key={slotId} value={slotId}>
                  {formatSlotIdForDropdown(slotId)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="export-utm-content" className="block text-sm font-medium text-gray-700 mb-1">
              Influencer (utm_content, optional)
            </label>
            <input
              id="export-utm-content"
              type="text"
              value={utm_content}
              onChange={(e) => setUtm_content(e.target.value)}
              placeholder="e.g. Influencer name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-600 text-sm" role="status">
              Download started. If it did not start, check your browser pop-up or download settings.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-navy text-white rounded-lg hover:bg-primary-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Preparing…' : 'Download CSV'}
          </button>
        </form>
      </div>
    </div>
  );
}
