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
} from 'react-icons/lu';
import StudentWorkspaceNavbar from '../components/studentDashboard/StudentWorkspaceNavbar';
import StudentWorkspaceFooter from '../components/studentDashboard/StudentWorkspaceFooter';
import StudentsDashboardHero from '../components/studentDashboard/StudentsDashboardHero';
import { readOrganicRankLeadSnapshot } from '../utils/organicRankLeadLocal';

// ----------------------------------------------------------------------------
// Reusable UI Components (Professional Neo-Brutalist)
// ----------------------------------------------------------------------------

const NeoCard = ({ children, className = '', accentColor = '' }) => {
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-[14px] border-2 border-[#0F172A] bg-white shadow-[4px_4px_0px_#0F172A] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#0F172A] ${className}`}
    >
      {accentColor && (
        <div className="h-2 w-full border-b-2 border-[#0F172A]" style={{ backgroundColor: accentColor }} />
      )}
      <div className="flex flex-1 flex-col p-6 md:p-8">{children}</div>
    </div>
  );
};

const previewInputClass =
  'w-full cursor-not-allowed bg-[#EEF2F7] border-2 border-[#0F172A]/85 rounded-[10px] px-4 py-3 text-[#94A3B8] font-medium';

const PreviewActionLink = ({ to, children, primary = true, className = '' }) => {
  const baseStyle =
    'font-bold rounded-[14px] px-6 py-3 border-2 border-[#0F172A] transition-all duration-150 flex items-center justify-center gap-2';
  const typeStyle = primary
    ? 'bg-[#c7f36b] text-[#0F172A] shadow-[4px_4px_0px_#0F172A] hover:bg-[#b0d95d] hover:-translate-y-0.5'
    : 'bg-white text-[#0F172A] shadow-[4px_4px_0px_#0F172A] hover:bg-slate-50 hover:-translate-y-0.5';
  return (
    <Link to={to} className={`${baseStyle} ${typeStyle} ${className}`}>
      {children}
    </Link>
  );
};

// ----------------------------------------------------------------------------
// Tool Components
// ----------------------------------------------------------------------------

const RankPredictor = () => {
  return (
    <NeoCard accentColor="#B7E5FF">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="mb-1 text-xl font-black tracking-tight text-[#0F172A]">Rank Predictor</h3>
          <p className="text-sm font-medium text-slate-500">Data-driven performance estimation.</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#0F172A] bg-[#B7E5FF] shadow-[2px_2px_0px_#0F172A]">
          <LuActivity className="text-lg text-[#0F172A]" />
        </div>
      </div>

      <div className="mb-auto space-y-4">
        <input className={previewInputClass} placeholder="Exam Name (e.g. JEE Main)" disabled />
        <input className={previewInputClass} placeholder="Marks Scored" disabled />
      </div>

      <PreviewActionLink to="/students/rank-predictor" className="mt-6 w-full">
        Run Analysis <LuArrowRight />
      </PreviewActionLink>
    </NeoCard>
  );
};

const CollegePredictor = () => {
  return (
    <NeoCard accentColor="#F7B5B5">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="mb-1 text-xl font-black tracking-tight text-[#0F172A]">College Predictor</h3>
          <p className="text-sm font-medium text-slate-500">Algorithmic admission mapping.</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#0F172A] bg-[#F7B5B5] shadow-[2px_2px_0px_#0F172A]">
          <LuSearch className="text-lg text-[#0F172A]" />
        </div>
      </div>

      <div className="mb-auto space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input className={previewInputClass} placeholder="Rank" disabled />
          <input className={previewInputClass} placeholder="Category" disabled />
        </div>
        <input className={previewInputClass} placeholder="State Preference" disabled />
      </div>

      <PreviewActionLink to="/students/predictors" className="mt-6 w-full">
        Generate Matches <LuMapPin />
      </PreviewActionLink>
    </NeoCard>
  );
};

const BranchPredictor = () => {
  return (
    <NeoCard accentColor="#c7f36b">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="mb-1 text-xl font-black tracking-tight text-[#0F172A]">Branch Predictor</h3>
          <p className="text-sm font-medium text-slate-500">Verify specific academic pathways.</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#0F172A] bg-[#c7f36b] shadow-[2px_2px_0px_#0F172A]">
          <LuRocket className="text-lg text-[#0F172A]" />
        </div>
      </div>

      <div className="mb-auto space-y-4">
        <input className={previewInputClass} placeholder="Institution Name" disabled />
        <input className={previewInputClass} placeholder="Current Rank" disabled />
      </div>

      <PreviewActionLink to="/students/predictors" className="mt-6 w-full">
        Analyze Branches <LuBookOpen />
      </PreviewActionLink>
    </NeoCard>
  );
};

const CourseFitTest = () => {
  return (
    <NeoCard accentColor="#c7f36b">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="mb-1 text-xl font-black tracking-tight text-[#0F172A]">Course Fit Test</h3>
          <p className="text-sm font-medium text-slate-500">Behavioral alignment assessment.</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#0F172A] bg-[#c7f36b] shadow-[2px_2px_0px_#0F172A]">
          <LuGraduationCap className="text-lg text-[#0F172A]" />
        </div>
      </div>

      <div className="mb-auto">
        <div className="mb-4 flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full border-2 border-[#0F172A] ${i === 0 ? 'bg-[#c7f36b]' : 'bg-slate-100'}`}
            />
          ))}
        </div>
        <div className="flex min-h-[100px] items-center justify-center rounded-[10px] border-2 border-[#0F172A] bg-white p-4 text-center shadow-[2px_2px_0px_#0F172A] sm:min-h-[120px] sm:p-5">
          <p className="text-sm font-bold text-[#0F172A]">
            &quot;I prefer solving mathematical equations over writing essays.&quot;
          </p>
        </div>
        <PreviewActionLink to="/students/tests" className="mt-6 w-full">
          Start Test <LuArrowRight />
        </PreviewActionLink>
      </div>
    </NeoCard>
  );
};

const CollegeFitTest = () => {
  return (
    <NeoCard accentColor="#B7E5FF">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="mb-1 text-xl font-black tracking-tight text-[#0F172A]">Culture Fit</h3>
          <p className="text-sm font-medium text-slate-500">Find campuses matching your lifestyle.</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#0F172A] bg-[#B7E5FF] shadow-[2px_2px_0px_#0F172A]">
          <LuMapPin className="text-lg text-[#0F172A]" />
        </div>
      </div>

      <div className="mb-auto space-y-4">
        <select
          disabled
          className="w-full appearance-none rounded-[10px] border-2 border-[#0F172A] bg-[#F8FAFC] px-4 py-3 text-sm font-bold text-[#94A3B8]"
        >
          <option value="">Select Fee Budget</option>
          <option value="low">&lt; 10 Lakhs Total</option>
          <option value="high">10 - 20 Lakhs Total</option>
        </select>
        <select
          disabled
          className="w-full appearance-none rounded-[10px] border-2 border-[#0F172A] bg-[#F8FAFC] px-4 py-3 text-sm font-bold text-[#94A3B8]"
        >
          <option value="">Select Campus Size</option>
          <option value="large">Large (100+ Acres)</option>
          <option value="small">Boutique & Urban</option>
        </select>
      </div>

      <PreviewActionLink to="/students/tests" className="mt-6 w-full">
        Process Criteria
      </PreviewActionLink>
    </NeoCard>
  );
};

const CollegeComparison = () => {
  return (
    <NeoCard accentColor="#c7f36b">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="mb-1 text-xl font-black tracking-tight text-[#0F172A]">Comparative Analysis</h3>
          <p className="text-sm font-medium text-slate-500">Head-to-head metric evaluation.</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#0F172A] bg-[#c7f36b] shadow-[2px_2px_0px_#0F172A]">
          <LuScale className="text-lg text-[#0F172A]" />
        </div>
      </div>

      <div className="mb-auto space-y-3">
        <input className={previewInputClass} placeholder="Institution A" disabled />
        <div className="w-12 rounded border-2 border-slate-200 bg-[#F8FAFC] py-1 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
          VS
        </div>
        <input className={previewInputClass} placeholder="Institution B" disabled />
      </div>

      <PreviewActionLink to="/students/college-comparison" className="mt-6 w-full">
        Run Comparison
      </PreviewActionLink>
    </NeoCard>
  );
};

// ----------------------------------------------------------------------------
// Tools Registry for Dynamic Search & Rendering
// ----------------------------------------------------------------------------

const TOOLS_REGISTRY = [
  {
    id: 'rank-predictor',
    title: 'Rank Predictor',
    category: 'predictors',
    tags: ['rank', 'predictor', 'jee', 'marks', 'exam', 'score'],
    component: <RankPredictor />
  },
  {
    id: 'college-predictor',
    title: 'College Predictor',
    category: 'predictors',
    tags: ['college', 'predictor', 'admission', 'cutoff', 'matches', 'state', 'category'],
    component: <CollegePredictor />
  },
  {
    id: 'branch-predictor',
    title: 'Branch Predictor',
    category: 'predictors',
    tags: ['branch', 'predictor', 'academic', 'pathway', 'iit', 'nit', 'seat'],
    component: <BranchPredictor />
  },
  {
    id: 'course-fit',
    title: 'Course Fit Test',
    category: 'fit',
    tags: ['course', 'fit', 'test', 'career', 'interest', 'subject'],
    component: <CourseFitTest />
  },
  {
    id: 'college-fit',
    title: 'Culture Fit Test',
    category: 'fit',
    tags: ['culture', 'college', 'fit', 'test', 'budget', 'campus', 'fees'],
    component: <CollegeFitTest />
  },
  {
    id: 'college-comparison',
    title: 'Comparative Analysis',
    category: 'compare',
    tags: ['compare', 'comparison', 'college', 'vs', 'metrics'],
    component: <CollegeComparison />
  }
];

// ----------------------------------------------------------------------------
// Main Page Layout
// ----------------------------------------------------------------------------

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

const SEARCH_SUGGESTIONS = [
  'Marks to Rank Predictor',
  'College Predictor',
  'Branch Fit Test',
  'Compare Colleges',
  'CSE Colleges in Telangana'
];

export default function StudentsDashboard() {
  const navigate = useNavigate();
  const organicLead = readOrganicRankLeadSnapshot();

  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Filter autocomplete suggestions
  const autocompleteSuggestions = useMemo(() => {
    if (!searchTerm.trim()) return SEARCH_SUGGESTIONS;
    const query = searchTerm.toLowerCase().trim();
    return SEARCH_SUGGESTIONS.filter((s) => s.toLowerCase().includes(query));
  }, [searchTerm]);

  // Filter tools reactively based on search term
  const filteredTools = useMemo(() => {
    if (!searchTerm.trim()) return TOOLS_REGISTRY;
    const query = searchTerm.toLowerCase().trim();
    return TOOLS_REGISTRY.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-[#c7f36b] selection:text-[#0F172A]">
      <StudentWorkspaceNavbar />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .sd-section-dots {
          background-image: radial-gradient(rgba(15, 23, 42, 0.07) 1px, transparent 1px);
          background-size: 16px 16px;
        }
        .sd-section-diagonal {
          background-image: repeating-linear-gradient(
            -12deg,
            transparent,
            transparent 10px,
            rgba(15, 23, 42, 0.04) 10px,
            rgba(15, 23, 42, 0.04) 11px
          );
          background-size: auto;
        }
      `}</style>

      <div className="overflow-x-hidden">
        <StudentsDashboardHero
          onStartPrediction={() => navigate('/students/rank-predictor')}
          onExploreTools={() => scrollToSection('student-workspace')}
        />

        <div id="student-workspace" className="w-full">
          <div className="mx-auto max-w-[1600px] lg:px-6 xl:px-8">
            {organicLead && (
              <section
                className="min-w-0 px-4 pb-0 pt-12 sm:px-6 sm:pt-14 lg:px-6 lg:pl-12 lg:pr-6 lg:pt-16"
                aria-labelledby="organic-lead-heading"
              >
                <NeoCard accentColor="#c7f36b">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">Saved on this device</p>
                      <h2 id="organic-lead-heading" className="text-xl font-black tracking-tight text-[#0F172A] sm:text-2xl">
                        Your rank predictor submission
                      </h2>
                      <dl className="mt-4 grid gap-2 text-sm font-medium text-slate-600 sm:grid-cols-2 sm:gap-x-8">
                        <div>
                          <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Exam</dt>
                          <dd className="font-bold text-[#0F172A]">{organicLead.examName}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Score submitted</dt>
                          <dd className="tabular-nums font-bold text-[#0F172A]">{organicLead.score}</dd>
                        </div>
                        {organicLead.difficulty ? (
                          <div>
                            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Difficulty</dt>
                            <dd className="font-bold text-[#0F172A]">{organicLead.difficulty}</dd>
                          </div>
                        ) : null}
                        <div>
                          <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Mobile (last 4)</dt>
                          <dd className="font-mono font-bold text-[#0F172A]">···· {organicLead.phoneLast4}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">OTP</dt>
                          <dd className="font-bold text-emerald-800">{organicLead.otpVerified ? 'Verified' : '—'}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Captured</dt>
                          <dd className="text-[#0F172A]">{formatCapturedAt(organicLead.capturedAt) || '—'}</dd>
                        </div>
                      </dl>
                    </div>
                    <PreviewActionLink
                      to={organicLead.examId ? `/students/rank-predictor/${organicLead.examId}` : '/students/rank-predictor'}
                      className="shrink-0 md:mt-0"
                    >
                      Open rank predictor <LuArrowRight />
                    </PreviewActionLink>
                  </div>
                </NeoCard>
              </section>
            )}

            <section
              className="min-w-0 px-4 pt-12 pb-6 sm:px-6 sm:pt-14 sm:pb-8 lg:px-6 lg:pl-12 lg:pr-6 lg:pt-16 lg:pb-10"
              aria-labelledby="workspace-applications-heading"
            >
              <div
                id="workspace-applications"
                className="mb-10 rounded-[14px] border-2 border-[#0F172A] bg-white/95 px-5 py-4 shadow-[4px_4px_0px_#0F172A] sm:px-6 sm:py-5 md:mb-12"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  <div className="min-w-0 flex-1">
                    <h2 id="workspace-applications-heading" className="mb-2 text-2xl font-black tracking-tighter text-[#0F172A] sm:text-3xl">
                      Workspace Applications
                    </h2>
                    <p className="font-medium text-slate-500">
                      {searchTerm.trim()
                        ? `Filtered analysis tools matching "${searchTerm}"`
                        : 'Select a tool to begin your analysis.'}
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-[280px] md:max-w-[360px]">
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <LuSearch className="h-5 w-5 text-slate-400" aria-hidden />
                      </div>
                      <input
                        type="search"
                        value={searchTerm}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => {
                          setTimeout(() => setShowSuggestions(false), 200);
                        }}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search tools, colleges, branches..."
                        aria-label="Search workspace tools"
                        className="w-full rounded-[10px] border-2 border-black bg-white py-2.5 pl-10 pr-9 text-sm font-bold text-[#0F172A] placeholder-slate-400 shadow-[2px_2px_0_0_#0F172A] outline-none focus:shadow-[4px_4px_0_0_#c7f36b]"
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm('')}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-black"
                          aria-label="Clear search"
                        >
                          ✕
                        </button>
                      )}
                      {showSuggestions && autocompleteSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full z-[100] mt-1 overflow-hidden rounded-[10px] border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
                          <ul className="m-0 list-none p-0">
                            {autocompleteSuggestions.map((sug, idx) => (
                              <li key={idx} className="border-b border-black/10 last:border-0">
                                <button
                                  type="button"
                                  onMouseDown={() => setSearchTerm(sug)}
                                  className="w-full cursor-pointer px-4 py-2.5 text-left text-xs font-bold text-[#0F172A] transition-colors hover:bg-[#c7f36b]/35"
                                >
                                  {sug}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <span className="rounded-md border-2 border-[#0F172A] bg-white px-3 py-1 text-center text-xs font-bold shadow-[2px_2px_0px_#0F172A] md:text-left">
                      {filteredTools.length} of 6 tools
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div id="tool-grid" className="w-full space-y-0">
            {searchTerm.trim() ? (
              /* Search results grid */
              <div className="w-full border-t-2 border-[#0F172A] bg-slate-50 py-12 md:py-16">
                <div className="mx-auto max-w-[1600px] lg:px-6 xl:px-8">
                  <div className="min-w-0 px-4 sm:px-6 lg:pl-12 lg:pr-6">
                    <section aria-labelledby="search-results-heading">
                      <div className="mb-6 flex flex-col gap-2 sm:mb-8">
                        <h3 id="search-results-heading" className="text-2xl font-black tracking-tight text-[#0F172A]">
                          Search Results ({filteredTools.length})
                        </h3>
                        <p className="max-w-2xl text-sm font-medium text-slate-500 sm:text-base">
                          Showing tools matching your query &quot;{searchTerm}&quot;.
                        </p>
                      </div>
                      {filteredTools.length > 0 ? (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                          {filteredTools.map((t) => (
                            <div key={t.id} className="h-full flex flex-col animate-fade-in">
                              {t.component}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-[14px] border-2 border-dashed border-slate-300 bg-white p-12 text-center shadow-[4px_4px_0_0_#000] animate-fade-in">
                          <p className="text-lg font-bold text-slate-500 mb-4">No tools found matching your query.</p>
                          <button
                            onClick={() => setSearchTerm('')}
                            className="rounded-[10px] border-2 border-black bg-[#c7f36b] px-4 py-2.5 text-xs font-bold shadow-[3px_3px_0px_#000] hover:bg-[#b0d95d] active:shadow-[0px_0px_0px_#000] active:translate-y-[3px] active:translate-x-[3px] transition-all cursor-pointer"
                            type="button"
                          >
                            Reset Search Filter
                          </button>
                        </div>
                      )}
                    </section>
                  </div>
                </div>
              </div>
            ) : (
              /* Default Categorized Grid Sections */
              <>
                <div className="w-full border-t-2 border-[#0F172A] bg-[#F4FCE8] py-12 md:py-16">
                  <div className="mx-auto max-w-[1600px] lg:px-6 xl:px-8">
                    <div className="min-w-0 px-4 sm:px-6 lg:pl-12 lg:pr-6">
                      <section aria-labelledby="predictor-tools-heading">
                        <div className="mb-6 flex flex-col gap-2 sm:mb-8">
                          <h3 id="predictor-tools-heading" className="text-2xl font-black tracking-tight text-[#0F172A]">
                            Predictors
                          </h3>
                          <p className="max-w-2xl text-sm font-medium text-slate-500 sm:text-base">
                            Estimate rank outcomes and shortlist colleges or branches with data-backed prediction tools.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                          <RankPredictor />
                          <CollegePredictor />
                          <BranchPredictor />
                        </div>
                      </section>
                    </div>
                  </div>
                </div>

                <div className="sd-section-dots w-full bg-[#EEF6FF] py-12 md:py-16">
                  <div className="mx-auto max-w-[1600px] lg:px-6 xl:px-8">
                    <div className="min-w-0 px-4 sm:px-6 lg:pl-12 lg:pr-6">
                      <section aria-labelledby="fit-tools-heading">
                        <div className="mb-6 flex flex-col gap-2 sm:mb-8">
                          <h3 id="fit-tools-heading" className="text-2xl font-black tracking-tight text-[#0F172A]">
                            Fit Tests
                          </h3>
                          <p className="max-w-2xl text-sm font-medium text-slate-500 sm:text-base">
                            Discover courses and campuses that match your preferences, behavior, and long-term goals.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                          <CourseFitTest />
                          <CollegeFitTest />
                        </div>
                      </section>
                    </div>
                  </div>
                </div>

                <div className="sd-section-diagonal w-full border-y-2 border-[#0F172A]/10 bg-[#FFF8E8] py-12 md:py-16">
                  <div className="mx-auto max-w-[1600px] lg:px-6 xl:px-8">
                    <div className="min-w-0 px-4 sm:px-6 lg:pl-12 lg:pr-6">
                      <section aria-labelledby="comparison-tools-heading">
                        <div className="mb-6 flex flex-col gap-2 sm:mb-8">
                          <h3 id="comparison-tools-heading" className="text-2xl font-black tracking-tight text-[#0F172A]">
                            Comparison
                          </h3>
                          <p className="max-w-2xl text-sm font-medium text-slate-500 sm:text-base">
                            Compare institutions side-by-side to make confident admission decisions.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-8">
                          <CollegeComparison />
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <StudentWorkspaceFooter />
    </div>
  );
}


