import { useState, useCallback } from 'react'; // eslint-disable-line no-unused-vars -- useCallback for cached/legacy bundles
import { FiTarget, FiBarChart2, FiZap, FiClock, FiArrowRight } from 'react-icons/fi';

const toolCards = [
  { id: 'college', title: 'College Predictor', desc: 'Suggest colleges based on rank, region, budget and preferences.', icon: FiTarget },
  { id: 'rank', title: 'Rank Predictor', desc: 'Predict expected rank from exam performance scores.', icon: FiBarChart2 },
  { id: 'exam', title: 'Exam Predictor', desc: 'Suggest suitable exams based on student profile and strengths.', icon: FiZap },
  { id: 'deadline', title: 'Deadline Manager', desc: 'Track important exam and admission deadlines at a glance.', icon: FiClock },
];

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-1 h-6 rounded-full bg-primary-navy" />
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-gray-500 ml-4">{subtitle}</p>}
    </div>
  );
}

function ToolCard({ title, desc, icon, onLaunch }) {
  const Icon = icon;
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-navy/10">
          <Icon className="w-5 h-5 text-primary-navy" />
        </div>
      </div>
      <h3 className="mb-1 text-base font-bold text-gray-900">{title}</h3>
      <p className="mb-5 text-sm leading-relaxed text-gray-500">{desc}</p>
      <button
        type="button"
        onClick={onLaunch}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-navy/90"
      >
        Launch Tool <FiArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function Tools() {
  const [activeTool, setActiveTool] = useState(null);

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        title="Comprehensive Counselor Tools"
        subtitle="All-in-one platform for managing your counseling practice"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
        {toolCards.map((t) => (
          <ToolCard
            key={t.id}
            title={t.title}
            desc={t.desc}
            icon={t.icon}
            onLaunch={() => setActiveTool(t.id)}
          />
        ))}
      </div>

      {activeTool && (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-gray-500 font-medium">This tool is coming soon.</p>
          <p className="text-sm text-gray-400 mt-1">Check back later for updates.</p>
        </div>
      )}
    </div>
  );
}
