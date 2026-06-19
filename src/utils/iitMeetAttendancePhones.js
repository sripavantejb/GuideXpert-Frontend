import {
  getIitMeetAttendance,
  getIitMeetHindiAttendance,
  getStoredToken,
} from './adminApi';
import { fetchAllPaginatedRows } from './adminPagedFetch';

/** Last 10 digits — matches backend `normalizePhoneKey` / BDA meet filters. */
export function normalizeIitPhoneKey(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : '';
}

function phonesFromAttendanceRows(rows) {
  const set = new Set();
  (rows || []).forEach((row) => {
    const key = normalizeIitPhoneKey(row?.mobileNumber);
    if (key) set.add(key);
  });
  return set;
}

async function fetchVariantPhones(fetchList, params, token) {
  const result = await fetchAllPaginatedRows((page, limit) =>
    fetchList({ ...params, page, limit, uniqueByMobile: true, dedupeMode: 'latest' }, token)
  );
  if (!result.success) return { success: false, phones: new Set(), error: result.result?.message };
  return { success: true, phones: phonesFromAttendanceRows(result.rows) };
}

/**
 * Unique attendee phones from English + Hindi IIT meet attendance collections.
 * Optional `from` / `to` (YYYY-MM-DD) scope join timestamps (IST day bounds on API).
 */
export async function fetchIitMeetAttendancePhoneSets({ from = '', to = '' } = {}, token = getStoredToken()) {
  const dateParams = {};
  const fromStr = String(from || '').trim();
  const toStr = String(to || '').trim();
  if (fromStr) dateParams.from = fromStr;
  if (toStr) dateParams.to = toStr;

  const [english, hindi] = await Promise.all([
    fetchVariantPhones(getIitMeetAttendance, dateParams, token),
    fetchVariantPhones(getIitMeetHindiAttendance, dateParams, token),
  ]);

  if (!english.success) {
    return { success: false, message: english.error || 'Failed to load English IIT meet attendance' };
  }
  if (!hindi.success) {
    return { success: false, message: hindi.error || 'Failed to load Hindi IIT meet attendance' };
  }

  const union = new Set([...english.phones, ...hindi.phones]);
  return {
    success: true,
    english: english.phones,
    hindi: hindi.phones,
    union,
  };
}

/** Hindi submissions use Hindi meet; others use English meet (Telugu default). */
export function attendanceSetForSubmission(row, phoneSets) {
  if (!phoneSets) return new Set();
  const lang = String(row?.preferredLanguage || '').trim();
  if (lang === 'Hindi') return phoneSets.hindi || new Set();
  return phoneSets.english || new Set();
}

export function submissionAttendedMeet(row, phoneSets) {
  const key = normalizeIitPhoneKey(row?.phone);
  if (!key) return false;
  const set = attendanceSetForSubmission(row, phoneSets);
  return set.has(key);
}

/**
 * @param {'attended'|'not_attended'|''} filter
 */
export function matchesIitAttendanceFilter(row, filter, phoneSets) {
  const f = String(filter || '').trim();
  if (!f) return true;
  const attended = submissionAttendedMeet(row, phoneSets);
  if (f === 'attended') return attended;
  if (f === 'not_attended') return !attended;
  return true;
}
