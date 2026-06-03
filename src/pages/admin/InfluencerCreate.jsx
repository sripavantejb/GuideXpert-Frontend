import { Link, useSearchParams } from 'react-router-dom';
import { FiBarChart2, FiUsers } from 'react-icons/fi';
import InfluencerLinkCreationWorkspace from '../../components/Admin/InfluencerLinkCreationWorkspace';
import { normalizeLinkTargetFromQuery } from '../../constants/influencerAdminConstants';

export default function InfluencerCreate() {
  const [searchParams] = useSearchParams();
  const initialLinkTarget = normalizeLinkTargetFromQuery(searchParams.get('linkTarget'));
  const isOneOnOne = initialLinkTarget === 'oneOnOneSession';
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Create influencer UTM links</h2>
          <p className="text-sm text-gray-500 mt-1">
            Generate trackable registration or 1-on-1 session URLs, copy or save them, edit cost, export or bulk-delete—same tools as on Influencer / UTM Tracking.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link
            to="/admin/leads"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-navy hover:underline"
          >
            <FiUsers className="w-4 h-4" aria-hidden />
            Lead Funnel (form leads)
          </Link>
          <Link
            to="/admin/influencer-tracking"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-navy hover:underline"
          >
            <FiBarChart2 className="w-4 h-4" aria-hidden />
            Full UTM analytics
          </Link>
        </div>
      </div>
      <div className="rounded-xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-sm text-gray-700">
        {isOneOnOne ? (
          <>
            <span className="font-semibold text-gray-800">Tracking 1-on-1 bookings:</span> when someone books using a saved link, their submission is tied to the same{' '}
            <span className="font-mono text-xs bg-white/80 px-1 rounded border border-blue-100">utm_content</span> as the influencer name you saved. View leads on{' '}
            <Link to="/admin/one-on-one-counseling" className="font-medium text-primary-navy hover:underline">
              1-on-1 Counseling Leads
            </Link>
            {' '}and filter by UTM content.
          </>
        ) : (
          <>
            <span className="font-semibold text-gray-800">Tracking form leads:</span> when someone registers using a saved link, their submission is tied to the same{' '}
            <span className="font-mono text-xs bg-white/80 px-1 rounded border border-blue-100">utm_content</span> as the influencer name you saved. Open{' '}
            <Link to="/admin/leads" className="font-medium text-primary-navy hover:underline">
              Lead Funnel
            </Link>
            {' '}and use the filters (for example Influencer / utm_content) to match that value. Visit counts and deeper UTM breakdowns live on{' '}
            <Link to="/admin/influencer-tracking" className="font-medium text-primary-navy hover:underline">
              Influencer / UTM Tracking
            </Link>
            .
          </>
        )}
      </div>
      <InfluencerLinkCreationWorkspace
        showInstagramQuickAdd
        initialPlatformFilter="Instagram"
        initialLinkTarget={initialLinkTarget}
        showLandingPageSelector
      />
    </div>
  );
}
