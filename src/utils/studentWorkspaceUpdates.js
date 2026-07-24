const SEEN_KEY = 'gx_student_updates_seen_ids';
const LAST_OPEN_KEY = 'gx_student_updates_last_open';

export function readSeenUpdateIds() {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function markUpdatesSeen(ids = []) {
  try {
    const prev = new Set(readSeenUpdateIds());
    ids.forEach((id) => {
      if (id) prev.add(String(id));
    });
    const next = Array.from(prev).slice(-200);
    localStorage.setItem(SEEN_KEY, JSON.stringify(next));
    localStorage.setItem(LAST_OPEN_KEY, new Date().toISOString());
  } catch {
    /* ignore */
  }
}

export function countUnreadUpdates(items = []) {
  const seen = new Set(readSeenUpdateIds());
  return items.filter((item) => item?.id && !seen.has(String(item.id))).length;
}

export function formatUpdateDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}
