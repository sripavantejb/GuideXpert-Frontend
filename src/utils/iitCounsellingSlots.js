/** Separator for toolbar/modal slot keys: `YYYY-MM-DD|normalizedSlot` vs slot-only keys. */
export const IIT_SLOT_FILTER_SEP = '|';

const LEGACY_SLOT_EQUIV = new Map(
  Object.entries({
    'saturday 5pm': 'Saturday 6PM',
    'sunday 5pm': 'Sunday 11AM',
    'wednesday 5pm': 'Wednesday 6PM',
  }).map(([k, v]) => [k, v])
);

/**
 * Canonical slot string for matching: trim, collapse whitespace, legacy aliases.
 */
export function normalizeIitSlotValue(raw) {
  let s = String(raw ?? '')
    .trim()
    .replace(/\s+/g, ' ');
  if (!s || s === '—') return '';
  const mapped = LEGACY_SLOT_EQUIV.get(s.toLowerCase());
  return mapped || s;
}

export function encodeSlotFilterOption(demoDateKey, normalizedSlot) {
  const slot = normalizeIitSlotValue(normalizedSlot);
  if (!slot) return '';
  const d = String(demoDateKey || '').trim();
  if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    return `${d}${IIT_SLOT_FILTER_SEP}${slot}`;
  }
  return slot;
}

export function parseSlotFilterOption(encoded) {
  const t = String(encoded ?? '').trim();
  if (!t) return { demoDateKey: null, slotNorm: '' };
  const i = t.indexOf(IIT_SLOT_FILTER_SEP);
  if (i <= 0) return { demoDateKey: null, slotNorm: normalizeIitSlotValue(t) };
  const demoDateKey = t.slice(0, i);
  const slotNorm = normalizeIitSlotValue(t.slice(i + 1));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(demoDateKey)) {
    return { demoDateKey: null, slotNorm: normalizeIitSlotValue(t) };
  }
  return { demoDateKey, slotNorm };
}

export function rowMatchesSlotFilter(row, encodedFilter) {
  if (!String(encodedFilter ?? '').trim()) return true;
  const { demoDateKey: fDate, slotNorm } = parseSlotFilterOption(encodedFilter);
  const rowSlot = normalizeIitSlotValue(row.slot === '—' ? '' : row.slot);
  if (slotNorm && rowSlot !== slotNorm) return false;
  if (fDate && row.demoDateKey !== fDate) return false;
  return true;
}

export function rowMatchesDemoDateRange(row, demoFrom, demoTo) {
  const from = String(demoFrom || '').trim();
  const to = String(demoTo || '').trim();
  if (!from && !to) return true;
  const key = row.demoDateKey;
  if (!key) return false;
  if (from && key < from) return false;
  if (to && key > to) return false;
  return true;
}
