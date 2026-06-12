export function buildLeadInsightsQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

export function normalizeLeadInsightsResponse(result) {
  if (!result?.success) {
    return {
      ok: false,
      message: result?.message || 'Request failed',
      status: result?.status ?? 0,
      data: null,
    };
  }
  return {
    ok: true,
    message: '',
    status: result.status ?? 200,
    data: result.data ?? null,
  };
}
