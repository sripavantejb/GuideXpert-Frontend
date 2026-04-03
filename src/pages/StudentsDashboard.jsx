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
  LuTerminal,
} from 'react-icons/lu';
import StudentWorkspaceNavbar from '../components/studentDashboard/StudentWorkspaceNavbar';
import StickyToolsSidebar from '../components/studentDashboard/StickyToolsSidebar';

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

const NeoButton = ({ children, primary = false, className = '', onClick }) => {
  const baseStyle =
    'font-bold rounded-[14px] px-6 py-3 border-2 border-[#0F172A] transition-all duration-150 flex items-center justify-center gap-2';
  const typeStyle = primary
    ? 'bg-[#C7F36B] text-[#0F172A] shadow-[4px_4px_0px_#0F172A] hover:bg-[#b0d95d] active:shadow-[0px_0px_0px_#0F172A] active:translate-y-[4px] active:translate-x-[4px]'
    : 'bg-white text-[#0F172A] shadow-[4px_4px_0px_#0F172A] hover:bg-slate-50 active:shadow-[0px_0px_0px_#0F172A] active:translate-y-[4px] active:translate-x-[4px]';

  return (
    <button type="button" className={`${baseStyle} ${typeStyle} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

const previewInputClass =
  'w-full cursor-not-allowed bg-[#EEF2F7] border-2 border-[#0F172A]/85 rounded-[10px] px-4 py-3 text-[#94A3B8] font-medium';

const PreviewActionLink = ({ to, children, primary = true, className = '' }) => {
  const baseStyle =
    'font-bold rounded-[14px] px-6 py-3 border-2 border-[#0F172A] transition-all duration-150 flex items-center justify-center gap-2';
  const typeStyle = primary
    ? 'bg-[#C7F36B] text-[#0F172A] shadow-[4px_4px_0px_#0F172A] hover:bg-[#b0d95d] hover:-translate-y-0.5'
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

      <PreviewActionLink to="/students/predictors" className="mt-6 w-full">
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
        <div className="grid grid-cols-2 gap-4">
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
    <NeoCard accentColor="#FFE89A">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="mb-1 text-xl font-black tracking-tight text-[#0F172A]">Branch Predictor</h3>
          <p className="text-sm font-medium text-slate-500">Verify specific academic pathways.</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#0F172A] bg-[#FFE89A] shadow-[2px_2px_0px_#0F172A]">
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
    <NeoCard accentColor="#C7F36B">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="mb-1 text-xl font-black tracking-tight text-[#0F172A]">Course Fit Test</h3>
          <p className="text-sm font-medium text-slate-500">Behavioral alignment assessment.</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#0F172A] bg-[#C7F36B] shadow-[2px_2px_0px_#0F172A]">
          <LuGraduationCap className="text-lg text-[#0F172A]" />
        </div>
      </div>

      <div className="mb-auto">
        <div className="mb-4 flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full border-2 border-[#0F172A] ${i === 0 ? 'bg-[#C7F36B]' : 'bg-slate-100'}`}
            />
          ))}
        </div>
        <div className="flex h-[120px] items-center justify-center rounded-[10px] border-2 border-[#0F172A] bg-white p-5 text-center shadow-[2px_2px_0px_#0F172A]">
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
    <NeoCard accentColor="#FFE89A" className="md:col-span-2 lg:col-span-1">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="mb-1 text-xl font-black tracking-tight text-[#0F172A]">Comparative Analysis</h3>
          <p className="text-sm font-medium text-slate-500">Head-to-head metric evaluation.</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#0F172A] bg-[#FFE89A] shadow-[2px_2px_0px_#0F172A]">
          <LuScale className="text-lg text-[#0F172A]" />
        </div>
      </div>

      <div className="mb-auto space-y-3">
        <input className={previewInputClass} placeholder="Institution A" disabled />
        <div className="mx-auto w-12 rounded border-2 border-slate-200 bg-[#F8FAFC] py-1 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
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
// Main Page Layout
// ----------------------------------------------------------------------------

export default function StudentsDashboard() {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-[#C7F36B] selection:text-[#0F172A]">
      <StudentWorkspaceNavbar />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .blueprint-grid {
          background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
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
        }
      `}</style>

      <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center overflow-hidden border-b-[6px] border-[#0F172A] bg-[#0F172A] px-6 py-12 lg:px-12">
        <div className="blueprint-grid absolute inset-0 z-0" />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-12 lg:flex-row lg:items-center lg:gap-14">
          <div className="flex-1 lg:max-w-[560px]">
            <div className="mb-8 inline-flex items-center gap-2 rounded-md border border-slate-700 bg-[#1E293B] px-3 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#C7F36B]" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-300">
                System Operational v2.4
              </span>
            </div>

            <h1 className="mb-6 text-5xl font-black leading-[1.02] tracking-tighter text-white lg:text-7xl">
              Student<br />
              <span className="text-[#C7F36B]">Intelligence</span>
              <br />
              Platform.
            </h1>

            <p className="mb-10 max-w-xl text-base font-medium leading-relaxed text-slate-400 sm:text-lg">
              Professional-grade admission analytics. Predict ranks, evaluate institutions, and optimize your academic
              trajectory with precision data.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <NeoButton
                primary
                className="hover:-translate-y-1 px-8 text-sm sm:min-w-[250px]"
                onClick={() => navigate('/students/rank-predictor')}
              >
                Initialize rank prediction
              </NeoButton>
              <NeoButton
                className="border-slate-300 bg-white px-8 text-sm text-[#0F172A] shadow-[4px_4px_0px_#0F172A] hover:bg-slate-100 active:shadow-[0px_0px_0px_#0F172A] sm:min-w-[230px]"
                onClick={() => scrollToSection('tool-grid')}
              >
                Browse predictors & fit tests <LuArrowRight />
              </NeoButton>
            </div>
          </div>

          <div className="w-full flex-1 lg:pl-4">
            <div className="mx-auto w-full max-w-[620px] overflow-hidden rounded-[14px] border-2 border-[#0F172A] bg-white shadow-[8px_8px_0px_#C7F36B]">
              <div className="flex items-center gap-2 border-b-2 border-[#0F172A] bg-[#0F172A] px-4 py-3">
                <div className="h-3 w-3 rounded-full border border-[#0F172A] bg-[#F7B5B5]" />
                <div className="h-3 w-3 rounded-full border border-[#0F172A] bg-[#FFE89A]" />
                <div className="h-3 w-3 rounded-full border border-[#0F172A] bg-[#C7F36B]" />
                <div className="ml-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-slate-400">
                  <LuTerminal /> Session Active
                </div>
              </div>

              <div className="p-6 sm:p-7 lg:p-8">
                <div className="mb-7">
                  <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">Global Standing Estimate</p>
                  <h3 className="font-mono text-3xl font-black tracking-tighter text-[#0F172A] sm:text-4xl">
                    12,430 <span className="text-lg text-[#C7F36B]">▲</span>
                  </h3>
                </div>

                <div className="space-y-5">
                  <div>
                    <div className="mb-2 flex justify-between text-sm font-bold">
                      <span className="text-[#0F172A]">Target Match Percentile</span>
                      <span className="font-mono text-[#0F172A]">96.2%</span>
                    </div>
                    <div className="flex h-3 w-full overflow-hidden rounded-full border-2 border-[#0F172A] bg-slate-100">
                      <div className="h-full w-[96.2%] bg-[#0F172A]" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between text-sm font-bold">
                      <span className="text-[#0F172A]">Profile Completion</span>
                      <span className="font-mono text-[#0F172A]">80.0%</span>
                    </div>
                    <div className="flex h-3 w-full overflow-hidden rounded-full border-2 border-[#0F172A] bg-slate-100">
                      <div className="h-full w-[80%] border-r-2 border-[#0F172A] bg-[#B7E5FF]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workspace: sidebar is sticky only within this block (after hero), aligned with Workspace Applications */}
      <div id="student-workspace" className="w-full">
        <div className="mx-auto max-w-[1600px] lg:px-6 xl:px-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">
            <section
              className="order-2 min-w-0 flex-1 px-6 py-24 lg:order-1 lg:max-w-none lg:px-6 lg:pl-12 lg:pr-0"
              aria-labelledby="workspace-applications-heading"
            >
              <div
                id="workspace-applications"
                className="mb-10 rounded-[14px] border-2 border-[#0F172A] bg-white/95 px-5 py-4 shadow-[4px_4px_0px_#0F172A] sm:px-6 sm:py-5 md:mb-12"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 id="workspace-applications-heading" className="mb-2 text-3xl font-black tracking-tighter text-[#0F172A]">
                      Workspace Applications
                    </h2>
                    <p className="font-medium text-slate-500">Select a tool to begin your analysis.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="rounded-md border-2 border-[#0F172A] bg-white px-3 py-1 text-xs font-bold shadow-[2px_2px_0px_#0F172A]">
                      6 Tools Loaded
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <div className="order-1 w-full shrink-0 lg:order-2 lg:w-[236px] lg:pt-24 lg:pr-2">
              <StickyToolsSidebar />
            </div>
          </div>
        </div>

        {/* Full viewport-width bands; inner row mirrors max-w + sidebar column so grids keep the same width as before */}
        <div id="tool-grid" className="w-full space-y-0">
          <div className="w-full border-t-2 border-[#0F172A] bg-[#F4FCE8] py-12 md:py-16">
            <div className="mx-auto flex max-w-[1600px] lg:gap-8 lg:px-6 xl:px-8">
              <div className="min-w-0 flex-1 px-6 lg:pl-12 lg:pr-6">
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
              <div className="hidden w-[236px] shrink-0 lg:block" aria-hidden />
            </div>
          </div>

          <div className="sd-section-dots w-full bg-[#EEF6FF] py-12 md:py-16">
            <div className="mx-auto flex max-w-[1600px] lg:gap-8 lg:px-6 xl:px-8">
              <div className="min-w-0 flex-1 px-6 lg:pl-12 lg:pr-6">
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
              <div className="hidden w-[236px] shrink-0 lg:block" aria-hidden />
            </div>
          </div>

          <div className="sd-section-diagonal w-full border-y-2 border-[#0F172A]/10 bg-[#FFF8E8] py-12 md:py-16">
            <div className="mx-auto flex max-w-[1600px] lg:gap-8 lg:px-6 xl:px-8">
              <div className="min-w-0 flex-1 px-6 lg:pl-12 lg:pr-6">
                <section aria-labelledby="comparison-tools-heading">
                  <div className="mb-6 flex flex-col gap-2 sm:mb-8">
                    <h3 id="comparison-tools-heading" className="text-2xl font-black tracking-tight text-[#0F172A]">
                      Comparison
                    </h3>
                    <p className="max-w-2xl text-sm font-medium text-slate-500 sm:text-base">
                      Compare institutions side-by-side to make confident admission decisions.
                    </p>
                  </div>
                  <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8">
                    <CollegeComparison />
                  </div>
                </section>
              </div>
              <div className="hidden w-[236px] shrink-0 lg:block" aria-hidden />
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
