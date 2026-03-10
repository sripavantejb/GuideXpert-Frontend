import { FiFileText, FiTarget, FiBookOpen, FiAlertCircle, FiTag } from 'react-icons/fi';

const SECTION_META = {
  'Start point':         { icon: FiTarget,      accent: 'bg-primary-navy/8 text-primary-navy border-primary-navy/15' },
  'Key topics covered':  { icon: FiTag,         accent: 'bg-violet-50 text-violet-700 border-violet-200/60' },
  'Learning outcome':    { icon: FiBookOpen,     accent: 'bg-emerald-50 text-emerald-700 border-emerald-200/60' },
  'Important notes':     { icon: FiAlertCircle, accent: 'bg-amber-50 text-amber-800 border-amber-200/60' },
};

export default function DescriptionCard({ session }) {
  if (!session?.description) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden transition-shadow duration-200 hover:shadow-md">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2.5">
          <FiFileText className="w-4 h-4 text-primary-navy" aria-hidden />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Description</h2>
        </div>
        <div className="p-6 flex flex-col items-center justify-center text-center py-14">
          <span className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
            <FiFileText className="w-6 h-6 text-gray-300" aria-hidden />
          </span>
          <p className="text-sm text-gray-400 font-medium">Select a session to view its description.</p>
        </div>
      </div>
    );
  }

  const d = session.description;
  const keyTopicsRaw = d.keyTopics;
  const keyTopicsList = Array.isArray(keyTopicsRaw)
    ? keyTopicsRaw
    : typeof keyTopicsRaw === 'string'
      ? keyTopicsRaw.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

  const sections = [
    { label: 'Start point',        content: d.startPoint,      isChips: false },
    { label: 'Key topics covered', content: null,              isChips: true, chips: keyTopicsList },
    { label: 'Learning outcome',   content: d.learningOutcome, isChips: false },
    { label: 'Important notes',    content: d.importantNotes,  isChips: false },
  ].filter((s) => s.content || (s.chips && s.chips.length > 0));

  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden transition-shadow duration-200 hover:shadow-md">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2.5">
        <FiFileText className="w-4 h-4 text-primary-navy" aria-hidden />
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Description</h2>
      </div>

      {/* Sections */}
      <div className="overflow-y-auto max-h-[300px] sm:max-h-[340px] p-5 space-y-4">
        {sections.map((section, i) => {
          const meta = SECTION_META[section.label] || {
            icon: FiFileText,
            accent: 'bg-gray-50 text-gray-600 border-gray-200',
          };
          const Icon = meta.icon;
          return (
            <div
              key={i}
              className={`rounded-xl border p-4 ${meta.accent}`}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <Icon className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
                <p className="text-[10px] font-bold uppercase tracking-widest leading-tight">
                  {section.label}
                </p>
              </div>
              {section.isChips && section.chips?.length ? (
                <div className="flex flex-wrap gap-2">
                  {section.chips.map((topic, j) => (
                    <span
                      key={j}
                      className="inline-flex px-3 py-1 rounded-lg bg-white/80 text-violet-900 text-xs font-semibold border border-violet-200/80 shadow-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-relaxed">{section.content}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
