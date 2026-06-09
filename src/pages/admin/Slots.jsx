import { useState, useEffect, useMemo } from 'react';
import {
  getSlotConfigs,
  updateSlotConfig,
  getIitSlotConfigs,
  updateIitSlotConfig,
  getSlotOverrides,
  setSlotOverride,
  getIitSlotOverrides,
  setIitSlotOverride,
  getSlotBookingCounts,
  getIitSlotBookingCounts,
  getStoredToken
} from '../../utils/adminApi';
import { useAuth } from '../../hooks/useAuth';
import ToggleSwitch from '../../components/UI/ToggleSwitch';

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_HEADER = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu',
  FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun'
};
const DAY_BY_DOW = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const TIME_ROWS = ['11AM', '3PM', '6PM', '7PM'];
const TIME_DISPLAY = { '11AM': '11 AM', '3PM': '3 PM', '6PM': '6 PM', '7PM': '7 PM' };
const WEEKDAY_HEADER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Must match backend ALL_SLOT_IDS so grid shows all configured slots (e.g. Sunday 3 PM). */
const EXPECTED_SLOT_IDS = [
  'MONDAY_7PM', 'TUESDAY_7PM', 'WEDNESDAY_7PM', 'THURSDAY_7PM',
  'FRIDAY_7PM', 'SATURDAY_7PM', 'SUNDAY_3PM', 'SUNDAY_11AM',
  'MONDAY_6PM', 'TUESDAY_6PM', 'WEDNESDAY_6PM', 'THURSDAY_6PM',
  'FRIDAY_6PM', 'SATURDAY_6PM', 'SUNDAY_6PM'
];

function slotIdFor(day, timeKey) {
  return `${day}_${timeKey}`;
}

/** Sunday 7 PM slot removed; only Sunday 3 PM is used. */
const SUNDAY_7PM_SLOT_ID = 'SUNDAY_7PM';

function slotMapFromList(slots) {
  const fromApi = (slots || []).reduce((acc, s) => {
    if (s?.slotId && s.slotId !== SUNDAY_7PM_SLOT_ID) acc[s.slotId] = s;
    return acc;
  }, {});
  // Ensure every expected slot has an entry so Sunday 3 PM etc. always show even if API missed it
  const merged = { ...fromApi };
  EXPECTED_SLOT_IDS.forEach((id) => {
    if (!merged[id]) merged[id] = { slotId: id, enabled: true, bookedCount: 0 };
  });
  return merged;
}

function toYYYYMMDD(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Always returns YYYY-MM-DD for map keys (Date or string from API). */
function toDateKey(date) {
  if (date instanceof Date) return toYYYYMMDD(date);
  if (typeof date === 'string' && date.length >= 10) return date.slice(0, 10);
  if (typeof date === 'string') return date;
  return toYYYYMMDD(new Date(date));
}

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startBlank = first.getDay();
  const daysInMonth = last.getDate();
  const cells = [];
  for (let i = 0; i < startBlank; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const total = 42;
  while (cells.length < total) cells.push(null);
  const rows = [];
  for (let r = 0; r < 6; r++) rows.push(cells.slice(r * 7, (r + 1) * 7));
  return rows;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** IIT group session slots by JS weekday (0=Sun, 3=Wed, 6=Sat). */
const IIT_SLOT_BY_DOW = {
  0: ['SUNDAY_11AM'],
  3: ['WEDNESDAY_6PM'],
  6: ['SATURDAY_6PM'],
};

function SectionSwitcher({ activeSection, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 p-0.5 bg-gray-100 rounded-lg border border-gray-200">
      <button
        type="button"
        onClick={() => onChange('guidexpert')}
        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          activeSection === 'guidexpert'
            ? 'bg-primary-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        GuideXpert
      </button>
      <button
        type="button"
        onClick={() => onChange('iit')}
        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          activeSection === 'iit'
            ? 'bg-primary-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        IITian Group Session
      </button>
    </div>
  );
}

export default function Slots() {
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState('guidexpert');
  const [slots, setSlots] = useState([]);
  const [iitSlots, setIitSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [iitLoading, setIitLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const [iitTogglingId, setIitTogglingId] = useState(null);

  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [overrides, setOverrides] = useState([]);
  const [iitOverrides, setIitOverrides] = useState([]);
  const [overridesLoading, setOverridesLoading] = useState(false);
  const [overrideToggling, setOverrideToggling] = useState(null);
  const [bookingCountsByDate, setBookingCountsByDate] = useState([]);
  const [iitBookingCountsByDate, setIitBookingCountsByDate] = useState([]);

  const fetchSlots = () => {
    setLoading(true);
    setError('');
    getSlotConfigs(getStoredToken()).then((result) => {
      if (!result.success) {
        if (result.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setError(result.message || 'Failed to load slot configs');
        setLoading(false);
        return;
      }
      setSlots(result.data?.data?.slots ?? []);
      setLoading(false);
    });
  };

  const fetchIitSlots = () => {
    setIitLoading(true);
    getIitSlotConfigs(getStoredToken()).then((result) => {
      if (!result.success) {
        if (result.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setError(result.message || 'Failed to load IIT slot configs');
        setIitLoading(false);
        return;
      }
      setIitSlots(result.data?.data?.slots ?? []);
      setIitLoading(false);
    });
  };

  useEffect(() => {
    fetchSlots();
    fetchIitSlots();
  }, [logout]);

  const fromStr = useMemo(() => {
    const d = new Date(viewYear, viewMonth, 1);
    return toYYYYMMDD(d);
  }, [viewYear, viewMonth]);
  const toStr = useMemo(() => {
    const d = new Date(viewYear, viewMonth + 1, 0);
    return toYYYYMMDD(d);
  }, [viewYear, viewMonth]);

  useEffect(() => {
    if (!fromStr || !toStr) return;
    setOverridesLoading(true);
    Promise.all([
      getSlotOverrides(fromStr, toStr, getStoredToken()),
      getSlotBookingCounts(fromStr, toStr, getStoredToken()),
      getIitSlotOverrides(fromStr, toStr, getStoredToken()),
      getIitSlotBookingCounts(fromStr, toStr, getStoredToken()),
    ]).then(([overridesRes, countsRes, iitOverridesRes, iitCountsRes]) => {
      setOverridesLoading(false);
      if (!overridesRes.success) {
        if (overridesRes.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        return;
      }
      setOverrides(overridesRes.data?.data?.overrides ?? []);
      if (countsRes.success && countsRes.data?.data?.counts) {
        setBookingCountsByDate(countsRes.data.data.counts);
      } else {
        setBookingCountsByDate([]);
      }
      if (iitOverridesRes.success) {
        setIitOverrides(iitOverridesRes.data?.data?.overrides ?? []);
      } else {
        setIitOverrides([]);
      }
      if (iitCountsRes.success && iitCountsRes.data?.data?.counts) {
        setIitBookingCountsByDate(iitCountsRes.data.data.counts);
      } else {
        setIitBookingCountsByDate([]);
      }
    });
  }, [fromStr, toStr, logout]);

  const handleIitToggle = async (slotId, enabled) => {
    setIitTogglingId(slotId);
    const result = await updateIitSlotConfig(slotId, enabled, getStoredToken());
    setIitTogglingId(null);
    if (!result.success) {
      if (result.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      setError(result.message || 'Failed to update IIT slot');
      return;
    }
    setIitSlots((prev) =>
      prev.map((s) => (s.slotId === slotId ? { ...s, enabled } : s))
    );
  };

  const handleToggle = async (slotId, enabled) => {
    setTogglingId(slotId);
    const result = await updateSlotConfig(slotId, enabled, getStoredToken());
    setTogglingId(null);
    if (!result.success) {
      if (result.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      setError(result.message || 'Failed to update slot');
      return;
    }
    setSlots((prev) =>
      prev.map((s) => (s.slotId === slotId ? { ...s, enabled } : s))
    );
  };

  const overrideMap = useMemo(() => {
    const m = {};
    overrides.forEach((o) => {
      m[`${o.date}_${o.slotId}`] = o.enabled;
    });
    return m;
  }, [overrides]);

  const bookingCountMap = useMemo(() => {
    const m = {};
    bookingCountsByDate.forEach((c) => {
      m[`${toDateKey(c.date)}_${c.slotId}`] = c.count;
    });
    return m;
  }, [bookingCountsByDate]);

  const iitOverrideMap = useMemo(() => {
    const m = {};
    iitOverrides.forEach((o) => {
      m[`${o.date}_${o.slotId}`] = o.enabled;
    });
    return m;
  }, [iitOverrides]);

  const iitBookingCountMap = useMemo(() => {
    const m = {};
    iitBookingCountsByDate.forEach((c) => {
      m[`${toDateKey(c.date)}_${c.slotId}`] = c.count;
    });
    return m;
  }, [iitBookingCountsByDate]);

  const iitSlotMap = useMemo(
    () => Object.fromEntries((iitSlots || []).map((s) => [s.slotId, s])),
    [iitSlots]
  );

  const handleOverrideToggle = async (dateStr, slotId, enabled) => {
    const key = `${dateStr}_${slotId}`;
    setOverrideToggling(key);
    const result = await setSlotOverride(dateStr, slotId, enabled, getStoredToken());
    setOverrideToggling(null);
    if (!result.success) {
      if (result.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      setError(result.message || 'Failed to update date override');
      return;
    }
    setOverrides((prev) => {
      const rest = prev.filter((o) => o.date !== dateStr || o.slotId !== slotId);
      return [...rest, { date: dateStr, slotId, enabled }];
    });
  };

  const handleIitOverrideToggle = async (dateStr, slotId, enabled) => {
    const key = `${dateStr}_${slotId}`;
    setOverrideToggling(key);
    const result = await setIitSlotOverride(dateStr, slotId, enabled, getStoredToken());
    setOverrideToggling(null);
    if (!result.success) {
      if (result.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      setError(result.message || 'Failed to update IIT date override');
      return;
    }
    setIitOverrides((prev) => {
      const rest = prev.filter((o) => o.date !== dateStr || o.slotId !== slotId);
      return [...rest, { date: dateStr, slotId, enabled }];
    });
  };

  const renderCalendarPanel = ({
    hasOverrideForDate,
    renderSelectedDateSlots,
  }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <button
          type="button"
          onClick={() => {
            if (viewMonth === 0) {
              setViewMonth(11);
              setViewYear((y) => y - 1);
            } else {
              setViewMonth((m) => m - 1);
            }
          }}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          aria-label="Previous month"
        >
          <span className="text-lg font-medium">←</span>
        </button>
        <span className="text-base font-semibold text-gray-900">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={() => {
            if (viewMonth === 11) {
              setViewMonth(0);
              setViewYear((y) => y + 1);
            } else {
              setViewMonth((m) => m + 1);
            }
          }}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          aria-label="Next month"
        >
          <span className="text-lg font-medium">→</span>
        </button>
      </div>

      <div className="p-4">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {WEEKDAY_HEADER.map((day) => (
                <th key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthGrid.map((row, ri) => (
              <tr key={ri}>
                {row.map((dayNum, ci) => {
                  if (dayNum === null) {
                    return <td key={`${ri}-${ci}`} className="p-1" />;
                  }
                  const date = new Date(viewYear, viewMonth, dayNum);
                  const dateStr = toYYYYMMDD(date);
                  const isSelected = selectedDate && toYYYYMMDD(selectedDate) === dateStr;
                  const hasOverride = hasOverrideForDate(dateStr);
                  return (
                    <td key={`${ri}-${ci}`} className="p-1">
                      <button
                        type="button"
                        onClick={() => setSelectedDate(date)}
                        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-primary-blue-600 text-white'
                            : hasOverride
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {dayNum}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedDate && (
        <div className="border-t border-gray-200 px-4 py-4 bg-gray-50/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              {selectedDate.toLocaleDateString('en-IN', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </h3>
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
          {overridesLoading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : (
            renderSelectedDateSlots(selectedDate)
          )}
        </div>
      )}
    </div>
  );

  const monthGrid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const slotMap = slotMapFromList(slots);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-8 py-6">
          <p className="text-red-600" role="alert">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Slot Management</h1>
          <SectionSwitcher activeSection={activeSection} onChange={setActiveSection} />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {activeSection === 'guidexpert'
            ? 'Toggle slots for the main GuideXpert lead and demo booking form. Disabled slots are hidden from applicants.'
            : 'Toggle demo slots for the IIT counselling form at /iit-counselling. These do not affect GuideXpert slots.'}
        </p>
      </div>

      {activeSection === 'guidexpert' ? (
      <section className="mb-10">

        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Date overrides</h3>
        <p className="text-sm text-gray-500 mb-4">
          Click a date to enable or disable GuideXpert slots for that specific day.
        </p>

        {renderCalendarPanel({
          hasOverrideForDate: (dateStr) => overrides.some((o) => o.date === dateStr),
          renderSelectedDateSlots: (date) => {
            const dayName = DAY_BY_DOW[date.getDay()];
            const dateStr = toDateKey(date);
            return (
              <ul className="space-y-3">
                {TIME_ROWS.map((timeKey) => {
                  const slotId = slotIdFor(dayName, timeKey);
                  const slot = slotMap[slotId];
                  if (!slot) return null;
                  const key = `${dateStr}_${slotId}`;
                  const overrideEnabled = overrideMap[key];
                  const enabled = overrideEnabled !== undefined ? overrideEnabled : slot.enabled;
                  const bookedCount = bookingCountMap[key] ?? 0;
                  return (
                    <li key={slotId} className="flex items-center justify-between rounded-lg bg-white border border-gray-200 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">{TIME_DISPLAY[timeKey]}</span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                            bookedCount > 0 ? 'bg-primary-blue-100 text-primary-blue-600' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {bookedCount} booked
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Enabled for this date</span>
                        <ToggleSwitch
                          id={`override-${key}`}
                          checked={enabled}
                          onChange={(checked) => handleOverrideToggle(dateStr, slotId, checked)}
                          disabled={overrideToggling === key}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            );
          },
        })}

        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 mt-8">Recurring weekly slots</h3>
        <p className="text-sm text-gray-500 mb-4">
          Default on/off for each GuideXpert demo slot by day and time.
        </p>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="px-8 py-16 text-center">
              <p className="text-gray-500">Loading GuideXpert slots…</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="px-8 py-16 text-center">
              <p className="text-gray-500">No slots configured.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-lg border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 pl-6 pr-2 w-20">Time</th>
                    {DAY_ORDER.map((day) => (
                      <th key={day} className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-2">
                        {DAY_HEADER[day]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_ROWS.map((timeKey) => (
                    <tr key={timeKey} className="border-b border-gray-100 last:border-b-0">
                      <td className="py-3 pl-6 pr-2 text-sm font-medium text-gray-700 align-top">{TIME_DISPLAY[timeKey]}</td>
                      {DAY_ORDER.map((day) => {
                        const slotId = slotIdFor(day, timeKey);
                        const slot = slotMap[slotId];
                        if (!slot) {
                          return (
                            <td key={slotId} className="py-3 px-2 text-center align-top text-gray-300">—</td>
                          );
                        }
                        const bookedCount = slot.bookedCount ?? 0;
                        return (
                          <td key={slotId} className="py-3 px-2 align-top">
                            <div className="flex flex-col items-center gap-2 rounded-lg bg-gray-50/80 py-3 px-2 min-h-18">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                                  bookedCount > 0 ? 'bg-primary-blue-100 text-primary-blue-600' : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {bookedCount} booked
                              </span>
                              <ToggleSwitch
                                id={`slot-${slotId}`}
                                checked={slot.enabled}
                                onChange={(checked) => handleToggle(slotId, checked)}
                                disabled={togglingId === slotId}
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
      ) : (
      <section className="mb-10">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Date overrides</h3>
        <p className="text-sm text-gray-500 mb-4">
          Click a date to enable or disable IIT group session slots for that specific day.
        </p>

        {renderCalendarPanel({
          hasOverrideForDate: (dateStr) => iitOverrides.some((o) => o.date === dateStr),
          renderSelectedDateSlots: (date) => {
            const slotIds = IIT_SLOT_BY_DOW[date.getDay()] || [];
            const dateStr = toDateKey(date);
            if (slotIds.length === 0) {
              return (
                <p className="text-sm text-gray-500">
                  No IIT group sessions on this weekday (sessions run Wed 6 PM, Sat 6 PM, Sun 11 AM).
                </p>
              );
            }
            return (
              <ul className="space-y-3">
                {slotIds.map((slotId) => {
                  const slot = iitSlotMap[slotId];
                  if (!slot) return null;
                  const key = `${dateStr}_${slotId}`;
                  const overrideEnabled = iitOverrideMap[key];
                  const enabled = overrideEnabled !== undefined ? overrideEnabled : slot.enabled;
                  const bookedCount = iitBookingCountMap[key] ?? 0;
                  return (
                    <li key={slotId} className="flex items-center justify-between rounded-lg bg-white border border-gray-200 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">{slot.label}</span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                            bookedCount > 0 ? 'bg-primary-blue-100 text-primary-blue-600' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {bookedCount} booked
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Enabled for this date</span>
                        <ToggleSwitch
                          id={`iit-override-${key}`}
                          checked={enabled}
                          onChange={(checked) => handleIitOverrideToggle(dateStr, slotId, checked)}
                          disabled={overrideToggling === key}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            );
          },
        })}

        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 mt-8">Weekly session slots</h3>
        <p className="text-sm text-gray-500 mb-4">
          Default on/off for each IIT counselling group session slot.
        </p>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {iitLoading ? (
            <div className="px-8 py-10 text-center">
              <p className="text-gray-500">Loading IIT group session slots…</p>
            </div>
          ) : iitSlots.length === 0 ? (
            <div className="px-8 py-10 text-center">
              <p className="text-gray-500">No IIT group session slots configured.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {iitSlots.map((slot) => (
                <li key={slot.slotId} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">{slot.label}</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                        (slot.bookedCount ?? 0) > 0 ? 'bg-primary-blue-100 text-primary-blue-600' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {slot.bookedCount ?? 0} booked
                    </span>
                  </div>
                  <ToggleSwitch
                    id={`iit-slot-${slot.slotId}`}
                    checked={slot.enabled}
                    onChange={(checked) => handleIitToggle(slot.slotId, checked)}
                    disabled={iitTogglingId === slot.slotId}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      )}
    </div>
  );
}
