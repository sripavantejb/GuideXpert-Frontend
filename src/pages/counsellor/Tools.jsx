import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTarget, FiBarChart2, FiZap, FiClock, FiArrowRight, FiArrowLeft, FiActivity, FiCrosshair, FiStar } from 'react-icons/fi';

const toolCards = [
  { id: 'college', title: 'College Predictor', desc: 'Suggest colleges based on rank, region, budget and preferences.', icon: FiTarget },
  { id: 'rank', title: 'Rank Predictor', desc: 'Predict expected rank from exam performance scores.', icon: FiBarChart2 },
  { id: 'exam', title: 'Exam Predictor', desc: 'Suggest suitable exams based on student profile and strengths.', icon: FiZap },
  { id: 'deadline', title: 'Deadline Manager', desc: 'Track important exam and admission deadlines at a glance.', icon: FiClock },
];

const assessmentToolCards = [
  {
    id: 'career-dna',
    title: 'Psychometric Test',
    desc: 'Explore what your dream course might be, even if it differs from what you first thought. Students are often surprised by their results – find out what your profile reveals.',
    icon: FiActivity,
  },
  {
    id: 'course-fit',
    title: 'Course Fit Test',
    desc: 'Find out which stream feels made for you. See how closely your goals align with your personality.',
    icon: FiCrosshair,
  },
  {
    id: 'future-fit',
    title: 'Future Fit Test',
    desc: 'Match with college vibes that truly suit your personality. Your strengths might point you toward a course you never expected.',
    icon: FiStar,
  },
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

function AssessmentToolCard({ title, desc, icon, onLaunch, comingSoon = false }) {
  const Icon = icon;
  return (
    <div
      className={`rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full ${
        comingSoon ? 'opacity-95' : 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      <div className="h-1.5 w-full shrink-0 bg-primary-navy" />
      <div className="p-6 flex flex-col flex-1 min-h-0">
        <div className="mb-4 shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-navy">
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        <h3 className="mb-2 text-base font-bold text-gray-900 shrink-0">{title}</h3>
        <p className="text-sm leading-relaxed text-gray-500 flex-1 min-h-0 mb-6">{desc}</p>
        {comingSoon ? (
          <button
            type="button"
            disabled
            className="mt-auto shrink-0 inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500 w-fit"
          >
            Coming soon
          </button>
        ) : (
          <button
            type="button"
            onClick={onLaunch}
            className="mt-auto shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-primary-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-navy/90 w-fit"
          >
            Launch Tool <FiArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function ComingSoonPanel() {
  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-8 text-center">
      <p className="text-gray-500 font-medium">This tool is coming soon.</p>
      <p className="text-sm text-gray-400 mt-1">Check back later for updates.</p>
    </div>
  );
}

const COMING_SOON_IDS = ['rank', 'exam', 'deadline', 'career-dna', 'course-fit', 'future-fit'];

function ActiveToolPanel({ activeTool, onBack }) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 mb-4 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
      >
        <FiArrowLeft className="w-4 h-4" />
        Back to Tools
      </button>

      {COMING_SOON_IDS.includes(activeTool) && <ComingSoonPanel />}
    </div>
  );
}

function Tools() {
  const [activeTool, setActiveTool] = useState(null);
  const navigate = useNavigate();
  const toolPanelRef = useRef(null);

  useEffect(() => {
    if (activeTool && toolPanelRef.current) {
      toolPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTool]);

  if (activeTool) {
    return (
      <div className="w-full" ref={toolPanelRef}>
        <ActiveToolPanel activeTool={activeTool} onBack={() => setActiveTool(null)} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <SectionHeader
        title="Comprehensive Counselor Tools"
        subtitle="All-in-one platform for managing your counseling practice"
      />

      <SectionHeader
        title="Prediction tools"
        subtitle="Rank, college, exam and deadline helpers"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
        {toolCards.map((t) => (
          <ToolCard
            key={t.id}
            title={t.title}
            desc={t.desc}
            icon={t.icon}
            onLaunch={() => {
              if (t.id === 'rank') navigate('/counsellor/tools/rank-predictor');
              else if (t.id === 'college') navigate('college-predictor');
              else setActiveTool(t.id);
            }}
          />
        ))}
      </div>

      <SectionHeader
        title="Student assessments"
        subtitle="Tests to help students discover their fit"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {assessmentToolCards.map((t) => (
          <AssessmentToolCard
            key={t.id}
            title={t.title}
            desc={t.desc}
            icon={t.icon}
            comingSoon
            onLaunch={() => setActiveTool(t.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default Tools;
