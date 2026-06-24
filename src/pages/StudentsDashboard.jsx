import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LuRocket,
  LuSearch,
  LuBookOpen,
  LuMapPin,
  LuScale,
  LuArrowRight,
  LuGraduationCap,
  LuActivity,
  LuX,
} from 'react-icons/lu';
import StudentWorkspaceNavbar from '../components/studentDashboard/StudentWorkspaceNavbar';
import StudentWorkspaceFooter from '../components/studentDashboard/StudentWorkspaceFooter';
import StudentsDashboardHero from '../components/studentDashboard/StudentsDashboardHero';
import { readOrganicRankLeadSnapshot } from '../utils/organicRankLeadLocal';

const TOOLS = [
  {
    id: 'rank-predictor',
    title: 'Rank Predictor',
    description: 'Estimate your exam rank from marks using historical cutoff data.',
    to: '/students/rank-predictor',
    category: 'predictors',
    tags: ['rank', 'predictor', 'jee', 'marks', 'exam', 'score'],
    icon: LuActivity,
    iconClass: 'bg-sky-50 text-sky-600',
  },
  {
    id: 'college-predictor',
    title: 'College Predictor',
    description: 'Shortlist colleges that match your rank, category, and preferences.',
    to: '/students/predictors',
    category: 'predictors',
    tags: ['college', 'predictor', 'admission', 'cutoff', 'matches', 'state', 'category'],
    icon: LuSearch,
    iconClass: 'bg-rose-50 text-rose-600',
  },
  {
    id: 'branch-predictor',
    title: 'Branch Predictor',
    description: 'See which branches you can get at your target institutions.',
    to: '/students/predictors',
    category: 'predictors',
    tags: ['branch', 'predictor', 'academic', 'pathway', 'iit', 'nit', 'seat'],
    icon: LuRocket,
    iconClass: 'bg-violet-50 text-violet-600',
  },
  {
    id: 'course-fit',
    title: 'Course Fit Test',
    description: 'Discover courses aligned with your interests and learning style.',
    to: '/students/tests',
    category: 'fit',
    tags: ['course', 'fit', 'test', 'career', 'interest', 'subject'],
    icon: LuGraduationCap,
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'college-fit',
    title: 'Culture Fit Test',
    description: 'Find campuses that match your lifestyle, budget, and goals.',
    to: '/students/tests',
    category: 'fit',
    tags: ['culture', 'college', 'fit', 'test', 'budget', 'campus', 'fees'],
    icon: LuMapPin,
    iconClass: 'bg-amber-50 text-amber-600',
  },
  {
    id: 'college-comparison',
    title: 'College Comparison',
    description: 'Compare institutions side-by-side on key admission metrics.',
    to: '/students/college-comparison',
    category: 'compare',
    tags: ['compare', 'comparison', 'college', 'vs', 'metrics'],
    icon: LuScale,
    iconClass: 'bg-indigo-50 text-indigo-600',
  },
];

const SECTIONS = [
  {
    id: 'predictors',
    title: 'Predictors',
    description: 'Estimate outcomes and shortlist colleges or branches with data-backed tools.',
    toolIds: ['rank-predictor', 'college-predictor', 'branch-predictor'],
  },
  {
    id: 'fit',
    title: 'Fit tests',
    description: 'Match your preferences and goals to the right courses and campuses.',
    toolIds: ['course-fit', 'college-fit'],
  },
  {
    id: 'compare',
    title: 'Comparison',
    description: 'Evaluate institutions head-to-head before you decide.',
    toolIds: ['college-comparison'],
  },
];

const SEARCH_SUGGESTIONS = [
  'Marks to Rank Predictor',
  'College Predictor',
  'Branch Fit Test',
  'Compare Colleges',
  'CSE Colleges in Telangana',
];

function ToolCard({ tool }) {
  const Icon = tool.icon;

  return (
    <Link
      to={tool.to}
      className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2"
    >
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${tool.iconClass}`}>
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{tool.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{tool.description}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 transition group-hover:gap-2.5">
        Open tool <LuArrowRight className="h-4 w-4" aria-hidden />
      </span>
    </Link>
  );
}

function formatCapturedAt(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return '';
  }
}

export default function StudentsDashboard() {
  const navigate = useNavigate();
  const organicLead = readOrganicRankLeadSnapshot();

  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const autocompleteSuggestions = useMemo(() => {
    if (!searchTerm.trim()) return SEARCH_SUGGESTIONS;
    const query = searchTerm.toLowerCase().trim();
    return SEARCH_SUGGESTIONS.filter((s) => s.toLowerCase().includes(query));
  }, [searchTerm]);

  const filteredTools = useMemo(() => {
    if (!searchTerm.trim()) return TOOLS;
    const query = searchTerm.toLowerCase().trim();
    return TOOLS.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [searchTerm]);

  const toolsById = useMemo(() => Object.fromEntries(TOOLS.map((t) => [t.id, t])), []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <StudentWorkspaceNavbar />

      <StudentsDashboardHero
        onStartPrediction={() => navigate('/students/rank-predictor')}
        onExploreTools={() => scrollToSection('student-workspace')}
      />

      <main id="student-workspace" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {organicLead && (
          <section className="mb-10" aria-labelledby="organic-lead-heading">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">Saved on this device</p>
                  <h2 id="organic-lead-heading" className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">
                    Your rank predictor submission
                  </h2>
                  <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 sm:gap-x-8">
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Exam</dt>
                      <dd className="mt-0.5 font-medium text-slate-900">{organicLead.examName}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Score submitted</dt>
                      <dd className="mt-0.5 tabular-nums font-medium text-slate-900">{organicLead.score}</dd>
                    </div>
                    {organicLead.difficulty ? (
                      <div>
                        <dt className="text-xs font-medium text-slate-500">Difficulty</dt>
                        <dd className="mt-0.5 font-medium text-slate-900">{organicLead.difficulty}</dd>
                      </div>
                    ) : null}
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Mobile (last 4)</dt>
                      <dd className="mt-0.5 font-mono font-medium text-slate-900">···· {organicLead.phoneLast4}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">OTP</dt>
                      <dd className="mt-0.5 font-medium text-emerald-700">
                        {organicLead.otpVerified ? 'Verified' : '—'}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium text-slate-500">Captured</dt>
                      <dd className="mt-0.5 text-slate-900">{formatCapturedAt(organicLead.capturedAt) || '—'}</dd>
                    </div>
                  </dl>
                </div>
                <Link
                  to={
                    organicLead.examId
                      ? `/students/rank-predictor/${organicLead.examId}`
                      : '/students/rank-predictor'
                  }
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
                >
                  Open rank predictor <LuArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        <header className="mb-10">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Your tools</h2>
          <p className="mt-2 max-w-2xl text-slate-500">
            {searchTerm.trim()
              ? `Showing results for “${searchTerm}”`
              : 'Everything you need to plan admissions with confidence.'}
          </p>

          <div className="relative mt-6 max-w-md">
            <LuSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tools…"
              aria-label="Search workspace tools"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <LuX className="h-4 w-4" />
              </button>
            )}
            {showSuggestions && autocompleteSuggestions.length > 0 && (
              <ul className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                {autocompleteSuggestions.map((sug) => (
                  <li key={sug}>
                    <button
                      type="button"
                      onMouseDown={() => setSearchTerm(sug)}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      {sug}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </header>

        {searchTerm.trim() ? (
          <section aria-labelledby="search-results-heading">
            <div className="mb-6 flex items-baseline justify-between gap-4">
              <h3 id="search-results-heading" className="text-lg font-semibold text-slate-900">
                {filteredTools.length} result{filteredTools.length === 1 ? '' : 's'}
              </h3>
            </div>
            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                <p className="text-slate-500">No tools match your search.</p>
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Clear search
                </button>
              </div>
            )}
          </section>
        ) : (
          <div className="space-y-14">
            {SECTIONS.map((section) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`}>
                <div className="mb-6">
                  <h3 id={`${section.id}-heading`} className="text-lg font-semibold text-slate-900">
                    {section.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{section.description}</p>
                </div>
                <div
                  className={`grid grid-cols-1 gap-5 ${
                    section.toolIds.length === 1
                      ? 'max-w-md'
                      : section.toolIds.length === 2
                        ? 'sm:grid-cols-2'
                        : 'sm:grid-cols-2 lg:grid-cols-3'
                  }`}
                >
                  {section.toolIds.map((id) => (
                    <ToolCard key={id} tool={toolsById[id]} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <StudentWorkspaceFooter />
    </div>
  );
}
