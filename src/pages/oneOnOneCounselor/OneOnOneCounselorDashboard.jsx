import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiCalendar, FiUsers } from 'react-icons/fi';
import { useOneOnOneCounselorAuth } from '../../contexts/OneOnOneCounselorAuthContext';
import { oocListBookings, oocStats } from '../../utils/oneOnOneCounselorApi';
import { buildNatSummaryFromBookings } from '../../utils/natFollowUpSummary';

function StageCountCard({ label, count, names, highlight }) {
  const nameList = Array.isArray(names) ? names : [];
  return (
    <div
      className={`rounded-xl border p-3 ${
        highlight ? 'border-amber-200 bg-amber-50/80' : 'border-slate-200 bg-white'
      }`}
    >
      <p className="text-2xl font-bold tabular-nums text-[#0f2744]">{count ?? 0}</p>
      <p className="mt-1 text-xs font-semibold leading-snug text-slate-700">{label}</p>
      {nameList.length > 0 ? (
        <p className="mt-2 text-xs text-slate-500 leading-relaxed line-clamp-3" title={nameList.join(', ')}>
          {nameList.join(', ')}
        </p>
      ) : null}
    </div>
  );
}

function FieldCountRow({ label, count, names }) {
  const nameList = Array.isArray(names) ? names : [];
  return (
    <div className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {nameList.length > 0 ? (
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">{nameList.join(', ')}</p>
        ) : (
          <p className="mt-1 text-xs text-slate-400">No students</p>
        )}
      </div>
      <p className="text-lg font-bold tabular-nums text-[#0f2744]">{count ?? 0}</p>
    </div>
  );
}

function StagePill({ value }) {
  const text = value?.trim() || 'Not set';
  const unset = text === 'Not set';
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        unset ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200' : 'bg-slate-100 text-slate-700'
      }`}
    >
      {text}
    </span>
  );
}

export default function OneOnOneCounselorDashboard() {
  const { user } = useOneOnOneCounselorAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const res = await oocStats();
      if (cancelled) return;

      if (!res.success) {
        setLoading(false);
        return;
      }

      const data = res.data?.data || {};
      let nat = data.nat;
      const bookingCount = data.bookingCount ?? 0;
      const natStudents = Array.isArray(nat?.students) ? nat.students : [];

      if (bookingCount > 0 && natStudents.length === 0) {
        const bookRes = await oocListBookings({
          page: 1,
          limit: Math.min(Math.max(bookingCount, 25), 500),
        });
        if (!cancelled && bookRes.success && Array.isArray(bookRes.data?.data)) {
          nat = buildNatSummaryFromBookings(bookRes.data.data);
        }
      }

      if (!cancelled) {
        setStats({ ...data, nat });
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    { label: 'Assigned slots', value: stats?.slotCount ?? '—', to: '/one-on-one-counselor/slots', icon: FiCalendar },
    { label: 'Active slots', value: stats?.activeSlots ?? '—', to: '/one-on-one-counselor/slots', icon: FiCalendar },
    { label: 'Bookings', value: stats?.bookingCount ?? '—', to: '/one-on-one-counselor/bookings', icon: FiBookOpen },
    { label: 'Attended', value: stats?.attended ?? '—', to: '/one-on-one-counselor/bookings', icon: FiBookOpen },
  ];

  const nat = stats?.nat;
  const students = Array.isArray(nat?.students) ? nat.students : [];
  const totalConfirmed = nat?.totalConfirmed ?? students.length ?? stats?.bookingCount ?? 0;

  const beforeStages = useMemo(() => nat?.byBeforeSessionStage || [], [nat]);
  const presentStages = useMemo(() => nat?.byPresentStage || [], [nat]);

  const fieldSections = useMemo(
    () => [
      { title: 'Channel', rows: nat?.byChannel || [] },
      { title: 'Campaign', rows: nat?.byCampaign || [] },
      { title: 'Language', rows: nat?.byLanguage || [] },
      { title: 'Counsellor by', rows: nat?.byCounsellorBy || [] },
      { title: 'CBA name', rows: nat?.byCbaName || [] },
    ],
    [nat]
  );

  const hasNatData = totalConfirmed > 0 && students.length > 0;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name}</h1>
        <p className="text-slate-600 text-sm mt-1">
          {user?.designation}
          {user?.collegeName ? ` · ${user?.collegeName}` : ''}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, to, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-[#0f2744]/30 transition"
          >
            <Icon className="text-[#0f2744] mb-2" aria-hidden />
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-600">{label}</p>
          </Link>
        ))}
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <FiUsers className="text-[#0f2744]" aria-hidden />
            <div>
              <h2 className="text-lg font-bold text-slate-900">NAT follow-up</h2>
              <p className="text-sm text-slate-500">
                Confirmed bookings and stage counts for your students. Names only — contact admin for full details.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-[#0f2744]/15 bg-[#0f2744]/5 px-4 py-2 text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Confirmed</p>
            <p className="text-2xl font-bold tabular-nums text-[#0f2744]">
              {loading ? '—' : totalConfirmed}
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading NAT summary…</p>
        ) : !hasNatData ? (
          <p className="text-sm text-slate-500">No confirmed bookings assigned to you yet.</p>
        ) : (
          <>
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Before session stage</h3>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {beforeStages.map((row) => (
                  <StageCountCard
                    key={`before-${row.label}`}
                    label={row.label}
                    count={row.count}
                    names={row.names}
                    highlight={row.label === 'Not set' && row.count > 0}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Present stage</h3>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {presentStages.map((row) => (
                  <StageCountCard
                    key={`present-${row.label}`}
                    label={row.label}
                    count={row.count}
                    names={row.names}
                    highlight={row.label === 'Not set' && row.count > 0}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {fieldSections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{section.title}</h3>
                  <div className="space-y-2">
                    {section.rows.map((row) => (
                      <FieldCountRow
                        key={`${section.title}-${row.label}`}
                        label={row.label}
                        count={row.count}
                        names={row.names}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">All confirmed students</h3>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Student
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Channel
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Campaign
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Language
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Before stage
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Present stage
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        CBA
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={`${student.studentName}-${index}`} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-medium text-slate-900 whitespace-nowrap">
                          {student.studentName}
                        </td>
                        <td className="px-3 py-2">
                          <StagePill value={student.natChannel} />
                        </td>
                        <td className="px-3 py-2">
                          <StagePill value={student.natCampaign} />
                        </td>
                        <td className="px-3 py-2">
                          <StagePill value={student.natLanguage} />
                        </td>
                        <td className="px-3 py-2">
                          <StagePill value={student.natBeforeSessionStage} />
                        </td>
                        <td className="px-3 py-2">
                          <StagePill value={student.natPresentStage} />
                        </td>
                        <td className="px-3 py-2">
                          <StagePill value={student.natCbaName} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
