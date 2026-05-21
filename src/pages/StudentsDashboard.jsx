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
  LuTerminal,
} from 'react-icons/lu';
import StudentWorkspaceNavbar from '../components/studentDashboard/StudentWorkspaceNavbar';
import StudentWorkspaceFooter from '../components/studentDashboard/StudentWorkspaceFooter';
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

const NeoButton = ({ children, primary = false, className = '', onClick }) => {
  const baseStyle =
    'font-bold rounded-[14px] px-6 py-3 border-2 border-[#0F172A] transition-all duration-150 flex items-center justify-center gap-2';
  const typeStyle = primary
    ? 'bg-[#c7f36b] text-[#0F172A] shadow-[4px_4px_0px_#0F172A] hover:bg-[#b0d95d] active:shadow-[0px_0px_0px_#0F172A] active:translate-y-[4px] active:translate-x-[4px]'
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
// Floating Decorations
// ----------------------------------------------------------------------------

function FloatingDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg
        className="sd-float-1 absolute right-[8%] top-[12%] h-10 w-10 text-[#c7f36b]"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 17.8 5.7 21l2.3-7-6-4.6h7.6L12 2z" />
      </svg>
      <svg
        className="sd-float-2 absolute bottom-[20%] left-[5%] h-8 w-8 text-[#F7B5B5]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="sd-float-3 absolute left-[18%] top-[40%] flex h-3 w-3 rounded-full bg-[#c7f36b] ring-2 ring-black" />
      <span className="sd-float-2 absolute right-[20%] bottom-[30%] h-2 w-2 rotate-45 bg-[#B7E5FF] ring-1 ring-black" />
      <div className="sd-float-1 absolute right-[12%] top-[45%] h-14 w-14 rounded-full border-2 border-dashed border-white/30" />
    </div>
  );
}

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

  // Search & Cockpit state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('simulator');
  const [simulatorScore, setSimulatorScore] = useState(180);
  const [logs, setLogs] = useState([
    `[${new Date().toLocaleTimeString()}] System initializing...`,
    `[${new Date().toLocaleTimeString()}] 6 professional analytics tools loaded.`,
    `[${new Date().toLocaleTimeString()}] Ready for admission analysis.`,
  ]);

  // Quick prediction states & search suggestions
  const [quickExam, setQuickExam] = useState('JEE');
  const [quickScoreOrRank, setQuickScoreOrRank] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addLog = (message) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.slice(0, 14)]);
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };



  // Calculate simulator data dynamically based on score & selected exam
  const simulatorData = useMemo(() => {
    let estRank = 0;
    let percentile = 0;
    let maxScore = 300;
    let colleges = [];

    if (quickExam === 'NEET') {
      maxScore = 720;
      estRank = Math.max(1, Math.round(1000000 * Math.pow(1 - simulatorScore / maxScore, 3.2)) + 50);
      percentile = 90 + (simulatorScore / maxScore) * 9.99;
      if (simulatorScore >= 620) {
        colleges = [
          { name: 'AIIMS New Delhi', course: 'MBBS', chance: 'Medium', chanceColor: 'amber' },
          { name: 'MAMC New Delhi', course: 'MBBS', chance: 'High', chanceColor: 'emerald' },
          { name: 'KGMU Lucknow', course: 'MBBS', chance: 'High', chanceColor: 'emerald' }
        ];
      } else if (simulatorScore >= 520) {
        colleges = [
          { name: 'LHMC New Delhi', course: 'MBBS', chance: 'Medium', chanceColor: 'amber' },
          { name: 'BJMC Pune', course: 'MBBS', chance: 'High', chanceColor: 'emerald' },
          { name: 'MMC Chennai', course: 'MBBS', chance: 'Low', chanceColor: 'red' }
        ];
      } else {
        colleges = [
          { name: 'GMC Nagpur', course: 'MBBS', chance: 'Medium', chanceColor: 'amber' },
          { name: 'IMS BHU Varanasi', course: 'MBBS', chance: 'Low', chanceColor: 'red' },
          { name: 'State GMCs (General)', course: 'MBBS', chance: 'High', chanceColor: 'emerald' }
        ];
      }
    } else if (quickExam === 'EAMCET') {
      maxScore = 160;
      estRank = Math.max(1, Math.round(150000 * Math.pow(1 - simulatorScore / maxScore, 2.5)) + 120);
      percentile = 90 + (simulatorScore / maxScore) * 9.99;
      if (simulatorScore >= 130) {
        colleges = [
          { name: 'JNTU Hyderabad', course: 'CSE', chance: 'High', chanceColor: 'emerald' },
          { name: 'OU College of Eng.', course: 'CSE', chance: 'High', chanceColor: 'emerald' },
          { name: 'CBIT Hyderabad', course: 'CSE', chance: 'High', chanceColor: 'emerald' }
        ];
      } else if (simulatorScore >= 80) {
        colleges = [
          { name: 'Vasavi College of Eng.', course: 'IT', chance: 'Medium', chanceColor: 'amber' },
          { name: 'VNR VJIET', course: 'CSE', chance: 'Medium', chanceColor: 'amber' },
          { name: 'MVSR Eng. College', course: 'CSE', chance: 'High', chanceColor: 'emerald' }
        ];
      } else {
        colleges = [
          { name: 'Gokaraju Rangaraju', course: 'ECE', chance: 'Medium', chanceColor: 'amber' },
          { name: 'CBIT Hyderabad', course: 'EEE', chance: 'Low', chanceColor: 'red' },
          { name: 'JNTU Manthani', course: 'CSE', chance: 'High', chanceColor: 'emerald' }
        ];
      }
    } else if (quickExam === 'CUET') {
      maxScore = 800;
      estRank = Math.max(1, Math.round(250000 * Math.pow(1 - simulatorScore / maxScore, 2.8)) + 80);
      percentile = 90 + (simulatorScore / maxScore) * 9.99;
      if (simulatorScore >= 700) {
        colleges = [
          { name: 'SRCC Delhi (DU)', course: 'B.Com (Hons)', chance: 'Medium', chanceColor: 'amber' },
          { name: 'Hindu College (DU)', course: 'BA Econ', chance: 'High', chanceColor: 'emerald' },
          { name: 'St. Stephen\'s College', course: 'BA English', chance: 'Medium', chanceColor: 'amber' }
        ];
      } else if (simulatorScore >= 550) {
        colleges = [
          { name: 'Ramjas College (DU)', course: 'B.Sc Physics', chance: 'High', chanceColor: 'emerald' },
          { name: 'LSR Delhi (DU)', course: 'BA Pol Sci', chance: 'Medium', chanceColor: 'amber' },
          { name: 'BHU Varanasi', course: 'BA Hons', chance: 'High', chanceColor: 'emerald' }
        ];
      } else {
        colleges = [
          { name: 'Shyam Lal College (DU)', course: 'BA Hons', chance: 'High', chanceColor: 'emerald' },
          { name: 'Kirori Mal College', course: 'B.Sc Chem', chance: 'Low', chanceColor: 'red' },
          { name: 'Central Univ of Punjab', course: 'B.Sc Hons', chance: 'High', chanceColor: 'emerald' }
        ];
      }
    } else { // JEE
      maxScore = 300;
      estRank = Math.max(1, Math.round(150000 * Math.pow(1 - simulatorScore / maxScore, 2.5)) + 120);
      percentile = 90 + (simulatorScore / maxScore) * 9.99;
      if (simulatorScore >= 220) {
        colleges = [
          { name: 'IIT Bombay', course: 'CSE', chance: 'Medium', chanceColor: 'amber' },
          { name: 'IIT Madras', course: 'EE', chance: 'High', chanceColor: 'emerald' },
          { name: 'BITS Pilani', course: 'CS', chance: 'High', chanceColor: 'emerald' }
        ];
      } else if (simulatorScore >= 130) {
        colleges = [
          { name: 'NIT Trichy', course: 'CSE', chance: 'Medium', chanceColor: 'amber' },
          { name: 'NIT Warangal', course: 'ECE', chance: 'High', chanceColor: 'emerald' },
          { name: 'IIIT Hyderabad', course: 'ECE', chance: 'Low', chanceColor: 'red' }
        ];
      } else {
        colleges = [
          { name: 'COEP Pune', course: 'Mech', chance: 'High', chanceColor: 'emerald' },
          { name: 'JNTU Hyderabad', course: 'CSE', chance: 'High', chanceColor: 'emerald' },
          { name: 'DTU Delhi', course: 'ECE', chance: 'Low', chanceColor: 'red' }
        ];
      }
    }

    return { estRank, percentile, maxScore, colleges };
  }, [simulatorScore, quickExam]);

  // Handle Quick Predict form submission
  const handleQuickPredict = (e) => {
    e.preventDefault();
    if (!quickScoreOrRank.trim()) return;

    const val = parseInt(quickScoreOrRank.trim(), 10);
    if (!isNaN(val)) {
      const maxVal = simulatorData.maxScore;
      const capped = Math.max(0, Math.min(maxVal, val));
      setSimulatorScore(capped);
      addLog(`Quick prediction processed: ${quickExam} Score ${capped}/${maxVal}.`);
      setActiveTab('simulator');
    } else {
      addLog(`Registered query: ${quickExam} Rank/Score "${quickScoreOrRank}".`);
      const cleanRankStr = quickScoreOrRank.replace(/[^0-9]/g, '');
      const rankNum = parseInt(cleanRankStr, 10);
      if (!isNaN(rankNum)) {
        let simulatedScore = 150;
        if (quickExam === 'JEE') {
          simulatedScore = Math.round(300 * (1 - Math.pow(Math.min(1, rankNum / 150000), 1 / 2.5)));
        } else if (quickExam === 'NEET') {
          simulatedScore = Math.round(720 * (1 - Math.pow(Math.min(1, rankNum / 1000000), 1 / 3.2)));
        } else if (quickExam === 'EAMCET') {
          simulatedScore = Math.round(160 * (1 - Math.pow(Math.min(1, rankNum / 150000), 1 / 2.5)));
        } else if (quickExam === 'CUET') {
          simulatedScore = Math.round(800 * (1 - Math.pow(Math.min(1, rankNum / 250000), 1 / 2.8)));
        }
        setSimulatorScore(simulatedScore);
        addLog(`Derived simulated score of ${simulatedScore} for estimated rank ${rankNum}.`);
      }
      setActiveTab('simulator');
    }
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
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(8px) rotate(-5deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0px, 0px); }
          50% { transform: translate(6px, -6px); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .sd-float-1 {
          animation: float1 6s ease-in-out infinite;
        }
        .sd-float-2 {
          animation: float2 5s ease-in-out infinite;
        }
        .sd-float-3 {
          animation: float3 4s ease-in-out infinite;
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
          background-size: auto;
        }
      `}</style>

      <div className="overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative flex min-h-[550px] lg:min-h-[calc(100vh-76px)] items-center overflow-hidden border-b-[3px] border-black bg-[#0F172A] py-12 sm:py-16 lg:py-20">
          <div className="blueprint-grid absolute inset-0 z-0" />
          <FloatingDecor />

          <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-6 xl:px-8">
            <div className="min-w-0 px-0 lg:pl-12 lg:pr-6">
              <div className="flex flex-col gap-8 sm:gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">

                {/* Left Column: Info, Search, and Action */}
                <div className="min-w-0 flex-1 lg:max-w-[620px]">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-[8px] border-2 border-black bg-[#c7f36b] px-3 py-1.5 shadow-[3px_3px_0px_#000]">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#0F172A]" />
                    <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#0F172A]">
                      Live Analytics Active v2.5
                    </span>
                  </div>

                  <h1 className="mb-6 text-3xl font-black leading-[1.05] tracking-tighter text-white sm:text-4xl md:text-5xl lg:text-7xl">
                    Predict Rank.<br />
                    Compare Colleges.<br />
                    Find Your Best Fit.
                  </h1>

                  <p className="mb-8 max-w-xl text-base font-medium leading-relaxed text-slate-300 sm:text-lg">
                    Enter your marks or rank and discover your best-fit colleges, branches, and admission chances instantly.
                  </p>

                  {/* Quick Prediction Input Row */}
                  <form onSubmit={handleQuickPredict} className="mb-6 w-full max-w-[540px]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                      <div className="relative flex-1 min-w-[120px]">
                        <select
                          value={quickExam}
                          onChange={(e) => {
                            const exam = e.target.value;
                            setQuickExam(exam);
                            if (exam === 'JEE') setSimulatorScore(180);
                            else if (exam === 'NEET') setSimulatorScore(450);
                            else if (exam === 'EAMCET') setSimulatorScore(100);
                            else if (exam === 'CUET') setSimulatorScore(500);
                            addLog(`Active exam profile switched to: ${exam}`);
                          }}
                          className="w-full h-full rounded-[10px] border-2 border-black bg-white px-4 py-3 font-bold text-[#0F172A] outline-none shadow-[2px_2px_0px_#000] focus:shadow-[4px_4px_0px_#000] cursor-pointer appearance-none"
                        >
                          <option value="JEE">JEE</option>
                          <option value="EAMCET">EAMCET</option>
                          <option value="NEET">NEET</option>
                          <option value="CUET">CUET</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      <div className="flex-[2] min-w-0">
                        <input
                          type="text"
                          value={quickScoreOrRank}
                          onChange={(e) => setQuickScoreOrRank(e.target.value)}
                          placeholder="Enter marks or rank"
                          className="w-full rounded-[10px] border-2 border-black bg-white px-4 py-3 font-bold text-[#0F172A] outline-none shadow-[2px_2px_0px_#000] focus:shadow-[4px_4px_0px_#000]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="shrink-0 rounded-[10px] border-2 border-black bg-[#c7f36b] px-6 py-3 font-bold text-[#0F172A] shadow-[2px_2px_0px_#000] hover:bg-[#b0d95d] active:shadow-[0px_0px_0px_#000] active:translate-y-[2px] active:translate-x-[2px] transition-all cursor-pointer"
                      >
                        Predict Now
                      </button>
                    </div>
                  </form>

                  {/* Dynamic Search Bar */}
                  <div className="mb-4 relative max-w-[540px]">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                      <LuSearch className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => {
                        setTimeout(() => setShowSuggestions(false), 200);
                      }}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        addLog(`Searched for query: "${e.target.value}"`);
                      }}
                      placeholder="Search colleges, branches, predictors, or fit tests..."
                      className="w-full rounded-[10px] border-[3px] border-black bg-white py-3 pl-11 pr-10 text-sm font-bold text-[#0F172A] placeholder-slate-400 shadow-[4px_4px_0_0_#c7f36b] outline-none transition-all focus:-translate-y-0.5 focus:shadow-[6px_6px_0_0_#c7f36b] focus:border-black"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          addLog('Cleared search query');
                        }}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-black transition-colors"
                        type="button"
                      >
                        ✕
                      </button>
                    )}

                    {showSuggestions && autocompleteSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-[100] mt-1 overflow-hidden rounded-[10px] border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
                        <ul className="m-0 list-none p-0">
                          {autocompleteSuggestions.map((sug, idx) => (
                            <li key={idx} className="border-b last:border-0 border-black/10">
                              <button
                                type="button"
                                onMouseDown={() => {
                                  setSearchTerm(sug);
                                  addLog(`Selected search suggestion: "${sug}"`);
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#0F172A] hover:bg-[#c7f36b]/35 transition-colors cursor-pointer"
                              >
                                {sug}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Quick Action Cards */}
                  <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3 max-w-[540px]">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('simulator');
                        addLog('Action card selected: I have marks. Simulating Rank...');
                        document.querySelector('input[placeholder="Enter marks or rank"]')?.focus();
                      }}
                      className="flex flex-col items-start rounded-[10px] border-2 border-black bg-white p-3 text-left shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] active:translate-y-0 active:shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
                    >
                      <span className="text-[10px] font-bold text-slate-400 uppercase">I have marks</span>
                      <span className="text-xs font-black text-[#0F172A] mt-0.5">Predict Rank →</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('College Predictor');
                        scrollToSection('student-workspace');
                        addLog('Action card selected: I have rank. Displaying College Predictors...');
                      }}
                      className="flex flex-col items-start rounded-[10px] border-2 border-black bg-white p-3 text-left shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] active:translate-y-0 active:shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
                    >
                      <span className="text-[10px] font-bold text-slate-400 uppercase">I have rank</span>
                      <span className="text-xs font-black text-[#0F172A] mt-0.5">Find Colleges →</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        scrollToSection('student-workspace');
                        setSearchTerm('Fit Test');
                        addLog('Action card selected: Confused. Navigated to Fit Tests...');
                      }}
                      className="flex flex-col items-start rounded-[10px] border-2 border-black bg-white p-3 text-left shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] active:translate-y-0 active:shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
                    >
                      <span className="text-[10px] font-bold text-slate-400 uppercase">I am confused</span>
                      <span className="text-xs font-black text-[#0F172A] mt-0.5">Take Fit Test →</span>
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex w-full min-w-0 flex-col gap-4 sm:w-auto sm:flex-row sm:items-center">
                    <NeoButton
                      primary
                      className="w-full sm:w-auto sm:min-w-[240px]"
                      onClick={() => {
                        navigate('/students/rank-predictor');
                        addLog('Initiated main rank predictor flow');
                      }}
                    >
                      Start Prediction
                    </NeoButton>
                    <NeoButton
                      className="w-full sm:w-auto sm:min-w-[220px]"
                      onClick={() => {
                        scrollToSection('student-workspace');
                        addLog('Scrolled view down to tools grid');
                      }}
                    >
                      Explore Tools <LuArrowRight />
                    </NeoButton>
                  </div>

                  {/* Trust Stats */}
                  <div className="mt-8 pt-6 border-t border-slate-700 max-w-[540px]">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div>
                        <div className="font-mono text-xl font-black text-[#c7f36b]">500+</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Colleges</div>
                      </div>
                      <div>
                        <div className="font-mono text-xl font-black text-[#c7f36b]">40k+</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cutoff Records</div>
                      </div>
                      <div>
                        <div className="font-mono text-xl font-black text-[#c7f36b]">10+</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Smart Tools</div>
                      </div>
                      <div>
                        <div className="font-mono text-xl font-black text-[#c7f36b]">AI-Based</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fit Tests</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Interactive Cockpit Console */}
                <div className="w-full min-w-0 flex-1 lg:pl-4">
                  <div className="mx-auto w-full max-w-[620px] min-w-0 overflow-hidden rounded-[14px] border-[3px] border-black bg-white shadow-[8px_8px_0px_#c7f36b]">
                    {/* Terminal Header Bar */}
                    <div className="flex min-w-0 items-center justify-between border-b-2 border-black bg-[#0F172A] px-3 py-2.5 sm:px-4 sm:py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full border border-black bg-[#F7B5B5]" aria-hidden="true" />
                        <div className="h-3 w-3 rounded-full border border-black bg-[#c7f36b]" aria-hidden="true" />
                        <div className="h-3 w-3 rounded-full border border-black bg-[#B7E5FF]" aria-hidden="true" />
                        <div className="ml-2 flex min-w-0 items-center gap-2 truncate font-mono text-[9px] uppercase tracking-widest text-slate-400 sm:ml-4 sm:text-[10px]">
                          <LuTerminal className="shrink-0 text-[#c7f36b]" /> <span className="truncate text-white">Active Cockpit</span>
                        </div>
                      </div>

                      {/* Interactive Tab Handles */}
                      <div className="flex gap-1.5 shrink-0">
                        {[
                          { id: 'simulator', label: 'SIM' },
                          { id: 'snapshot', label: 'PROFILE' },
                          { id: 'logs', label: 'LOGS' }
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => {
                              setActiveTab(t.id);
                              addLog(`Switched console tab to: ${t.id.toUpperCase()}`);
                            }}
                            className={`rounded-[6px] border border-black px-2.5 py-0.5 font-mono text-[9px] font-bold transition-all sm:text-[10px] cursor-pointer ${activeTab === t.id
                                ? 'bg-[#c7f36b] text-[#0F172A] shadow-[1px_1px_0px_#000] translate-y-[-0.5px]'
                                : 'bg-slate-800 text-slate-400 hover:text-white border-transparent'
                              }`}
                            type="button"
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cockpit Card Inner Workspace */}
                    <div className="p-6 sm:p-7 lg:p-8 min-h-[290px] flex flex-col justify-between">
                      {activeTab === 'simulator' && (
                        <div className="space-y-4 animate-fade-in">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Interactive Tool</p>
                              <h4 className="font-mono text-xl font-black text-[#0F172A] mt-0.5">{quickExam} Marks-to-Rank Sim</h4>
                            </div>
                            <div className="text-right">
                              <span className="font-mono text-[10px] font-black text-[#0F172A] bg-[#B7E5FF] border-2 border-black rounded-[6px] px-2 py-0.5 shadow-[2px_2px_0px_#000]">
                                Dynamic Predictor
                              </span>
                            </div>
                          </div>

                          <div className="bg-slate-50 border-2 border-black rounded-[10px] p-4 shadow-[3px_3px_0px_#000]">
                            <div className="flex justify-between items-center mb-3">
                              <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Simulated Score</span>
                                <span className="font-mono text-2xl font-black text-black">
                                  {simulatorScore} <span className="text-sm font-bold text-slate-400">/ {simulatorData.maxScore}</span>
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Estimated Rank</span>
                                <span className="font-mono text-2xl font-black text-emerald-600">
                                  ~{simulatorData.estRank.toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>

                            {/* Range Slider control */}
                            <input
                              type="range"
                              min="0"
                              max={simulatorData.maxScore}
                              value={simulatorScore}
                              onChange={(e) => {
                                const score = parseInt(e.target.value);
                                setSimulatorScore(score);
                                if (score % 10 === 0) {
                                  addLog(`Simulated score adjusted to ${score}/${simulatorData.maxScore}`);
                                }
                              }}
                              className="w-full accent-black cursor-pointer bg-slate-200 border-2 border-black rounded-lg h-2.5 appearance-none focus:outline-none"
                            />
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1.5 font-mono">
                              <span>0 (Min)</span>
                              <span>{simulatorData.maxScore / 2} (Avg)</span>
                              <span>{simulatorData.maxScore} (Max)</span>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <div className="mb-2 flex min-w-0 flex-wrap items-baseline justify-between gap-2 text-xs font-bold sm:text-sm">
                                <span className="min-w-0 text-[#0F172A]">Simulated Percentile</span>
                                <span className="font-mono text-[#0F172A]">
                                  {simulatorData.percentile.toFixed(3)}%
                                </span>
                              </div>
                              <div className="flex h-3 w-full overflow-hidden rounded-full border-2 border-black bg-slate-100">
                                <div
                                  className="h-full bg-black transition-all duration-75"
                                  style={{ width: `${Math.min(100, Math.max(0, (simulatorScore / simulatorData.maxScore) * 100))}%` }}
                                />
                              </div>
                            </div>

                            {/* Best-fit college suggestions */}
                            <div className="border-t border-black/15 pt-3">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2 font-mono">
                                Best-Fit College Suggestions ({quickExam})
                              </span>
                              <div className="space-y-2">
                                {simulatorData.colleges.map((col, idx) => {
                                  const colorClass =
                                    col.chanceColor === 'emerald'
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                                      : col.chanceColor === 'amber'
                                        ? 'bg-amber-100 text-amber-800 border-amber-400'
                                        : 'bg-red-100 text-red-800 border-red-400';
                                  return (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between rounded-[8px] border-2 border-black bg-white p-2 text-xs font-bold shadow-[2px_2px_0px_#000]"
                                    >
                                      <div>
                                        <div className="text-[#0F172A]">{col.name}</div>
                                        <div className="text-[10px] font-medium text-slate-400">{col.course}</div>
                                      </div>
                                      <span
                                        className={`rounded-[6px] px-2 py-0.5 text-[9px] font-bold uppercase border-2 border-black ${colorClass}`}
                                      >
                                        {col.chance} Chance
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'snapshot' && (
                        <div className="space-y-5 animate-fade-in">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Local Cache Status</p>
                            <h4 className="font-mono text-xl font-black text-[#0F172A] mt-0.5">Profile Snapshot</h4>
                          </div>

                          {organicLead ? (
                            <div className="bg-[#FFF8E8] border-2 border-black rounded-[10px] p-4 shadow-[3px_3px_0px_#000] space-y-3">
                              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs font-bold text-slate-600">
                                <div>
                                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Exam Name</span>
                                  <span className="text-black font-black text-sm">{organicLead.examName}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Score Submitted</span>
                                  <span className="text-black font-black text-sm">{organicLead.score}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">OTP Status</span>
                                  <span className="text-emerald-700 font-black text-sm">
                                    {organicLead.otpVerified ? 'Verified ✓' : 'Pending Verification'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Last Active</span>
                                  <span className="text-black font-bold text-xs truncate block">
                                    {formatCapturedAt(organicLead.capturedAt) || '—'}
                                  </span>
                                </div>
                              </div>
                              <div className="pt-1.5">
                                <Link
                                  to={organicLead.examId ? `/students/rank-predictor/${organicLead.examId}` : '/students/rank-predictor'}
                                  className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border-2 border-black bg-white px-3 py-2 text-xs font-bold shadow-[2px_2px_0px_#000] hover:bg-slate-50 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0px_0px_0px_#000]"
                                >
                                  Resume Saved Session <LuArrowRight />
                                </Link>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-[10px] p-6 text-center">
                              <p className="text-sm font-bold text-slate-500 mb-4">No local submissions detected on this browser.</p>
                              <button
                                onClick={() => {
                                  navigate('/students/rank-predictor');
                                  addLog('Navigated to Rank Predictor form');
                                }}
                                className="inline-flex items-center gap-2 rounded-[10px] border-2 border-black bg-[#c7f36b] px-4 py-2.5 text-xs font-bold shadow-[2px_2px_0px_#000] hover:bg-[#b0d95d] active:shadow-[0px_0px_0px_#000] active:translate-y-[2px] active:translate-x-[2px] transition-all cursor-pointer"
                                type="button"
                              >
                                Submit Rank Prediction <LuRocket />
                              </button>
                            </div>
                          )}

                          <div className="space-y-4 pt-1">
                            <div>
                              <div className="mb-2 flex min-w-0 flex-wrap items-baseline justify-between gap-2 text-xs font-bold sm:text-sm">
                                <span className="min-w-0 text-[#0F172A]">Workspace Completeness</span>
                                <span className="font-mono text-[#0F172A]">{organicLead ? '100%' : '20%'}</span>
                              </div>
                              <div className="flex h-3 w-full overflow-hidden rounded-full border-2 border-black bg-slate-100">
                                <div
                                  className="h-full bg-[#B7E5FF] transition-all duration-300"
                                  style={{ width: organicLead ? '100%' : '20%' }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'logs' && (
                        <div className="space-y-4 flex-1 flex flex-col justify-between animate-fade-in">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Live Workspace Monitoring</p>
                            <h4 className="font-mono text-xl font-black text-[#0F172A] mt-0.5">Diagnostics Logs</h4>
                          </div>

                          <div className="bg-black text-[#c7f36b] font-mono text-[10px] sm:text-xs rounded-[10px] p-4 h-[120px] overflow-y-auto border-2 border-black space-y-1 shadow-[3px_3px_0px_rgba(0,0,0,0.15)] select-none">
                            {logs.map((log, idx) => (
                              <div key={idx} className="truncate">
                                {log}
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                            <span>Status: MONITORING</span>
                            <button
                              onClick={() => {
                                setLogs([`[${new Date().toLocaleTimeString()}] Diagnostics cleared.`]);
                              }}
                              className="text-[#0F172A] underline hover:text-[#c7f36b] transition-colors cursor-pointer"
                              type="button"
                            >
                              Clear screen
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

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
                  <div>
                    <h2 id="workspace-applications-heading" className="mb-2 text-2xl font-black tracking-tighter text-[#0F172A] sm:text-3xl">
                      Workspace Applications
                    </h2>
                    <p className="font-medium text-slate-500">
                      {searchTerm.trim()
                        ? `Filtered analysis tools matching "${searchTerm}"`
                        : 'Select a tool to begin your analysis.'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="rounded-md border-2 border-[#0F172A] bg-white px-3 py-1 text-xs font-bold shadow-[2px_2px_0px_#0F172A]">
                      {filteredTools.length} of 6 Tools Loaded
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
                            onClick={() => {
                              setSearchTerm('');
                              addLog('Cleared search query');
                            }}
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


