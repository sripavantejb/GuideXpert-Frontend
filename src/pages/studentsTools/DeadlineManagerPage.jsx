import { FiClock, FiCalendar, FiBell } from 'react-icons/fi';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';

const SAMPLE_DEADLINES = [
  { exam: 'JEE Main Session 2', phase: 'Registration', date: 'Coming soon', urgent: false },
  { exam: 'AP EAMCET', phase: 'Application', date: 'Coming soon', urgent: false },
  { exam: 'KCET', phase: 'Counseling Round 1', date: 'Coming soon', urgent: false },
  { exam: 'MHT CET', phase: 'Result Declaration', date: 'Coming soon', urgent: false },
];

export default function DeadlineManagerPage() {
  return (
    <ToolWorkspaceLayout
      title="Deadline Manager"
      subtitle="Track important exam registrations, application windows, and counseling round deadlines in one place."
      compactHero
      howItWorks={[
        'Exam and admission deadlines are aggregated from official sources.',
        'Deadlines are sorted by urgency so you never miss a critical date.',
        'Upcoming deadlines are highlighted to help you plan ahead.',
      ]}
      whatThisToolDoes={[
        'Shows all important exam and admission deadlines at a glance.',
        'Helps you stay on top of registration windows, result dates, and counseling rounds.',
      ]}
      inputGuide={[
        'No input needed — deadlines are automatically tracked and displayed.',
        'Check back regularly as new deadlines are added throughout the admission cycle.',
      ]}
      preview={
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-md border-2 border-black bg-[#c7f36b] p-0.5 shadow-[2px_2px_0_#000]">
              <FiClock className="h-3 w-3 text-[#0F172A]" aria-hidden />
            </span>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
              Deadline tracker
            </p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Tracked exams</p>
            <p className="mt-0.5 text-xl font-black tabular-nums text-[#0F172A]">{SAMPLE_DEADLINES.length}</p>
          </div>
          <div>
            <div className="flex justify-between gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
              <span>Status</span>
              <span className="text-[#0F172A]">Updating</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full border-[3px] border-black bg-white shadow-[2px_2px_0_#000]">
              <div className="h-full w-1/3 rounded-full bg-[#c7f36b]" />
            </div>
          </div>
        </div>
      }
      results={null}
      insights={null}
    >
      <h2 className="text-xl font-black text-[#0F172A] sm:text-2xl">Upcoming Deadlines</h2>
      <p className="mt-1 text-sm font-medium text-slate-600">
        Key exam and admission dates you should keep an eye on.
      </p>

      <div className="mt-5 space-y-3">
        {SAMPLE_DEADLINES.map((d) => (
          <div
            key={`${d.exam}-${d.phase}`}
            className="flex items-start gap-4 rounded-[12px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_#000]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border-[3px] border-black bg-[#c7f36b] shadow-[2px_2px_0_#000]">
              <FiCalendar className="h-5 w-5 text-[#0F172A]" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-black text-[#0F172A]">{d.exam}</h3>
              <p className="mt-0.5 text-xs font-medium text-slate-500">{d.phase}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 rounded-[8px] border-2 border-black bg-slate-50 px-2.5 py-1 shadow-[2px_2px_0_#000]">
              <FiBell className="h-3 w-3 text-slate-500" aria-hidden />
              <span className="text-xs font-bold text-slate-600">{d.date}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[12px] border-[3px] border-dashed border-black/30 bg-slate-50 p-5 text-center">
        <FiClock className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-2 text-sm font-bold text-slate-600">Live deadline data coming soon</p>
        <p className="mt-1 text-xs text-slate-400">
          Dates will be automatically pulled from official exam portals once integrated.
        </p>
      </div>
    </ToolWorkspaceLayout>
  );
}
