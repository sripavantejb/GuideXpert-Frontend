import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LuRocket, LuTrophy, LuSearch, LuBookOpen, LuMapPin, LuScale, 
  LuArrowRight, LuSparkles, LuGraduationCap, LuActivity, LuTerminal
} from 'react-icons/lu';

// ----------------------------------------------------------------------------
// Reusable UI Components (Professional Neo-Brutalist)
// ----------------------------------------------------------------------------

const NeoCard = ({ children, className = '', accentColor = '' }) => {
  return (
    <div className={`relative bg-white border-2 border-[#0F172A] rounded-[14px] shadow-[4px_4px_0px_#0F172A] overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#0F172A] flex flex-col ${className}`}>
      {/* Clean SaaS-style accent strip at the top */}
      {accentColor && (
        <div className="h-2 w-full border-b-2 border-[#0F172A]" style={{ backgroundColor: accentColor }}></div>
      )}
      <div className="p-6 md:p-8 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};

const NeoButton = ({ children, primary = false, className = '', onClick }) => {
  const baseStyle = "font-bold rounded-[14px] px-6 py-3 border-2 border-[#0F172A] transition-all duration-150 flex items-center justify-center gap-2";
  const typeStyle = primary 
    ? "bg-[#C7F36B] text-[#0F172A] shadow-[4px_4px_0px_#0F172A] hover:bg-[#b0d95d] active:shadow-[0px_0px_0px_#0F172A] active:translate-y-[4px] active:translate-x-[4px]" 
    : "bg-white text-[#0F172A] shadow-[4px_4px_0px_#0F172A] hover:bg-slate-50 active:shadow-[0px_0px_0px_#0F172A] active:translate-y-[4px] active:translate-x-[4px]";
  
  return (
    <button className={`${baseStyle} ${typeStyle} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

const previewInputClass =
  'w-full cursor-not-allowed bg-[#EEF2F7] border-2 border-[#0F172A]/85 rounded-[10px] px-4 py-3 text-[#94A3B8] font-medium';

const PreviewActionLink = ({ to, children, primary = true, className = '' }) => {
  const baseStyle = 'font-bold rounded-[14px] px-6 py-3 border-2 border-[#0F172A] transition-all duration-150 flex items-center justify-center gap-2';
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
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-[#0F172A] tracking-tight mb-1">Rank Predictor</h3>
          <p className="text-slate-500 text-sm font-medium">Data-driven performance estimation.</p>
        </div>
        <div className="w-10 h-10 bg-[#B7E5FF] border-2 border-[#0F172A] rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#0F172A]">
          <LuActivity className="text-lg text-[#0F172A]" />
        </div>
      </div>
      
      <div className="space-y-4 mb-auto">
        <input className={previewInputClass} placeholder="Exam Name (e.g. JEE Main)" disabled />
        <input className={previewInputClass} placeholder="Marks Scored" disabled />
      </div>
      
      <PreviewActionLink to="/students/predictors" className="w-full mt-6">
        Run Analysis <LuArrowRight />
      </PreviewActionLink>
    </NeoCard>
  );
};

const CollegePredictor = () => {
  return (
    <NeoCard accentColor="#F7B5B5">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-[#0F172A] tracking-tight mb-1">College Predictor</h3>
          <p className="text-slate-500 text-sm font-medium">Algorithmic admission mapping.</p>
        </div>
        <div className="w-10 h-10 bg-[#F7B5B5] border-2 border-[#0F172A] rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#0F172A]">
          <LuSearch className="text-lg text-[#0F172A]" />
        </div>
      </div>
      
      <div className="space-y-4 mb-auto">
        <div className="grid grid-cols-2 gap-4">
          <input className={previewInputClass} placeholder="Rank" disabled />
          <input className={previewInputClass} placeholder="Category" disabled />
        </div>
        <input className={previewInputClass} placeholder="State Preference" disabled />
      </div>

      <PreviewActionLink to="/students/predictors" className="w-full mt-6">
        Generate Matches <LuMapPin />
      </PreviewActionLink>
    </NeoCard>
  );
};

const BranchPredictor = () => {
  return (
    <NeoCard accentColor="#FFE89A">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-[#0F172A] tracking-tight mb-1">Branch Predictor</h3>
          <p className="text-slate-500 text-sm font-medium">Verify specific academic pathways.</p>
        </div>
        <div className="w-10 h-10 bg-[#FFE89A] border-2 border-[#0F172A] rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#0F172A]">
          <LuRocket className="text-lg text-[#0F172A]" />
        </div>
      </div>
      
      <div className="space-y-4 mb-auto">
        <input className={previewInputClass} placeholder="Institution Name" disabled />
        <input className={previewInputClass} placeholder="Current Rank" disabled />
      </div>

      <PreviewActionLink to="/students/predictors" className="w-full mt-6">
        Analyze Branches <LuBookOpen />
      </PreviewActionLink>
    </NeoCard>
  );
};

const CourseFitTest = () => {
  return (
    <NeoCard accentColor="#C7F36B">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-[#0F172A] tracking-tight mb-1">Course Fit Test</h3>
          <p className="text-slate-500 text-sm font-medium">Behavioral alignment assessment.</p>
        </div>
        <div className="w-10 h-10 bg-[#C7F36B] border-2 border-[#0F172A] rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#0F172A]">
          <LuGraduationCap className="text-lg text-[#0F172A]" />
        </div>
      </div>
      
      <div className="mb-auto">
        <div className="flex gap-1 mb-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-2 flex-1 border-2 border-[#0F172A] rounded-full ${i === 0 ? 'bg-[#C7F36B]' : 'bg-slate-100'}`} />
          ))}
        </div>
        <div className="p-5 border-2 border-[#0F172A] rounded-[10px] bg-white shadow-[2px_2px_0px_#0F172A] h-[120px] flex items-center justify-center text-center">
          <p className="font-bold text-[#0F172A] text-sm">"I prefer solving mathematical equations over writing essays."</p>
        </div>
        <PreviewActionLink to="/students/tests" className="w-full mt-6">
          Start Test <LuArrowRight />
        </PreviewActionLink>
      </div>
    </NeoCard>
  );
};

const CollegeFitTest = () => {
  return (
    <NeoCard accentColor="#B7E5FF">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-[#0F172A] tracking-tight mb-1">Culture Fit</h3>
          <p className="text-slate-500 text-sm font-medium">Find campuses matching your lifestyle.</p>
        </div>
        <div className="w-10 h-10 bg-[#B7E5FF] border-2 border-[#0F172A] rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#0F172A]">
          <LuMapPin className="text-lg text-[#0F172A]" />
        </div>
      </div>
      
      <div className="space-y-4 mb-auto">
        <select disabled className="w-full bg-[#F8FAFC] border-2 border-[#0F172A] rounded-[10px] px-4 py-3 text-sm font-bold text-[#94A3B8] appearance-none">
          <option value="">Select Fee Budget</option>
          <option value="low">&lt; 10 Lakhs Total</option>
          <option value="high">10 - 20 Lakhs Total</option>
        </select>
        <select disabled className="w-full bg-[#F8FAFC] border-2 border-[#0F172A] rounded-[10px] px-4 py-3 text-sm font-bold text-[#94A3B8] appearance-none">
          <option value="">Select Campus Size</option>
          <option value="large">Large (100+ Acres)</option>
          <option value="small">Boutique & Urban</option>
        </select>
      </div>

      <PreviewActionLink to="/students/tests" className="w-full mt-6">Process Criteria</PreviewActionLink>
    </NeoCard>
  );
};

const CollegeComparison = () => {
  return (
    <NeoCard accentColor="#FFE89A" className="md:col-span-2 lg:col-span-1">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-[#0F172A] tracking-tight mb-1">Comparative Analysis</h3>
          <p className="text-slate-500 text-sm font-medium">Head-to-head metric evaluation.</p>
        </div>
        <div className="w-10 h-10 bg-[#FFE89A] border-2 border-[#0F172A] rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#0F172A]">
          <LuScale className="text-lg text-[#0F172A]" />
        </div>
      </div>
      
      <div className="space-y-3 mb-auto">
        <input className={previewInputClass} placeholder="Institution A" disabled />
        <div className="text-center font-black text-[10px] uppercase text-slate-400 tracking-widest bg-[#F8FAFC] border-2 border-slate-200 py-1 rounded w-12 mx-auto">VS</div>
        <input className={previewInputClass} placeholder="Institution B" disabled />
      </div>

      <PreviewActionLink to="/students/college-comparison" className="w-full mt-6">Run Comparison</PreviewActionLink>
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
      <style>{`
        /* Professional Clean Animations */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        /* Blueprint Grid */
        .blueprint-grid {
          background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center overflow-hidden border-b-[6px] border-[#0F172A] bg-[#0F172A] px-6 py-12 lg:px-12">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 blueprint-grid z-0"></div>

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-12 lg:flex-row lg:items-center lg:gap-14">
          <div className="flex-1 lg:max-w-[560px]">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1E293B] border border-slate-700 rounded-md mb-8">
              <span className="w-2 h-2 rounded-full bg-[#C7F36B] animate-pulse"></span>
              <span className="text-slate-300 font-mono text-[10px] uppercase tracking-widest">System Operational v2.4</span>
            </div>
            
            <h1 className="mb-6 text-5xl font-black leading-[1.02] tracking-tighter text-white lg:text-7xl">
              Student<br/>
              <span className="text-[#C7F36B]">Intelligence</span><br/>
              Platform.
            </h1>
            
            <p className="mb-10 max-w-xl text-base font-medium leading-relaxed text-slate-400 sm:text-lg">
              Professional-grade admission analytics. Predict ranks, evaluate institutions, and optimize your academic trajectory with precision data.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <NeoButton
                primary
                className="text-sm px-8 hover:-translate-y-1 sm:min-w-[250px]"
                onClick={() => navigate('/students/rank-predictor')}
              >
                Initialize rank prediction
              </NeoButton>
              <NeoButton
                className="text-sm px-8 bg-white text-[#0F172A] border-slate-300 hover:bg-slate-100 shadow-[4px_4px_0px_#0F172A] active:shadow-[0px_0px_0px_#0F172A] sm:min-w-[230px]"
                onClick={() => scrollToSection('tool-grid')}
              >
                Browse predictors & fit tests <LuArrowRight />
              </NeoButton>
            </div>
          </div>

          <div className="w-full flex-1 lg:pl-4">
            {/* Tech-SaaS Hero Card */}
            <div className="mx-auto w-full max-w-[620px] overflow-hidden rounded-[14px] border-2 border-[#0F172A] bg-white shadow-[8px_8px_0px_#C7F36B]">
              {/* Card Header (Mac OS Style terminal header) */}
              <div className="bg-[#0F172A] px-4 py-3 flex gap-2 items-center border-b-2 border-[#0F172A]">
                <div className="w-3 h-3 rounded-full bg-[#F7B5B5] border border-[#0F172A]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFE89A] border border-[#0F172A]"></div>
                <div className="w-3 h-3 rounded-full bg-[#C7F36B] border border-[#0F172A]"></div>
                <div className="ml-4 text-[10px] text-slate-400 font-mono tracking-widest uppercase flex items-center gap-2">
                  <LuTerminal /> Session Active
                </div>
              </div>
              
              <div className="p-6 sm:p-7 lg:p-8">
                <div className="mb-7">
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Global Standing Estimate</p>
                   <h3 className="text-3xl font-black text-[#0F172A] font-mono tracking-tighter sm:text-4xl">12,430 <span className="text-lg text-[#C7F36B]">▲</span></h3>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between font-bold text-sm mb-2">
                      <span className="text-[#0F172A]">Target Match Percentile</span>
                      <span className="text-[#0F172A] font-mono">96.2%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full border-2 border-[#0F172A] overflow-hidden flex">
                       <div className="h-full bg-[#0F172A] w-[96.2%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-bold text-sm mb-2">
                      <span className="text-[#0F172A]">Profile Completion</span>
                      <span className="text-[#0F172A] font-mono">80.0%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full border-2 border-[#0F172A] overflow-hidden flex">
                       <div className="h-full bg-[#B7E5FF] w-[80%] border-r-2 border-[#0F172A]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Dashboard Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="mb-10 rounded-[14px] border-2 border-[#0F172A] bg-white/95 px-5 py-4 shadow-[4px_4px_0px_#0F172A] sm:px-6 sm:py-5 md:mb-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-black tracking-tighter text-[#0F172A]">Workspace Applications</h2>
              <p className="text-slate-500 font-medium">Select a tool to begin your analysis.</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-white border-2 border-[#0F172A] rounded-md text-xs font-bold shadow-[2px_2px_0px_#0F172A]">6 Tools Loaded</span>
            </div>
          </div>
        </div>

        <div id="tool-grid" className="space-y-16">
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
      </section>

      {/* CTA Section */}
      <section className="bg-[#C7F36B] border-y-4 border-[#0F172A] py-24 px-6 text-center">
         <div className="max-w-3xl mx-auto">
            <LuSparkles className="text-4xl text-[#0F172A] mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-black text-[#0F172A] mb-6 tracking-tighter">Ready to optimize your admission strategy?</h2>
            <p className="text-lg text-[#0F172A]/80 font-medium mb-10 max-w-xl mx-auto">Join thousands of students making data-backed decisions for their future.</p>
            <NeoButton className="text-lg px-10 py-4 mx-auto bg-white shadow-[6px_6px_0px_#0F172A] hover:-translate-y-1">
               Create Account — It's Free
            </NeoButton>
         </div>
      </section>
    </div>
  );
}
