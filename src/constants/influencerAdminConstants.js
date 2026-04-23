export const PLATFORMS = [
  { value: 'Instagram', label: 'Instagram' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'Twitter', label: 'Twitter' },
  { value: 'X', label: 'X' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Telegram', label: 'Telegram' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'LinkedIn', label: 'LinkedIn' },
];

/** Same mapping as backend influencer UTM builder (`utm_source`). */
export const PLATFORM_TO_UTM_SOURCE = {
  Instagram: 'instagram',
  YouTube: 'youtube',
  Twitter: 'twitter',
  X: 'x',
  WhatsApp: 'whatsapp',
  Telegram: 'telegram',
  Facebook: 'facebook',
  LinkedIn: 'linkedin',
};

export const DEFAULT_CAMPAIGN = 'guide_xperts';

/** Normalize @handle, URL, or plain username for Instagram quick-add. */
export function normalizeInstagramHandle(raw) {
  let s = String(raw ?? '').trim();
  if (!s) return '';
  if (s.startsWith('@')) s = s.slice(1);
  const urlMatch = s.match(/instagram\.com\/([^/?#]+)/i);
  if (urlMatch) s = urlMatch[1];
  s = s.replace(/\s+/g, '');
  return s.slice(0, 120);
}

export const LINKS_SORT_OPTIONS = [
  { value: 'date-desc', label: 'Date created (newest first)' },
  { value: 'date-asc', label: 'Date created (oldest first)' },
  { value: 'name-asc', label: 'Influencer name A–Z' },
  { value: 'name-desc', label: 'Influencer name Z–A' },
  { value: 'platform', label: 'Platform' },
];

export const LINKS_COPY_FIELDS = [
  { key: 'influencerName', label: 'Influencer' },
  { key: 'platform', label: 'Platform' },
  { key: 'campaign', label: 'Campaign' },
  { key: 'utmLink', label: 'UTM Link' },
  { key: 'createdAt', label: 'Date created' },
  { key: 'leadCount', label: 'Leads' },
  { key: 'cost', label: 'Cost' },
  { key: 'costPerLead', label: 'Cost per lead' },
  { key: 'latestLeadAt', label: 'Latest lead' },
];
