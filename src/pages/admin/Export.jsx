import { useState } from 'react';
import { getAdminLeadsExport, getStoredToken } from '../../utils/adminApi';

export default function Export() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleExport = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
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
          Download all leads as a CSV file. Optionally filter by date range (created date).
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
