import { FiClock, FiCalendar, FiBell } from 'react-icons/fi';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';
import {
  swEmptyState,
  swFormSubtitle,
  swFormTitle,
  swPreviewLabel,
  swProgressBar,
  swProgressTrack,
  swResultCard,
} from './components/studentWorkspaceUi';

const SAMPLE_DEADLINES = [
  { exam: 'JEE Main Session 2', phase: 'Registration window', date: 'Coming soon', status: 'Scheduled' },
  { exam: 'AP EAMCET', phase: 'Application', date: 'Coming soon', status: 'Scheduled' },
  { exam: 'KCET', phase: 'Counseling Round 1', date: 'Coming soon', status: 'Scheduled' },
  { exam: 'MHT CET', phase: 'Result declaration', date: 'Coming soon', status: 'Scheduled' },
];

export default function DeadlineManagerPage() {
  return (
    <ToolWorkspaceLayout
      title="Deadline Manager"
      subtitle="Track registrations, application windows, and counseling rounds in one calm, reliable view."
      compactHero
      howItWorks={[
        'Exam and admission deadlines are aggregated from official sources.',
        'Deadlines are sorted by urgency so you never miss a critical date.',
        'Upcoming deadlines are highlighted to help you plan ahead.',
      ]}
      whatThisToolDoes={[
        'Shows important exam and admission deadlines at a glance.',
        'Helps you stay on top of registration windows, results, and counseling rounds.',
      ]}
      inputGuide={[
        'No input needed — deadlines are tracked and displayed automatically.',
        'Check back regularly as new deadlines are added through the admission cycle.',
      ]}
      preview={
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f1f8] text-[#0b3a5c]">
              <FiClock className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className={swPreviewLabel}>Tracked exams</p>
              <p className="font-semibold tabular-nums text-[#041e30]">{SAMPLE_DEADLINES.length} active tracks</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-[#5a6570]">
              <span>Live feed status</span>
              <span className="font-semibold text-[#041e30]">Integrating</span>
            </div>
            <div className={`mt-2 ${swProgressTrack}`}>
              <div className={swProgressBar} style={{ width: '38%' }} />
            </div>
          </div>
        </div>
      }
      results={null}
      insights={null}
    >
      <h2 className={swFormTitle}>Upcoming deadlines</h2>
      <p className={swFormSubtitle}>Priority dates across major exams — official live sync is on the way.</p>

      <div className="mt-6 space-y-3">
        {SAMPLE_DEADLINES.map((d) => (
          <div
            key={`${d.exam}-${d.phase}`}
            className={`${swResultCard} flex flex-col gap-4 sm:flex-row sm:items-center`}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#041e30] text-white">
              <FiCalendar className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-sw-display text-base font-bold text-[#041e30]">
                {d.exam}
              </h3>
              <p className="mt-0.5 text-sm text-[#5a6570]">{d.phase}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-start rounded-xl border border-[#e4e9f0] bg-[#f8fafc] px-3 py-2 sm:self-auto">
              <FiBell className="h-3.5 w-3.5 text-[#f27921]" aria-hidden />
              <span className="text-xs font-semibold text-[#2c3640]">{d.date}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-8 ${swEmptyState}`}>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef2f7] text-[#041e30]">
          <FiClock className="h-6 w-6" aria-hidden />
        </div>
        <p className="mt-4 font-sw-display text-base font-bold text-[#041e30]">
          Live deadline data coming soon
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#5a6570]">
          Dates will be pulled from official exam portals once integration is complete — this list is a preview of the
          layout.
        </p>
      </div>
    </ToolWorkspaceLayout>
  );
}
