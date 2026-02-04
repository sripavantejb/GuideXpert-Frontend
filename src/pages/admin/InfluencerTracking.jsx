import { useState, useEffect, useCallback } from 'react';
import { FiCopy, FiSave, FiRefreshCw } from 'react-icons/fi';
import {
  getInfluencerLinks,
  createInfluencerLink,
  getInfluencerAnalytics,
  getStoredToken,
} from '../../utils/adminApi';
import { useAuth } from '../../contexts/AuthContext';

const PLATFORMS = [
  { value: 'Instagram', label: 'Instagram' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'Twitter', label: 'Twitter' },
  { value: 'WhatsApp', label: 'WhatsApp' },
];

const DEFAULT_CAMPAIGN = 'guide_xperts';

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function InfluencerTracking() {
  const { logout } = useAuth();
  const [form, setForm] = useState({
    influencerName: '',
    platform: 'Instagram',
    campaign: DEFAULT_CAMPAIGN,
  });
  const [generatedLink, setGeneratedLink] = useState(null);
  const [linkError, setLinkError] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const [savedLinks, setSavedLinks] = useState([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const [linksError, setLinksError] = useState('');

  const [analytics, setAnalytics] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState('');
  const [analyticsFilters, setAnalyticsFilters] = useState({
    from: '',
    to: '',
    sort: 'registrations',
  });

  const token = getStoredToken();

  const fetchLinks = useCallback(() => {
    setLinksLoading(true);
    setLinksError('');
    getInfluencerLinks(token).then((result) => {
      if (!result.success) {
        if (result.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setLinksError(result.message || 'Failed to load links');
        setLinksLoading(false);
        return;
      }
      setSavedLinks(result.data?.data ?? []);
      setLinksLoading(false);
    });
  }, [token, logout]);

  const fetchAnalytics = useCallback(() => {
    setAnalyticsLoading(true);
    setAnalyticsError('');
    const params = {};
    if (analyticsFilters.from) params.from = analyticsFilters.from;
    if (analyticsFilters.to) params.to = analyticsFilters.to;
    if (analyticsFilters.sort) params.sort = analyticsFilters.sort;
    getInfluencerAnalytics(params, token).then((result) => {
      if (!result.success) {
        if (result.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setAnalyticsError(result.message || 'Failed to load analytics');
        setAnalyticsLoading(false);
        return;
      }
      setAnalytics(result.data?.data ?? []);
      setAnalyticsLoading(false);
    });
  }, [token, analyticsFilters.from, analyticsFilters.to, analyticsFilters.sort, logout]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setLinkError('');
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLinkError('');
    if (!form.influencerName.trim()) {
      setLinkError('Influencer name is required.');
      return;
    }
    setLinkLoading(true);
    setGeneratedLink(null);
    const result = await createInfluencerLink(
      {
        influencerName: form.influencerName.trim(),
        platform: form.platform,
        campaign: form.campaign.trim() || DEFAULT_CAMPAIGN,
      },
      false,
      token
    );
    setLinkLoading(false);
    if (!result.success) {
      if (result.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      setLinkError(result.message || 'Failed to generate link');
      return;
    }
    setGeneratedLink(result.data?.data?.utmLink ?? null);
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  const handleSave = async () => {
    if (!form.influencerName.trim()) return;
    setSaveLoading(true);
    setLinkError('');
    const result = await createInfluencerLink(
      {
        influencerName: form.influencerName.trim(),
        platform: form.platform,
        campaign: form.campaign.trim() || DEFAULT_CAMPAIGN,
      },
      true,
      token
    );
    setSaveLoading(false);
    if (!result.success) {
      if (result.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      setLinkError(result.message || 'Failed to save link');
      return;
    }
    setGeneratedLink(result.data?.data?.utmLink ?? generatedLink);
    fetchLinks();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Influencer Tracking</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate UTM links per influencer, share them, and view registration analytics by influencer.
        </p>
      </div>

      {/* Link generator */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/80">
          <h2 className="text-base font-semibold text-gray-800">Generate UTM Link</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Create a unique registration link for an influencer. Use Copy to share, or Save to store in the list below.
          </p>
        </div>
        <form onSubmit={handleGenerate} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="influencerName" className="block text-sm font-medium text-gray-700 mb-1">
                Influencer Name
              </label>
              <input
                id="influencerName"
                name="influencerName"
                type="text"
                value={form.influencerName}
                onChange={handleFormChange}
                placeholder="e.g. John Doe"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-navy focus:ring-1 focus:ring-primary-navy"
              />
            </div>
            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
                Platform
              </label>
              <select
                id="platform"
                name="platform"
                value={form.platform}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-navy focus:ring-1 focus:ring-primary-navy"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="campaign" className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Name
              </label>
              <input
                id="campaign"
                name="campaign"
                type="text"
                value={form.campaign}
                onChange={handleFormChange}
                placeholder={DEFAULT_CAMPAIGN}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-navy focus:ring-1 focus:ring-primary-navy"
              />
            </div>
          </div>
          {linkError && (
            <p className="text-sm text-red-600" role="alert">
              {linkError}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={linkLoading || !form.influencerName.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary-navy hover:bg-primary-navy/90 focus:ring-2 focus:ring-primary-navy focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {linkLoading ? 'Generating…' : 'Generate Link'}
            </button>
            {generatedLink && (
              <>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300"
                >
                  <FiCopy className="w-4 h-4" />
                  {copyFeedback ? 'Copied' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary-blue-600 hover:bg-primary-blue-700 disabled:opacity-50"
                >
                  <FiSave className="w-4 h-4" />
                  {saveLoading ? 'Saving…' : 'Save to list'}
                </button>
              </>
            )}
          </div>
          {generatedLink && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Generated link</p>
              <p className="text-sm text-gray-800 break-all font-mono">{generatedLink}</p>
            </div>
          )}
        </form>
      </section>

      {/* Saved links table */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/80 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Saved Influencer Links</h2>
            <p className="text-sm text-gray-500 mt-0.5">Links you have saved for reuse and reference.</p>
          </div>
          <button
            type="button"
            onClick={fetchLinks}
            disabled={linksLoading}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50"
            title="Refresh"
          >
            <FiRefreshCw className={`w-5 h-5 ${linksLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {linksLoading ? (
          <div className="px-6 py-12 text-center text-gray-500 text-sm">Loading links…</div>
        ) : linksError ? (
          <div className="px-6 py-6">
            <p className="text-red-600 text-sm" role="alert">{linksError}</p>
          </div>
        ) : savedLinks.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500 text-sm">No saved links yet. Generate and save a link above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Influencer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    UTM Link
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {savedLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{link.influencerName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{link.platform}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{link.campaign}</td>
                    <td className="px-6 py-4 text-sm">
                      <a
                        href={link.utmLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-navy hover:underline break-all font-mono text-xs"
                      >
                        {link.utmLink}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(link.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Analytics table */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/80 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Influencer Analytics</h2>
            <p className="text-sm text-gray-500 mt-0.5">Registrations attributed to each influencer (by utm_content).</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="date"
              value={analyticsFilters.from}
              onChange={(e) => setAnalyticsFilters((p) => ({ ...p, from: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
            />
            <input
              type="date"
              value={analyticsFilters.to}
              onChange={(e) => setAnalyticsFilters((p) => ({ ...p, to: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
            />
            <select
              value={analyticsFilters.sort}
              onChange={(e) => setAnalyticsFilters((p) => ({ ...p, sort: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
            >
              <option value="registrations">Sort by registrations</option>
              <option value="latest">Sort by latest</option>
            </select>
            <button
              type="button"
              onClick={fetchAnalytics}
              disabled={analyticsLoading}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50"
              title="Refresh"
            >
              <FiRefreshCw className={`w-5 h-5 ${analyticsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        {analyticsLoading ? (
          <div className="px-6 py-12 text-center text-gray-500 text-sm">Loading analytics…</div>
        ) : analyticsError ? (
          <div className="px-6 py-6">
            <p className="text-red-600 text-sm" role="alert">{analyticsError}</p>
          </div>
        ) : analytics.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500 text-sm">
            No influencer data yet. Registrations that include UTM parameters will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Influencer Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total Registrations
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Latest Registration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {analytics.map((row, idx) => (
                  <tr key={row.influencerName + idx} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.influencerName ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.platform ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{row.totalRegistrations ?? 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(row.latestRegistration)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
