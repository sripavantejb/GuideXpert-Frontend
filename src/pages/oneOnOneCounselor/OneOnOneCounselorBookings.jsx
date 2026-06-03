import { useCallback, useEffect, useState } from 'react';
import { oocListBookings, oocPatchBookingRemarks, oocPatchBookingStatus } from '../../utils/oneOnOneCounselorApi';

const STATUS_OPTIONS = ['Confirmed', 'Attended', 'Not Attended', 'Rescheduled'];

export default function OneOnOneCounselorBookings() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarksDraft, setRemarksDraft] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    const res = await oocListBookings({ limit: 100 });
    setLoading(false);
    if (res.success) setRows(res.data?.data || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id, bookingStatus) => {
    await oocPatchBookingStatus(id, bookingStatus);
    load();
  };

  const saveRemarks = async (id) => {
    await oocPatchBookingRemarks(id, remarksDraft[id] ?? '');
    load();
  };

  return (
    <div className="p-6 md:p-8 space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Student Bookings</h1>
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left">Student</th>
              <th className="px-3 py-2 text-left">Mobile</th>
              <th className="px-3 py-2 text-left">Slot</th>
              <th className="px-3 py-2 text-left">Parent</th>
              <th className="px-3 py-2 text-left">WhatsApp</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left min-w-[200px]">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : (
              rows.map((b) => (
                <tr key={b.id} className="border-t align-top">
                  <td className="px-3 py-2">{b.studentName}</td>
                  <td className="px-3 py-2">{b.mobileNumber}</td>
                  <td className="px-3 py-2">
                    {b.slot ? `${b.slot.sessionTitle} (${b.slot.slotDate})` : '—'}
                  </td>
                  <td className="px-3 py-2">{b.parentAttendanceConfirmed ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2">{b.whatsappConsent ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2">
                    <select
                      value={b.bookingStatus || 'Confirmed'}
                      onChange={(e) => updateStatus(b.id, e.target.value)}
                      className="border rounded-lg px-2 py-1 text-xs"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      {b.bookingConfirmedAt
                        ? new Date(b.bookingConfirmedAt).toLocaleString('en-IN')
                        : ''}
                    </p>
                  </td>
                  <td className="px-3 py-2">
                    <textarea
                      rows={2}
                      className="w-full border rounded-lg px-2 py-1 text-xs"
                      defaultValue={b.counselorRemarks || ''}
                      onChange={(e) =>
                        setRemarksDraft((d) => ({ ...d, [b.id]: e.target.value }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => saveRemarks(b.id)}
                      className="mt-1 text-xs text-[#0f2744] font-medium"
                    >
                      Save remarks
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
