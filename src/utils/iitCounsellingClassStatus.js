/** Current studying values that count as relevant IIT counselling leads (12th passed out only). */
export const RELEVANT_IIT_CLASS_STATUSES = Object.freeze([
  'Completed 12th/Intermediate 2nd Year',
]);

const RELEVANT_SET = new Set(RELEVANT_IIT_CLASS_STATUSES);

/** Legacy radio values → current enum (see migrateIitCounsellingClassStatusValues.js). */
export const LEGACY_CLASS_STATUS_MAP = Object.freeze({
  '12th Appearing': 'Studying 12th/Intermediate 2nd Year',
  '12th Passed': 'Completed 12th/Intermediate 2nd Year',
});

/** @deprecated Use LEGACY_CLASS_STATUS_MAP */
export const LEGACY_RELEVANT_CLASS_STATUS_MAP = LEGACY_CLASS_STATUS_MAP;

export function normalizeIitClassStatus(raw) {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed) return '';
  return LEGACY_CLASS_STATUS_MAP[trimmed] ?? trimmed;
}

export function isRelevantIitClassStatus(raw) {
  const normalized = normalizeIitClassStatus(raw);
  if (!normalized) return false;
  return RELEVANT_SET.has(normalized);
}

/**
 * @param {{ classStatus?: string }} row - mapped submission row
 * @param {'all' | 'relevant' | 'irrelevant'} filter
 */
export function matchesIitLeadRelevance(row, filter) {
  if (filter === 'all') return true;
  const relevant = isRelevantIitClassStatus(row?.classStatus);
  return filter === 'relevant' ? relevant : !relevant;
}
