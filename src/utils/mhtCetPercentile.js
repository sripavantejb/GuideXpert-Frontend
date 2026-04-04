/**
 * MHT-CET: map user-entered percentile to an approximate all-India rank for cutoff APIs.
 * Calibrate `TOTAL_CANDIDATES_ESTIMATE` against official MHT-CET statistics when available.
 *
 * Uses: rank ≈ ceil((1 - p/100) * N) with p in (0, 100], clamped to [1, N].
 */

/** Placeholder pool size for 2026; replace with official registered-candidate count when published. */
export const MHT_CET_TOTAL_CANDIDATES_ESTIMATE = 450000;

/**
 * @param {number} percentile - 1–100
 * @param {{ totalCandidates?: number }} [opts]
 * @returns {number} Approximate rank (integer ≥ 1)
 */
export function percentileToApproxRank(percentile, opts = {}) {
  const n = opts.totalCandidates ?? MHT_CET_TOTAL_CANDIDATES_ESTIMATE;
  const p = Number(percentile);
  if (!Number.isFinite(p) || p < 1 || p > 100) return NaN;
  const rank = Math.max(1, Math.min(n, Math.ceil((1 - p / 100) * n)));
  return rank;
}

/**
 * Map expected MHT-CET percentile (1–100) to [cutoff_from, cutoff_to] for the earlywave
 * MHTCET college predictor. Upstream stores cutoffs on a **percentile-scale** (1–100), not
 * JEE-style AIR; using {@link rankToCutoff} on an approximate rank yields ranges that rarely
 * overlap real rows (empty results). Pad widens the window so category/district filters still match.
 *
 * @param {number} percentile
 * @returns {[number, number]}
 */
export function percentileToMhtCutoffRange(percentile) {
  const p = Number(percentile);
  if (!Number.isFinite(p) || p < 1 || p > 100) return [0, 0];
  const pad = 30;
  const from = Math.max(1, Math.floor(p - pad));
  const to = Math.min(100, Math.ceil(p + pad));
  if (from >= to) return [1, 100];
  return [from, to];
}
