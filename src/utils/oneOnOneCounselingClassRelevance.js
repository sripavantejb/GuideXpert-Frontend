/** Relevant 1-on-1 leads: Inter 1st Year, Inter 2nd Year, and Inter 2nd Year Completed. */
export const RELEVANT_ONE_ON_ONE_CURRENT_CLASSES = Object.freeze([
  'Inter 1st Year',
  'Inter 2nd Year',
  'Inter 2nd Year Completed',
]);

const RELEVANT_SET = new Set(RELEVANT_ONE_ON_ONE_CURRENT_CLASSES);

export function isRelevantOneOnOneCurrentClass(raw) {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed) return false;
  return RELEVANT_SET.has(trimmed);
}

/**
 * @param {{ currentClass?: string }} row
 * @param {'all' | 'relevant' | 'irrelevant' | ''} filter
 */
export function matchesOneOnOneLeadRelevance(row, filter) {
  if (!filter || filter === 'all') return true;
  const relevant = isRelevantOneOnOneCurrentClass(row?.currentClass);
  return filter === 'relevant' ? relevant : !relevant;
}
