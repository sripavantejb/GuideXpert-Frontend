/**
 * Normalize doubt from legacy (text-only) or new shape (title, description, status, etc.)
 * New shape: id, title, description?, sessionId?, status: 'answered'|'under_review'|'pending',
 * createdAt, answer?, answeredAt?, attachment?
 */
export function normalizeDoubt(d) {
  if (!d || typeof d !== 'object') return null;
  const title = d.title ?? d.text ?? 'Untitled';
  const status = ['answered', 'under_review', 'pending'].includes(d.status) ? d.status : 'pending';
  return {
    id: d.id ?? `d-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: typeof title === 'string' ? title : String(title),
    description: d.description ?? '',
    sessionId: d.sessionId ?? null,
    status,
    createdAt: d.createdAt ?? Date.now(),
    answer: d.answer ?? null,
    answeredAt: d.answeredAt ?? null,
    attachment: d.attachment ?? null,
    upvotes: typeof d.upvotes === 'number' ? d.upvotes : 0,
  };
}

export function normalizeDoubts(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeDoubt).filter(Boolean);
}
