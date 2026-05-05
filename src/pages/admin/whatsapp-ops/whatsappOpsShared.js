export function defaultRangeIsoDates() {
  const to = new Date();
  const from = new Date(to.getTime() - 14 * 86400000);
  const f = (d) => {
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  };
  return { from: f(from), to: f(to) };
}

export function formatDt(isoOrDate) {
  if (!isoOrDate) return '—';
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return String(isoOrDate);
  return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}
