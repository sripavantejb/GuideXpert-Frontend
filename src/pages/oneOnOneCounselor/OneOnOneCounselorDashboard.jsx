import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiCalendar, FiUsers } from 'react-icons/fi';
import { useOneOnOneCounselorAuth } from '../../contexts/OneOnOneCounselorAuthContext';
import { oocStats } from '../../utils/oneOnOneCounselorApi';

function NatSummaryRow({ label, count, names, highlight }) {
  const nameList = Array.isArray(names) ? names : [];
  return (
    <div
      className={`rounded-lg border px-3 py-2.5 ${
        highlight ? 'border-[#0f2744]/20 bg-[#0f2744]/5' : 'border-slate-100 bg-slate-50/80'
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-xl font-bold tabular-nums text-[#0f2744]">{count ?? 0}</p>
      </div>
      {nameList.length > 0 ? (
        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{nameList.join(', ')}</p>
      ) : (
        <p className="mt-1.5 text-sm text-slate-400">No students</p>
      )}
    </div>
  );
}

function NatSummarySection({ title, rows, highlightUnset }) {
  const items = Array.isArray(rows) ? rows : [];
  if (!items.length) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h3>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((row) => (
          <NatSummaryRow
            key={`${title}-${row.label}`}
            label={row.label}
            count={row.count}
            names={row.names}
            highlight={highlightUnset && row.label === 'Not set' && row.count > 0}
          />
        ))}
      </div>
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
    setLoading(true);
    oocStats().then((res) => {
      setLoading(false);
      if (res.success) setStats(res.data?.data);
    });
  }, []);

  const cards = [
    { label: 'Assigned slots', value: stats?.slotCount ?? '—', to: '/one-on-one-counselor/slots', icon: FiCalendar },
    { label: 'Active slots', value: stats?.activeSlots ?? '—', to: '/one-on-one-counselor/slots', icon: FiCalendar },
    { label: 'Bookings', value: stats?.bookingCount ?? '—', to: '/one-on-one-counselor/bookings', icon: FiBookOpen },
    { label: 'Attended', value: stats?.attended ?? '—', to: '/one-on-one-counselor/bookings', icon: FiBookOpen },
  ];

  const nat = stats?.nat;
  const students = Array.isArray(nat?.students) ? nat.students : [];
  const totalConfirmed = nat?.totalConfirmed ?? students.length ?? 0;

  const natSections = [
    { title: 'Before session stage', rows: nat?.byBeforeSessionStage, highlightUnset: true },
    { title: 'Present stage', rows: nat?.byPresentStage, highlightUnset: true },
    { title: 'Channel', rows: nat?.byChannel, highlightUnset: false },
    { title: 'Campaign', rows: nat?.byCampaign, highlightUnset: false },
    { title: 'Language', rows: nat?.byLanguage, highlightUnset: false },
    { title: 'Counsellor by', rows: nat?.byCounsellorBy, highlightUnset: false },
    { title: 'CBA name', rows: nat?.byCbaName, highlightUnset: false },
  ];

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

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <FiUsers className="text-[#0f2744]" aria-hidden />
            <div>
              <h2 className="text-lg font-bold text-slate-900">NAT follow-up</h2>
              <p className="text-sm text-slate-500">
                Confirmed bookings assigned to you. Names only — contact admin for full details.
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
        ) : !nat ? (
          <p className="text-sm text-slate-500">NAT summary is not available yet. Please refresh in a moment.</p>
        ) : totalConfirmed === 0 ? (
          <p className="text-sm text-slate-500">No confirmed bookings assigned to you yet.</p>
        ) : (
          <>
            {natSections.map((section) => (
              <NatSummarySection
                key={section.title}
                title={section.title}
                rows={section.rows}
                highlightUnset={section.highlightUnset}
              />
            ))}

            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                All confirmed students
              </h3>
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
