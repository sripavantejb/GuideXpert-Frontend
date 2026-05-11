export function defaultRangeIsoDates() {
  const to = new Date();
  const from = new Date(to.getTime() - 14 * 86400000);
  const f = (d) => {
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  };
  return { from: f(from), to: f(to) };
}

/** Map `<input type="date">` values (local calendar day) to UTC ISO bounds for API query params. */
export function dateInputsToApiRange(fromStr, toStr) {
  const out = {};
  const fs = String(fromStr || '').trim();
  const ts = String(toStr || '').trim();
  const re = /^\d{4}-\d{2}-\d{2}$/;
  if (fs && re.test(fs)) {
    const [y, m, d] = fs.split('-').map((x) => parseInt(x, 10, 10));
    if (y && m && d) out.from = new Date(y, m - 1, d, 0, 0, 0, 0).toISOString();
  } else if (fs) {
    out.from = fs;
  }
  if (ts && re.test(ts)) {
    const [y, m, d] = ts.split('-').map((x) => parseInt(x, 10, 10));
    if (y && m && d) out.to = new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();
  } else if (ts) {
    out.to = ts;
  }
  return out;
}

/** `91` + last 10 digits (India mobile) for exports and clipboard. */
export function formatIndianMobile91(raw) {
  const d = String(raw ?? '').replace(/\D/g, '');
  if (d.length < 10) return '';
  return `91${d.slice(-10)}`;
}

export function formatDt(isoOrDate) {
  if (!isoOrDate) return '—';
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return String(isoOrDate);
  return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}
