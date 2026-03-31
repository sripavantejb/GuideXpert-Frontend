import React, { useState } from 'react';
import { 
  LuRocket, LuTrophy, LuSearch, LuBookOpen, LuMapPin, LuScale, 
  LuArrowRight, LuSparkles, LuCheck, LuGraduationCap, LuActivity, LuTerminal
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

const NeoInput = ({ placeholder, type = "text", className = '', value, onChange }) => {
  return (
    <input 
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full bg-[#F8FAFC] border-2 border-[#0F172A] rounded-[10px] px-4 py-3 placeholder-slate-400 text-[#0F172A] font-medium focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_#0F172A] focus:-translate-y-1 transition-all duration-200 ${className}`}
    />
  );
};

const FadeInContent = ({ children, isVisible }) => {
  if (!isVisible) return null;
  return (
    <div className="animate-fade-in mt-8 pt-6 border-t-2 border-dashed border-slate-300">
      {children}
    </div>
  );
};

// ----------------------------------------------------------------------------
// Tool Components
// ----------------------------------------------------------------------------

const RankPredictor = () => {
  const [exam, setExam] = useState('');
  const [marks, setMarks] = useState('');
  const [result, setResult] = useState(null);

  const handlePredict = () => {
    if (exam && marks) setResult({ rank: '14,250', percentile: '95.82' });
  };

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
        <NeoInput placeholder="Exam Name (e.g. JEE Main)" value={exam} onChange={(e)=>setExam(e.target.value)} />
        <NeoInput placeholder="Marks Scored" type="number" value={marks} onChange={(e)=>setMarks(e.target.value)} />
      </div>
      
      <NeoButton primary className="w-full mt-6" onClick={handlePredict}>
        Run Analysis <LuArrowRight />
      </NeoButton>

      <FadeInContent isVisible={!!result}>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 border-2 border-[#0F172A] rounded-[10px]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Estimated Rank</p>
            <p className="text-2xl font-black text-[#0F172A] font-mono tracking-tighter">{result?.rank}</p>
          </div>
          <div className="p-4 bg-[#B7E5FF] border-2 border-[#0F172A] rounded-[10px] shadow-[2px_2px_0px_#0F172A]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#0F172A] mb-1">Percentile (PR)</p>
            <p className="text-2xl font-black text-[#0F172A] font-mono tracking-tighter">{result?.percentile}%</p>
          </div>
        </div>
      </FadeInContent>
    </NeoCard>
  );
};

const CollegePredictor = () => {
  const [rank, setRank] = useState('');
  const [category, setCategory] = useState('');
  const [state, setState] = useState('');
  const [result, setResult] = useState(null);

  const handlePredict = () => {
    if (rank) {
      setResult([
        { name: 'NIT Trichy', code: 'NITT', chance: 'Low', color: '#F7B5B5' },
        { name: 'VIT Vellore', code: 'VITV', chance: 'High', color: '#C7F36B' }
      ]);
    }
  };

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
          <NeoInput placeholder="Rank" type="number" value={rank} onChange={(e)=>setRank(e.target.value)} />
          <NeoInput placeholder="Category" value={category} onChange={(e)=>setCategory(e.target.value)} />
        </div>
        <NeoInput placeholder="State Preference" value={state} onChange={(e)=>setState(e.target.value)} />
      </div>

      <NeoButton primary className="w-full mt-6" onClick={handlePredict}>
        Generate Matches <LuMapPin />
      </NeoButton>

      <FadeInContent isVisible={!!result}>
        <div className="space-y-3">
          {result?.map((college, idx) => (
            <div key={idx} className="p-3 border-2 border-[#0F172A] rounded-[10px] flex items-center gap-4 bg-white transition-colors hover:bg-slate-50">
              <div className="w-12 h-12 bg-slate-100 border-2 border-[#0F172A] rounded-md flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-xs text-slate-400">{college.code}</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#0F172A] text-sm">{college.name}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Admission Prob.</p>
              </div>
              <div className="px-3 py-1 border-2 border-[#0F172A] rounded-md text-xs font-bold" style={{ backgroundColor: college.color }}>
                {college.chance}
              </div>
            </div>
          ))}
        </div>
      </FadeInContent>
    </NeoCard>
  );
};

const BranchPredictor = () => {
  const [rank, setRank] = useState('');
  const [college, setCollege] = useState('');
  const [result, setResult] = useState(null);

  const handlePredict = () => {
    if (rank && college) setResult(['Comp Sci', 'AI & ML', 'Data Sci', 'Electronics']);
  };

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
        <NeoInput placeholder="Institution Name" value={college} onChange={(e)=>setCollege(e.target.value)} />
        <NeoInput placeholder="Current Rank" type="number" value={rank} onChange={(e)=>setRank(e.target.value)} />
      </div>

      <NeoButton primary className="w-full mt-6" onClick={handlePredict}>
        Analyze Branches <LuBookOpen />
      </NeoButton>

      <FadeInContent isVisible={!!result}>
        <div className="flex flex-wrap gap-2">
          {result?.map(branch => (
            <span key={branch} className="px-3 py-1.5 bg-white border-2 border-[#0F172A] rounded-md text-xs font-bold shadow-[2px_2px_0px_#0F172A]">
              {branch}
            </span>
          ))}
        </div>
      </FadeInContent>
    </NeoCard>
  );
};

const CourseFitTest = () => {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);

  const questions = [
    "I prefer solving mathematical equations over writing essays.",
    "I enjoy building or configuring software/hardware.",
    "I lean towards systematic logic rather than open-ended creativity."
  ];

  const handleAnswer = () => {
    if (step < questions.length - 1) setStep(step + 1);
    else setResult(['B.Tech Computer Science', 'B.Sc Data Science', 'B.E. IT']);
  };

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
      
      {!result ? (
        <div className="mb-auto">
          <div className="flex gap-1 mb-4">
            {questions.map((_, i) => (
              <div key={i} className={`h-2 flex-1 border-2 border-[#0F172A] rounded-full ${i <= step ? 'bg-[#C7F36B]' : 'bg-slate-100'}`} />
            ))}
          </div>
          <div className="p-5 border-2 border-[#0F172A] rounded-[10px] bg-white shadow-[2px_2px_0px_#0F172A] h-[120px] flex items-center justify-center text-center">
            <p className="font-bold text-[#0F172A] text-sm">"{questions[step]}"</p>
          </div>
          <div className="flex gap-4 mt-6">
            <NeoButton className="flex-1 py-3 text-sm" onClick={handleAnswer}>Disagree</NeoButton>
            <NeoButton primary className="flex-1 py-3 text-sm" onClick={handleAnswer}>Agree</NeoButton>
          </div>
        </div>
      ) : (
        <FadeInContent isVisible={true}>
          <div className="space-y-2">
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Top Recommended Profiles</p>
             {result.map((course, idx) => (
               <div key={idx} className="font-bold text-sm text-[#0F172A] flex items-center gap-3 bg-[#F8FAFC] px-4 py-3 rounded-md border-2 border-[#0F172A]">
                 <LuCheck className="text-[#C7F36B] text-lg stroke-[3]" />
                 {course}
               </div>
             ))}
          </div>
        </FadeInContent>
      )}
    </NeoCard>
  );
};

const CollegeFitTest = () => {
  const [result, setResult] = useState(null);

  const handleSearch = () => {
    setResult([
      { name: "SRM Institute", location: "Chennai", size: "Large", placement: "85%" },
      { name: "Manipal University", location: "Manipal", size: "Medium", placement: "90%" }
    ]);
  };

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
        <select className="w-full bg-[#F8FAFC] border-2 border-[#0F172A] rounded-[10px] px-4 py-3 text-sm font-bold text-[#0F172A] focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_#0F172A] transition-all appearance-none">
          <option value="">Select Fee Budget</option>
          <option value="low">&lt; 10 Lakhs Total</option>
          <option value="high">10 - 20 Lakhs Total</option>
        </select>
        <select className="w-full bg-[#F8FAFC] border-2 border-[#0F172A] rounded-[10px] px-4 py-3 text-sm font-bold text-[#0F172A] focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_#0F172A] transition-all appearance-none">
          <option value="">Select Campus Size</option>
          <option value="large">Large (100+ Acres)</option>
          <option value="small">Boutique & Urban</option>
        </select>
      </div>

      <NeoButton primary className="w-full mt-6" onClick={handleSearch}>Process Criteria</NeoButton>

      <FadeInContent isVisible={!!result}>
        <div className="space-y-3">
          {result?.map((college, idx) => (
            <div key={idx} className="flex gap-3 p-3 border-2 border-[#0F172A] rounded-[10px] bg-slate-50">
              <div className="w-10 h-10 border-2 border-[#0F172A] rounded-md shrink-0 flex items-center justify-center bg-white text-[10px] font-black tracking-tighter">
                {college.name.substring(0,2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-sm text-[#0F172A]">{college.name}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{college.location} • Placements: {college.placement}</p>
              </div>
            </div>
          ))}
        </div>
      </FadeInContent>
    </NeoCard>
  );
};

const CollegeComparison = () => {
  const [colA, setColA] = useState('');
  const [colB, setColB] = useState('');
  const [result, setResult] = useState(null);

  const handleCompare = () => {
    if (colA && colB) {
      setResult({
        metrics: ['Avg Package', 'Total Fees', 'Placement %', 'Campus'],
        colA: { name: colA, stats: ['8.5L', '12L', '92%', '250 Ac'] },
        colB: { name: colB, stats: ['9.2L', '15L', '88%', '120 Ac'] }
      });
    }
  };

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
        <NeoInput placeholder="Institution A" value={colA} onChange={(e)=>setColA(e.target.value)} className="py-2.5" />
        <div className="text-center font-black text-[10px] uppercase text-slate-400 tracking-widest bg-[#F8FAFC] border-2 border-slate-200 py-1 rounded w-12 mx-auto">VS</div>
        <NeoInput placeholder="Institution B" value={colB} onChange={(e)=>setColB(e.target.value)} className="py-2.5" />
      </div>

      <NeoButton primary className="w-full mt-6" onClick={handleCompare}>Run Comparison</NeoButton>

      <FadeInContent isVisible={!!result}>
        <div className="overflow-hidden border-2 border-[#0F172A] rounded-[10px] shadow-[4px_4px_0px_#0F172A]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0F172A] text-white border-b-2 border-[#0F172A]">
              <tr>
                <th className="p-2 border-r-2 border-[#0F172A] font-medium text-slate-300">Metric</th>
                <th className="p-2 border-r-2 border-[#0F172A] font-bold truncate max-w-[80px]">{result?.colA.name}</th>
                <th className="p-2 font-bold truncate max-w-[80px]">{result?.colB.name}</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {result?.metrics.map((metric, idx) => (
                <tr key={idx} className="border-b-2 border-[#0F172A] last:border-0">
                  <td className="p-2 border-r-2 border-[#0F172A] font-bold text-slate-500">{metric}</td>
                  <td className="p-2 border-r-2 border-[#0F172A] font-black font-mono">{result.colA.stats[idx]}</td>
                  <td className="p-2 font-black font-mono">{result.colB.stats[idx]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FadeInContent>
    </NeoCard>
  );
};


// ----------------------------------------------------------------------------
// Main Page Layout
// ----------------------------------------------------------------------------

export default function StudentsDashboard() {
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
      <section className="bg-[#0F172A] relative pt-24 pb-28 px-6 lg:px-12 overflow-hidden border-b-[6px] border-[#0F172A]">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 blueprint-grid z-0"></div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1E293B] border border-slate-700 rounded-md mb-8">
              <span className="w-2 h-2 rounded-full bg-[#C7F36B] animate-pulse"></span>
              <span className="text-slate-300 font-mono text-[10px] uppercase tracking-widest">System Operational v2.4</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.05] tracking-tighter mb-6">
              Student<br/>
              <span className="text-[#C7F36B]">Intelligence</span><br/>
              Platform.
            </h1>
            
            <p className="text-lg text-slate-400 font-medium max-w-lg mb-10 leading-relaxed">
              Professional-grade admission analytics. Predict ranks, evaluate institutions, and optimize your academic trajectory with precision data.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <NeoButton primary className="text-sm px-8 hover:-translate-y-1">
                Initialize Prediction Session
              </NeoButton>
              <NeoButton className="text-sm px-8 bg-transparent text-white border-slate-700 hover:bg-[#1E293B] shadow-none active:translate-y-0 active:translate-x-0">
                View Documentation <LuArrowRight />
              </NeoButton>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md lg:max-w-none lg:pl-10">
            {/* Tech-SaaS Hero Card */}
            <div className="bg-white rounded-[14px] border-2 border-[#0F172A] shadow-[8px_8px_0px_#C7F36B] overflow-hidden">
              {/* Card Header (Mac OS Style terminal header) */}
              <div className="bg-[#0F172A] px-4 py-3 flex gap-2 items-center border-b-2 border-[#0F172A]">
                <div className="w-3 h-3 rounded-full bg-[#F7B5B5] border border-[#0F172A]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFE89A] border border-[#0F172A]"></div>
                <div className="w-3 h-3 rounded-full bg-[#C7F36B] border border-[#0F172A]"></div>
                <div className="ml-4 text-[10px] text-slate-400 font-mono tracking-widest uppercase flex items-center gap-2">
                  <LuTerminal /> Session Active
                </div>
              </div>
              
              <div className="p-8">
                <div className="mb-8">
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Global Standing Estimate</p>
                   <h3 className="text-4xl font-black text-[#0F172A] font-mono tracking-tighter">12,430 <span className="text-lg text-[#C7F36B]">▲</span></h3>
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
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter mb-2">Workspace Applications</h2>
            <p className="text-slate-500 font-medium">Select a tool to begin your analysis.</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white border-2 border-[#0F172A] rounded-md text-xs font-bold shadow-[2px_2px_0px_#0F172A]">6 Tools Loaded</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <RankPredictor />
          <CollegePredictor />
          <BranchPredictor />
          <CourseFitTest />
          <CollegeFitTest />
          <CollegeComparison />
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
