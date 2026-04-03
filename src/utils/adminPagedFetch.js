const DEFAULT_CHUNK = 5000;

/**
 * Fetches every row from a paginated admin API by requesting successive pages.
 * Use when a single response is capped or totals may exceed one page.
 *
 * @param {(page: number, limit: number) => Promise<{ success: boolean, data?: any, status?: number, message?: string }>} fetchPage
 * @returns {Promise<{ success: boolean, rows?: any[], total?: number, result?: object }>}
 */
export async function fetchAllPaginatedRows(fetchPage) {
  let page = 1;
  const rows = [];
  let total = Infinity;
  while (rows.length < total) {
    const result = await fetchPage(page, DEFAULT_CHUNK);
    if (!result.success) {
      return { success: false, result };
    }
    const data = result.data;
    const inner = data?.data;
    const batch =
      inner && Array.isArray(inner.users)
        ? inner.users
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.submissions)
            ? data.submissions
            : Array.isArray(data)
              ? data
              : [];
    const p = data?.pagination;
    total =
      typeof p?.total === 'number'
        ? p.total
        : inner && typeof inner.total === 'number' && Array.isArray(inner.users)
          ? inner.total
          : typeof data?.total === 'number'
            ? data.total
            : batch.length > 0
              ? rows.length + batch.length
              : rows.length;
    rows.push(...batch);
    if (batch.length < DEFAULT_CHUNK || rows.length >= total) break;
    page += 1;
  }
  return { success: true, rows, total };
}

export { DEFAULT_CHUNK };
