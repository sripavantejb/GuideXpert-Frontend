/**
 * Display helpers for college-predictor reservation_categories fields.
 * cutoff_from / cutoff_to → Opening / Closing Rank (shown only when present).
 */

export function formatRank(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return n.toLocaleString('en-IN');
}

/**
 * @param {object} rc
 * @returns {{ opening: number|string|null, closing: number|string|null }}
 */
export function getOpeningClosing(rc) {
  if (!rc || typeof rc !== 'object') return { opening: null, closing: null };
  const opening = rc.cutoff_from != null && rc.cutoff_from !== '' ? rc.cutoff_from : null;
  const closing = rc.cutoff_to != null && rc.cutoff_to !== '' ? rc.cutoff_to : null;
  return { opening, closing };
}

/**
 * Resolve opening / closing / primary cutoff for a branch.
 * Prefers branch-level fields, then first reservation category.
 * @param {object} branch
 */
export function getBranchRankSummary(branch) {
  if (!branch || typeof branch !== 'object') {
    return { opening: null, closing: null, cutoff: null };
  }

  const rcs = Array.isArray(branch.reservation_categories) ? branch.reservation_categories : [];
  const primaryRc = rcs[0] || null;

  const branchOpening =
    branch.cutoff_from != null && branch.cutoff_from !== '' ? branch.cutoff_from : null;
  const branchClosing =
    branch.cutoff_to != null && branch.cutoff_to !== '' ? branch.cutoff_to : null;

  const rcRanks = getOpeningClosing(primaryRc);

  return {
    opening: branchOpening ?? rcRanks.opening,
    closing: branchClosing ?? rcRanks.closing,
    cutoff: branch.cutoff ?? primaryRc?.cutoff_rank ?? primaryRc?.cutoff ?? null,
  };
}

/**
 * Parse extra_info into readable label/value pairs.
 * Handles JSON objects (e.g. WBJEE `{"quota":"Home State"}`) and plain strings.
 * @param {unknown} extra
 * @returns {{ label: string, value: string }[]}
 */
export function formatExtraInfo(extra) {
  if (extra == null || extra === '') return [];

  if (typeof extra === 'object' && !Array.isArray(extra)) {
    return Object.entries(extra)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => ({
        label: humanizeKey(k),
        value: String(v),
      }));
  }

  const raw = String(extra).trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return formatExtraInfo(parsed);
    }
  } catch {
    // plain string
  }

  return [{ label: '', value: raw }];
}

function humanizeKey(key) {
  const s = String(key || '').replace(/[_-]+/g, ' ').trim();
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
