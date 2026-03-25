/**
 * Partner colleges for counsellor referral links.
 * Single source of truth; can be replaced later by API (e.g. GET /api/counsellor/college-referrals).
 * Optional `externalUrl` opens that URL instead of the in-app guidexpert.in/ref link.
 */
export const COLLEGES = [
  {
    slug: 'niat',
    name: 'NIAT',
    location: 'GuideXpert Rewards',
    externalUrl: 'https://gxrewards.guidexpert.co.in/guide-xpert',
  },
];
