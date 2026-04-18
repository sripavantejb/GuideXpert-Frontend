import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiImage } from 'react-icons/fi';
import { getMarketingFeaturedPoster } from '../../utils/api';

const RECENT_DAYS = 30;

const DYNAMIC_FEATURED_ID = 'automated-marketing-featured';

/** Placeholder release dates — adjust ISO strings to match real go-live dates. */
const AUTOMATED_POSTERS = [
  {
    id: 'holi',
    title: 'Holi',
    description: 'Seasonal poster with your name and phone. Download PNG or PDF after eligibility check.',
    to: '/holiposter',
    previewSrc: '/holiposter.svg',
    releasedAt: '2024-03-01',
  },
  {
    id: 'inter',
    title: 'Inter',
    description: 'Counsellor poster template. Customise and download from the dedicated page.',
    to: '/interposter',
    previewSrc: '/interposter.svg',
    releasedAt: '2024-06-01',
  },
  {
    id: 'interresults',
    title: 'Inter results',
    description: 'Inter results campaign poster with your name and mobile (yellow text). Download PNG or PDF after eligibility check.',
    to: '/inter-results-poster',
    previewSrc: '/inter-results-poster.svg',
    releasedAt: '2026-04-13',
  },
  {
    id: 'gx',
    title: 'GX Poster',
    description: 'New GX campaign poster with your name and mobile at the bottom-right.',
    to: '/gx-poster',
    previewSrc: '/gx-poster.svg',
    releasedAt: '2024-09-01',
  },
  {
    id: 'sid',
    title: 'SID Poster',
    description: 'SID campaign poster with your name and mobile. Download PNG or PDF after eligibility check.',
    to: '/sid-poster',
    previewSrc: '/sid-poster.svg',
    releasedAt: '2025-01-01',
  },
  {
    id: 'wrongcareerchoice',
    title: 'Wrong Career Choice Poster',
    description: 'Wrong Career Choice campaign poster with your name and mobile. Download PNG or PDF after eligibility check.',
    to: '/wrong-career-choice',
    previewSrc: '/wrong-career-choice-poster.svg',
    releasedAt: '2026-04-16',
  },
  {
    id: 'jee',
    title: 'JEE Poster',
    description: 'JEE campaign poster with your name and mobile. Download PNG or PDF after eligibility check.',
    to: '/jee-poster',
    previewSrc: '/jee-poster.svg',
    releasedAt: '2025-03-01',
  },
  {
    id: 'btechcse',
    title: 'B.Tech CSE Poster',
    description: 'B.Tech CSE campaign poster with your name and mobile. Download PNG or PDF after eligibility check.',
    to: '/btechcse-poster',
    previewSrc: '/btechcse-poster.svg',
    releasedAt: '2026-04-01',
  },
  {
    id: 'certified',
    title: 'Certified counsellor poster',
    description: 'Your certified counsellor poster from the standard template.',
    to: '/counsellor/certificate',
    previewSrc: '/downloadcertificate.svg',
    pinnedLast: true,
    hideTypeBadge: true,
  },
];

function parseReleasedAt(iso) {
  if (!iso || typeof iso !== 'string') return null;
  const t = new Date(`${iso}T12:00:00`).getTime();
  return Number.isNaN(t) ? null : t;
}

/** YYYY-MM-DD for sorting when API gives a full ISO date. */
function toDateKeyFeatured(isoOrDate) {
  if (isoOrDate == null) return null;
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function formatSinceLabel(iso) {
  if (!iso) return null;
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return `Since ${d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`;
}

export default function Marketing() {
  const [apiFeatured, setApiFeatured] = useState(null);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await getMarketingFeaturedPoster();
      if (cancelled) return;
      setFeaturedLoading(false);
      if (res.success && res.data?.poster) {
        setApiFeatured(res.data.poster);
      } else {
        setApiFeatured(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { sortedPosters, latestIds, recentIds } = useMemo(() => {
    const dynamicFeatured = apiFeatured
      ? [
          {
            id: DYNAMIC_FEATURED_ID,
            title: apiFeatured.name,
            description:
              'Dynamic poster from GuideXpert. Open the link, verify with your registered mobile, then download PNG or PDF.',
            to: apiFeatured.route,
            releasedAt: toDateKeyFeatured(apiFeatured.marketingFeaturedAt) || '2026-01-01',
            isDynamicFeatured: true,
            pinnedLast: false,
          },
        ]
      : [];

    const campaigns = AUTOMATED_POSTERS.filter((p) => !p.pinnedLast);
    const pinned = AUTOMATED_POSTERS.filter((p) => p.pinnedLast);

    const sortedCampaigns = [...campaigns].sort((a, b) => {
      const ta = parseReleasedAt(a.releasedAt) ?? 0;
      const tb = parseReleasedAt(b.releasedAt) ?? 0;
      if (ta !== tb) return tb - ta;
      return String(a.id).localeCompare(String(b.id));
    });

    if (dynamicFeatured.length > 0) {
      const latestIds = new Set([DYNAMIC_FEATURED_ID]);
      const now = Date.now();
      const cutoff = now - RECENT_DAYS * 24 * 60 * 60 * 1000;
      const featuredTime = apiFeatured?.marketingFeaturedAt
        ? new Date(apiFeatured.marketingFeaturedAt).getTime()
        : 0;
      const recentIds = new Set(
        sortedCampaigns
          .filter((p) => {
            const t = parseReleasedAt(p.releasedAt);
            return t != null && t >= cutoff;
          })
          .map((p) => p.id)
      );
      if (featuredTime >= cutoff) {
        recentIds.add(DYNAMIC_FEATURED_ID);
      }
      return {
        sortedPosters: [...dynamicFeatured, ...sortedCampaigns, ...pinned],
        latestIds,
        recentIds,
      };
    }

    const times = sortedCampaigns
      .map((p) => parseReleasedAt(p.releasedAt))
      .filter((t) => t != null);
    const maxT = times.length ? Math.max(...times) : null;

    const latestIds = new Set(
      maxT == null
        ? []
        : sortedCampaigns
            .filter((p) => parseReleasedAt(p.releasedAt) === maxT)
            .map((p) => p.id)
    );

    const now = Date.now();
    const cutoff = now - RECENT_DAYS * 24 * 60 * 60 * 1000;
    const recentIds = new Set(
      sortedCampaigns
        .filter((p) => {
          const t = parseReleasedAt(p.releasedAt);
          return t != null && t >= cutoff;
        })
        .map((p) => p.id)
    );

    return {
      sortedPosters: [...sortedCampaigns, ...pinned],
      latestIds,
      recentIds,
    };
  }, [apiFeatured]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#003366] tracking-tight">All marketing posters</h2>
        <p className="text-sm text-slate-600 mt-0.5">
          Newest campaigns appear first. The latest release is highlighted. Standard certificate template is at the end.
          {!featuredLoading && apiFeatured
            ? ' The administrator may feature one dynamic /p/… poster at the top as Latest.'
            : null}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedPosters.map((item, i) => {
          const isLatest = latestIds.has(item.id);
          const isRecent = recentIds.has(item.id);
          const sinceLabel = formatSinceLabel(item.releasedAt);
          const isCampaign = !item.pinnedLast;
          const showTypeBadge = !item.hideTypeBadge && !item.isDynamicFeatured;
          const prev = i > 0 ? sortedPosters[i - 1] : null;
          const showTemplateDivider = Boolean(item.pinnedLast && prev && !prev.pinnedLast);

          return (
            <div key={item.id} className={showTemplateDivider ? 'contents' : undefined}>
              {showTemplateDivider && (
                <div className="col-span-full pt-4 mt-2 border-t border-slate-200" />
              )}
              <div
                className={[
                  'rounded-xl p-5 flex flex-col transition-all duration-200 relative overflow-hidden',
                  isLatest && isCampaign
                    ? 'bg-gradient-to-br from-sky-50 via-white to-indigo-50/40 ring-2 ring-[#003366] ring-offset-2 ring-offset-slate-50 border border-[#003366]/25 shadow-lg shadow-[#003366]/10 hover:shadow-xl hover:shadow-[#003366]/15'
                    : isRecent && isCampaign
                      ? 'bg-white border border-amber-200/80 shadow-sm ring-1 ring-amber-100 hover:shadow-md'
                      : 'bg-white border border-slate-200 shadow-sm hover:shadow-md',
                ].join(' ')}
              >
                {isLatest && isCampaign && (
                  <div
                    className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#003366] via-sky-500 to-[#003366]"
                    aria-hidden
                  />
                )}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {item.isDynamicFeatured ? (
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-900">
                      Dynamic
                    </span>
                  ) : null}
                  {showTypeBadge && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      Campaign
                    </span>
                  )}
                  {isLatest && isCampaign && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#003366] text-white shadow-sm">
                      Latest
                    </span>
                  )}
                  {isRecent && isCampaign && !isLatest && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 ring-1 ring-amber-200/80">
                      New
                    </span>
                  )}
                </div>
                <div className="flex justify-center mb-4 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden min-h-[200px] max-h-[280px]">
                  {item.isDynamicFeatured ? (
                    <div className="flex w-full flex-col items-center justify-center gap-2 py-10 px-4 bg-gradient-to-br from-slate-100/90 to-slate-50 text-slate-400">
                      <FiImage className="h-14 w-14 shrink-0 opacity-80" aria-hidden />
                      <span className="text-xs font-medium text-slate-500 text-center leading-snug">
                        Preview on the public page after you open the link
                      </span>
                    </div>
                  ) : (
                    <img
                      src={item.previewSrc}
                      alt=""
                      className="max-w-full max-h-[260px] w-auto object-contain object-center"
                    />
                  )}
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-0.5">{item.title}</h3>
                {sinceLabel && (
                  <p className="text-xs text-slate-500 mb-1">{sinceLabel}</p>
                )}
                <p className="text-sm text-slate-600 mb-4 flex-1">{item.description}</p>
                <Link
                  to={item.to}
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-[#003366] text-white text-sm font-medium rounded-lg hover:bg-[#004080] transition-colors text-center"
                >
                  Open to customise &amp; download
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
