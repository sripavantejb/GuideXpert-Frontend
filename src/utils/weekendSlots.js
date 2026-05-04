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

export function getAvailableSlots(currentDate = new Date()) {
  const now = new Date(currentDate);
  const phase = getIitSlotPhase(now);

  if (phase === 1) {
    const wed = nextISTWallClockAfterOrEqual(now, 3, 18, 0);
    const sun = nextISTWallClockAfterOrEqual(now, 0, 11, 0);
    return [
      slotOption('Wednesday 6PM', 'Wednesday', wed, '6:00 PM'),
      slotOption('Sunday 11AM', 'Sunday', sun, '11:00 AM'),
    ];
  }
  if (phase === 2) {
    const sat = nextISTWallClockAfterOrEqual(now, 6, 18, 0);
    const wed = nextISTWallClockAfterOrEqual(now, 3, 18, 0);
    return [
      slotOption('Saturday 6PM', 'Saturday', sat, '6:00 PM'),
      slotOption('Wednesday 6PM', 'Wednesday', wed, '6:00 PM'),
    ];
  }
  if (phase === 3) {
    const sat = nextISTWallClockAfterOrEqual(now, 6, 18, 0);
    const sun = nextISTWallClockAfterOrEqual(now, 0, 11, 0);
    return [
      slotOption('Saturday 6PM', 'Saturday', sat, '6:00 PM'),
      slotOption('Sunday 11AM', 'Sunday', sun, '11:00 AM'),
    ];
  }
  const sun = nextISTWallClockAfterOrEqual(now, 0, 11, 0);
  const wed = nextISTWallClockAfterOrEqual(now, 3, 18, 0);
  return [
    slotOption('Sunday 11AM', 'Sunday', sun, '11:00 AM'),
    slotOption('Wednesday 6PM', 'Wednesday', wed, '6:00 PM'),
  ];
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

/**
 * Demo slot calendar day (IST) for admin rows: prefer stored section1Data.slotBookingDate,
 * else derive from booking time + slot value (legacy Sat/Sun without date; else rotation).
 * @param {{ section1Data?: { slotBooking?: string, slotBookingDate?: string }, createdAt?: string, updatedAt?: string }} row
 * @returns {string} YYYY-MM-DD or ''
 */
export function deriveSlotDemoDateKeyIST(row) {
  const stored = String(row?.section1Data?.slotBookingDate ?? '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(stored)) return stored;
  const slotVal = String(row?.section1Data?.slotBooking ?? '').trim();
  if (!slotVal) return '';
  const anchor = row?.createdAt || row?.updatedAt;
  if (!anchor) return '';

  if (slotVal === 'Saturday 6PM' || slotVal === 'Sunday 11AM') {
    const legacy = legacyWeekendSlotPairForDerive(new Date(anchor));
    const match = legacy.find((s) => s.value === slotVal);
    if (!match?.date) return '';
    return formatDateISTYYYYMMDD(match.date);
  }

  const slots = getAvailableSlots(new Date(anchor));
  const match = slots.find((s) => s.value === slotVal);
  if (!match?.date) return '';
  return formatDateISTYYYYMMDD(match.date);
}
