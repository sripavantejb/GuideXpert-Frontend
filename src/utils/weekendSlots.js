const IST = 'Asia/Kolkata';

const pad2 = (n) => String(n).padStart(2, '0');

/** Concrete instant for IST wall clock (no DST). */
function makeISTDate(year, month, day, hour, minute = 0) {
  return new Date(
    `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(minute)}:00+05:30`
  );
}

function getISTCalendarParts(utcDate) {
  const f = new Intl.DateTimeFormat('en-US', {
    timeZone: IST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = f.formatToParts(utcDate);
  const map = {};
  for (const p of parts) {
    if (p.type !== 'literal') map[p.type] = p.value;
  }
  const wdMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    weekday: wdMap[map.weekday] ?? 0,
    hour: Number(map.hour),
    minute: Number(map.minute),
  };
}

function addCalendarDaysIST(parts, deltaDays) {
  const d = makeISTDate(parts.year, parts.month, parts.day, 12, 0);
  const next = new Date(d.getTime() + deltaDays * 86400000);
  return getISTCalendarParts(next);
}

/** Next IST occurrence of weekday at h:m: same week if still ahead, else +7 days (inclusive if anchor is past that instant). */
function nextISTWallClockAfterOrEqual(anchorDate, targetWeekday, hour, minute) {
  const p = getISTCalendarParts(anchorDate);
  let addDays = (targetWeekday - p.weekday + 7) % 7;
  let t = addCalendarDaysIST({ year: p.year, month: p.month, day: p.day }, addDays);
  let cand = makeISTDate(t.year, t.month, t.day, hour, minute);
  if (cand.getTime() <= anchorDate.getTime()) {
    t = addCalendarDaysIST(t, 7);
    cand = makeISTDate(t.year, t.month, t.day, hour, minute);
  }
  return cand;
}

/**
 * IIT counselling demo slot rotation (IST), four disjoint phases.
 * Phase 4 is Saturday 17:00–24:00 only; Sunday 00:00–10:00 is phase 1 (avoids overlap with phase 4 options).
 */
function getIitSlotPhase(utcDate) {
  const { weekday, hour, minute } = getISTCalendarParts(utcDate);
  const mins = hour * 60 + minute;

  if (weekday === 0 && mins < 10 * 60) return 1;
  if (weekday === 6 && mins >= 17 * 60) return 4;
  if (weekday === 0 && mins >= 10 * 60) return 2;
  if (weekday === 1 || weekday === 2 || (weekday === 3 && mins < 17 * 60)) return 2;
  return 3;
}

function formatSlotLabel(date, timeLabel) {
  const dateLabel = new Intl.DateTimeFormat('en-IN', {
    timeZone: IST,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);
  return `${dateLabel} • ${timeLabel}`;
}

function slotOption(value, day, date, timeLabel) {
  return {
    value,
    label: formatSlotLabel(date, timeLabel),
    day,
    date,
  };
}

/** Canonical IIT counselling slot definitions (IST). */
const IIT_SLOT_SPECS = [
  { value: 'Wednesday 6PM', weekday: 3, hour: 18, minute: 0, timeLabel: '6:00 PM', day: 'Wednesday' },
  { value: 'Saturday 6PM', weekday: 6, hour: 18, minute: 0, timeLabel: '6:00 PM', day: 'Saturday' },
  { value: 'Sunday 11AM', weekday: 0, hour: 11, minute: 0, timeLabel: '11:00 AM', day: 'Sunday' },
];

export const IIT_BOOKING_VALUE_TO_SLOT_ID = {
  'Wednesday 6PM': 'WEDNESDAY_6PM',
  'Saturday 6PM': 'SATURDAY_6PM',
  'Sunday 11AM': 'SUNDAY_11AM',
};

function isDateOverrideDisabled(date, slotValue, dateOverrides) {
  if (!Array.isArray(dateOverrides) || dateOverrides.length === 0) return false;
  const dateStr = formatDateISTYYYYMMDD(date);
  const slotId = IIT_BOOKING_VALUE_TO_SLOT_ID[slotValue];
  if (!dateStr || !slotId) return false;
  const match = dateOverrides.find((o) => o.date === dateStr && o.slotId === slotId);
  return match ? !match.enabled : false;
}

function buildEnabledSlotOption(spec, date) {
  const dateStr = formatDateISTYYYYMMDD(date);
  return {
    value: `${spec.value}|${dateStr}`,
    slotBooking: spec.value,
    label: formatSlotLabel(date, spec.timeLabel),
    day: spec.day,
    date,
  };
}

/** Next bookable occurrence for one slot type, skipping date overrides disabled for that day. */
function nextEnabledSlotOccurrence(now, spec, dateOverrides = null) {
  let anchor = now;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const date = nextISTWallClockAfterOrEqual(anchor, spec.weekday, spec.hour, spec.minute);
    if (!isDateOverrideDisabled(date, spec.value, dateOverrides)) {
      return buildEnabledSlotOption(spec, date);
    }
    anchor = new Date(date.getTime() + 60_000);
  }
  return null;
}

function nextOccurrencesForSpec(now, spec, dateOverrides, count) {
  const results = [];
  let anchor = now;
  while (results.length < count) {
    const opt = nextEnabledSlotOccurrence(anchor, spec, dateOverrides);
    if (!opt) break;
    const dateStr = formatDateISTYYYYMMDD(opt.date);
    if (!results.some((r) => formatDateISTYYYYMMDD(r.date) === dateStr)) {
      results.push(opt);
    }
    anchor = new Date(opt.date.getTime() + 60_000);
  }
  return results;
}

function getAvailableSlotsForEnabled(now, enabledBookingValues, dateOverrides = null) {
  const enabledSet = new Set(enabledBookingValues);
  const enabledSpecs = IIT_SLOT_SPECS.filter((spec) => enabledSet.has(spec.value));

  if (enabledSpecs.length === 1) {
    return nextOccurrencesForSpec(now, enabledSpecs[0], dateOverrides, 2);
  }

  return enabledSpecs
    .map((spec) => nextEnabledSlotOccurrence(now, spec, dateOverrides))
    .filter(Boolean)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 2);
}

/** Resolve API slotBooking label + YYYY-MM-DD from a form selection value. */
export function parseIitSlotSelection(selectedValue, options = []) {
  const opt = options.find((o) => o.value === selectedValue);
  if (opt?.slotBooking && opt?.date) {
    return {
      slotBooking: opt.slotBooking,
      slotBookingDate: formatDateISTYYYYMMDD(opt.date),
    };
  }
  const raw = String(selectedValue ?? '').trim();
  if (!raw) return { slotBooking: '', slotBookingDate: '' };
  const pipe = raw.indexOf('|');
  if (pipe > 0) {
    return {
      slotBooking: raw.slice(0, pipe).trim(),
      slotBookingDate: raw.slice(pipe + 1).trim(),
    };
  }
  return {
    slotBooking: raw,
    slotBookingDate: resolveSlotBookingDateForIitPayload(raw, new Date()),
  };
}

export function getAvailableSlots(currentDate = new Date(), enabledBookingValues = null, dateOverrides = null) {
  const now = new Date(currentDate);

  if (enabledBookingValues !== null && enabledBookingValues !== undefined) {
    if (enabledBookingValues.length === 0) return [];
    return getAvailableSlotsForEnabled(now, enabledBookingValues, dateOverrides);
  }

  const phase = getIitSlotPhase(now);
  let options;

  if (phase === 1) {
    const wed = nextISTWallClockAfterOrEqual(now, 3, 18, 0);
    const sun = nextISTWallClockAfterOrEqual(now, 0, 11, 0);
    options = [
      slotOption('Wednesday 6PM', 'Wednesday', wed, '6:00 PM'),
      slotOption('Sunday 11AM', 'Sunday', sun, '11:00 AM'),
    ];
  } else if (phase === 2) {
    const sat = nextISTWallClockAfterOrEqual(now, 6, 18, 0);
    const wed = nextISTWallClockAfterOrEqual(now, 3, 18, 0);
    options = [
      slotOption('Saturday 6PM', 'Saturday', sat, '6:00 PM'),
      slotOption('Wednesday 6PM', 'Wednesday', wed, '6:00 PM'),
    ];
  } else if (phase === 3) {
    const sat = nextISTWallClockAfterOrEqual(now, 6, 18, 0);
    const sun = nextISTWallClockAfterOrEqual(now, 0, 11, 0);
    options = [
      slotOption('Saturday 6PM', 'Saturday', sat, '6:00 PM'),
      slotOption('Sunday 11AM', 'Sunday', sun, '11:00 AM'),
    ];
  } else {
    const sun = nextISTWallClockAfterOrEqual(now, 0, 11, 0);
    const wed = nextISTWallClockAfterOrEqual(now, 3, 18, 0);
    options = [
      slotOption('Sunday 11AM', 'Sunday', sun, '11:00 AM'),
      slotOption('Wednesday 6PM', 'Wednesday', wed, '6:00 PM'),
    ];
  }

  return options;
}

/** IST calendar date YYYY-MM-DD for a Date instance. */
export function formatDateISTYYYYMMDD(date) {
  if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: IST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function getActiveWeekendSaturday(now) {
  const day = now.getDay();
  const saturday = new Date(now);

  if (day === 6) {
    saturday.setHours(0, 0, 0, 0);
    return saturday;
  }

  if (day === 0) {
    saturday.setDate(now.getDate() - 1);
    saturday.setHours(0, 0, 0, 0);
    return saturday;
  }

  const daysUntilSaturday = 6 - day;
  saturday.setDate(now.getDate() + daysUntilSaturday);
  saturday.setHours(0, 0, 0, 0);
  return saturday;
}

/**
 * Pre-rotation weekend slot calendar days (browser local), for legacy rows
 * without slotBookingDate.
 */
function legacyWeekendSlotPairForDerive(anchor) {
  const now = new Date(anchor);
  let saturdayDate = getActiveWeekendSaturday(now);
  let sundayDate = new Date(saturdayDate);
  sundayDate.setDate(saturdayDate.getDate() + 1);
  sundayDate.setHours(0, 0, 0, 0);

  const sundaySlotTime = new Date(sundayDate);
  sundaySlotTime.setHours(11, 0, 0, 0);

  if (now > sundaySlotTime) {
    saturdayDate = new Date(saturdayDate);
    saturdayDate.setDate(saturdayDate.getDate() + 7);
    saturdayDate.setHours(0, 0, 0, 0);

    sundayDate = new Date(saturdayDate);
    sundayDate.setDate(saturdayDate.getDate() + 1);
    sundayDate.setHours(0, 0, 0, 0);
  }

  return [
    { value: 'Saturday 6PM', date: saturdayDate },
    { value: 'Sunday 11AM', date: sundayDate },
  ];
}

function deriveDemoDateFromRotationAnchors(row, slotVal) {
  const anchors = [row?.section1Data?.submittedAt, row?.createdAt, row?.updatedAt].filter(Boolean);
  for (const anchor of anchors) {
    const slots = getAvailableSlots(new Date(anchor));
    const match = slots.find((s) => s.value === slotVal);
    if (match?.date) return formatDateISTYYYYMMDD(match.date);
  }
  return '';
}

/**
 * Demo slot calendar day (IST) for admin rows: prefer stored section1Data.slotBookingDate,
 * else derive from booking time + slot value (legacy Sat/Sun without date; else rotation).
 * @param {{ section1Data?: { slotBooking?: string, slotBookingDate?: string, submittedAt?: string }, createdAt?: string, updatedAt?: string }} row
 * @returns {string} YYYY-MM-DD or ''
 */
export function deriveSlotDemoDateKeyIST(row) {
  const stored = String(row?.section1Data?.slotBookingDate ?? '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(stored)) return stored;
  const slotVal = String(row?.section1Data?.slotBooking ?? '').trim();
  if (!slotVal) return '';
  const anchor = row?.section1Data?.submittedAt || row?.createdAt || row?.updatedAt;
  if (!anchor) return '';

  if (slotVal === 'Saturday 6PM' || slotVal === 'Sunday 11AM') {
    const legacy = legacyWeekendSlotPairForDerive(new Date(anchor));
    const match = legacy.find((s) => s.value === slotVal);
    if (!match?.date) return '';
    return formatDateISTYYYYMMDD(match.date);
  }

  return deriveDemoDateFromRotationAnchors(row, slotVal);
}

/**
 * IST session date YYYY-MM-DD for IIT section1: derived from slot label using the same demo rotation as the UI.
 * Use when resolving the date independently of dropdown option objects (e.g. if options rotated before submit).
 *
 * @param {string|null|undefined} slotBookingValue e.g. "Wednesday 6PM"
 * @param {Date} [now]
 * @returns {string} '' if unknown label
 */
export function resolveSlotBookingDateForIitPayload(slotBookingValue, now = new Date()) {
  const v = String(slotBookingValue ?? '').trim();
  if (!v) return '';
  const booking = v.includes('|') ? v.slice(0, v.indexOf('|')).trim() : v;
  const spec = IIT_SLOT_SPECS.find((s) => s.value === booking);
  if (!spec) return '';
  const date = nextISTWallClockAfterOrEqual(now, spec.weekday, spec.hour, spec.minute);
  return formatDateISTYYYYMMDD(date);
}
