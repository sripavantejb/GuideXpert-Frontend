import { FiClock, FiCalendar, FiBell } from 'react-icons/fi';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';
import {
  swEmptyState,
  swPreviewLabel,
  swProgressBar,
  swProgressTrack,
  swResultCard,
  swSectionSubtitle,
  swWorkspaceTitle,
} from './components/studentWorkspaceUi';

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
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <FiClock className="h-3.5 w-3.5" aria-hidden />
            </span>
            <p className={swPreviewLabel}>Deadline tracker</p>
          </div>
          <div>
            <p className={swPreviewLabel}>Tracked exams</p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums text-slate-900">{SAMPLE_DEADLINES.length}</p>
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Status</span>
              <span className="text-slate-700">Updating</span>
            </div>
            <div className={`mt-1.5 ${swProgressTrack}`}>
              <div className={swProgressBar} style={{ width: '33%' }} />
            </div>
          </div>
        </div>
      }
      results={null}
      insights={null}
    >
      <h2 className={swWorkspaceTitle}>Upcoming deadlines</h2>
      <p className={swSectionSubtitle}>Key exam and admission dates you should keep an eye on.</p>

      <div className="mt-5 space-y-3">
        {SAMPLE_DEADLINES.map((d) => (
          <div key={`${d.exam}-${d.phase}`} className={`${swResultCard} flex items-start gap-4`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FiCalendar className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-slate-900">{d.exam}</h3>
              <p className="mt-0.5 text-xs text-slate-500">{d.phase}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1">
              <FiBell className="h-3 w-3 text-slate-400" aria-hidden />
              <span className="text-xs font-medium text-slate-600">{d.date}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-6 ${swEmptyState}`}>
        <FiClock className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-2 text-sm font-medium text-slate-600">Live deadline data coming soon</p>
        <p className="mt-1 text-xs text-slate-400">
          Dates will be automatically pulled from official exam portals once integrated.
        </p>
      </div>
    </ToolWorkspaceLayout>
  );
}
