function isSameLocalDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getActiveWeekendSaturday(now) {
  const day = now.getDay(); // 0 Sunday ... 6 Saturday
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

function formatSlotLabel(date, timeLabel) {
  const dateLabel = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);
  return `${dateLabel} • ${timeLabel}`;
}

export function getUpcomingWeekendDates(currentDate = new Date()) {
  const now = new Date(currentDate);
  let saturdayDate = getActiveWeekendSaturday(now);
  let sundayDate = new Date(saturdayDate);
  sundayDate.setDate(saturdayDate.getDate() + 1);
  sundayDate.setHours(0, 0, 0, 0);

  const sundaySlotTime = new Date(sundayDate);
  sundaySlotTime.setHours(11, 0, 0, 0);

  // After this Sunday's slot passes, move to next weekend.
  if (now > sundaySlotTime) {
    saturdayDate = new Date(saturdayDate);
    saturdayDate.setDate(saturdayDate.getDate() + 7);
    saturdayDate.setHours(0, 0, 0, 0);

    sundayDate = new Date(saturdayDate);
    sundayDate.setDate(saturdayDate.getDate() + 1);
    sundayDate.setHours(0, 0, 0, 0);
  }

  return {
    currentDay: now.toLocaleDateString(undefined, { weekday: 'long' }),
    currentTime: now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    saturdayDate,
    sundayDate,
  };
}

export function getAvailableSlots(currentDate = new Date()) {
  const now = new Date(currentDate);
  const { saturdayDate, sundayDate } = getUpcomingWeekendDates(now);

  const saturdayCutoff = new Date(saturdayDate);
  saturdayCutoff.setHours(16, 0, 0, 0);

  const sundaySlotTime = new Date(sundayDate);
  sundaySlotTime.setHours(11, 0, 0, 0);

  const showOnlySunday =
    now > saturdayCutoff &&
    now <= sundaySlotTime &&
    (isSameLocalDate(now, saturdayDate) || isSameLocalDate(now, sundayDate));

  const saturdaySlot = {
    value: 'Saturday 6PM',
    label: formatSlotLabel(saturdayDate, '6:00 PM'),
    day: 'Saturday',
    date: saturdayDate,
  };

  const sundaySlot = {
    value: 'Sunday 11AM',
    label: formatSlotLabel(sundayDate, '11:00 AM'),
    day: 'Sunday',
    date: sundayDate,
  };

  return showOnlySunday ? [sundaySlot] : [saturdaySlot, sundaySlot];
}
