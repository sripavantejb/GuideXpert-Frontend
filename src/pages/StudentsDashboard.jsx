import React, { useState, useEffect, useRef } from 'react';
import {
  LuRocket, LuTrophy, LuSearch, LuBookOpen, LuMapPin, LuScale,
  LuArrowRight, LuSparkles, LuCheck, LuGraduationCap, LuActivity,
  LuTerminal, LuBot, LuSend, LuX, LuChevronDown, LuChevronUp,
  LuBrain, LuCircleDot, LuZap, LuLayers
} from 'react-icons/lu';

// ─────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');

  .sid-page { font-family: 'Space Grotesk', sans-serif; }
  .sid-mono { font-family: 'JetBrains Mono', monospace; }

  @keyframes sid-fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes sid-fillBar {
    from { width: 0%; }
    to   { width: var(--target-width); }
  }
  @keyframes sid-pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.8); }
  }
  @keyframes sid-blink {
    0%, 100% { opacity: 1; } 50% { opacity: 0; }
  }
  @keyframes sid-float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-14px); }
  }
  @keyframes sid-grid-glow {
    0%, 100% { opacity: 0.06; }
    50%       { opacity: 0.12; }
  }
  @keyframes sid-particle {
    0%   { transform: translate(0, 0) rotate(0deg); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { transform: translate(var(--px), var(--py)) rotate(360deg); opacity: 0; }
  }
  @keyframes sid-expand {
    from { max-height: 0; opacity: 0; }
    to   { max-height: 900px; opacity: 1; }
  }
  @keyframes sid-progress {
    from { width: 0; }
    to   { width: 100%; }
  }

  .sid-fade-up  { animation: sid-fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
  .sid-blinking { animation: sid-blink 0.9s step-end infinite; }

  .sid-card {
    background: #fff;
    border: 2px solid #0F172A;
    border-radius: 14px;
    box-shadow: 4px 4px 0px #0F172A;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
  .sid-card:hover {
    transform: translateY(-4px);
    box-shadow: 6px 6px 0px #0F172A;
  }

  /* Progress bar animated fill */
  .sid-bar-fill {
    height: 100%;
    border-radius: 9999px;
    animation: sid-progress 1.2s cubic-bezier(0.16,1,0.3,1) forwards;
  }

  /* Tool expand panel */
  .sid-tool-body {
    overflow: hidden;
    transition: max-height 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease;
    max-height: 0;
    opacity: 0;
  }
  .sid-tool-body.open {
    max-height: 900px;
    opacity: 1;
  }

  /* Floating particles */
  .sid-particle {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    animation: sid-particle linear forwards infinite;
  }

  /* AI Advisor */
  .sid-advisor-bubble {
    animation: sid-fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards;
  }

  /* Neo button snap */
  .sid-btn {
    border: 2px solid #0F172A;
    border-radius: 14px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: transform 0.1s ease, box-shadow 0.1s ease, background 0.15s ease;
    cursor: pointer;
  }
  .sid-btn:active {
    transform: translate(4px, 4px) !important;
    box-shadow: 0 0 0 #0F172A !important;
  }
  .sid-btn-primary {
    background: #C7F36B;
    box-shadow: 4px 4px 0px #0F172A;
    color: #0F172A;
  }
  .sid-btn-primary:hover { background: #b6e058; transform: translateY(-2px); box-shadow: 6px 6px 0px #0F172A; }
  .sid-btn-ghost {
    background: #fff;
    box-shadow: 4px 4px 0px #0F172A;
    color: #0F172A;
  }
  .sid-btn-ghost:hover { background: #F8FAFC; transform: translateY(-2px); box-shadow: 6px 6px 0px #0F172A; }

  /* Inputs */
  .sid-input {
    width: 100%;
    background: #F8FAFC;
    border: 2px solid #0F172A;
    border-radius: 10px;
    padding: 12px 16px;
    color: #0F172A;
    font-weight: 600;
    font-family: 'Space Grotesk', sans-serif;
    transition: background 0.15s, box-shadow 0.15s, transform 0.15s;
    outline: none;
  }
  .sid-input::placeholder { color: #94A3B8; font-weight: 500; }
  .sid-input:focus {
    background: #fff;
    box-shadow: 4px 4px 0px #0F172A;
    transform: translateY(-2px);
  }

  select.sid-input { appearance: none; }

  /* Section divider */
  .sid-section-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #64748B;
    padding: 6px 14px;
    background: #F1F5F9;
    border: 2px solid #0F172A;
    border-radius: 999px;
    box-shadow: 2px 2px 0 #0F172A;
    margin-bottom: 24px;
  }

  /* Comparison VS */
  .sid-vs-badge {
    background: #0F172A;
    color: #C7F36B;
    font-weight: 900;
    font-size: 13px;
    letter-spacing: 0.1em;
    border-radius: 999px;
    padding: 6px 14px;
    border: 2px solid #C7F36B;
    box-shadow: 2px 2px 0 #C7F36B;
  }
`;

// ─────────────────────────────────────────────────────────────
// SMALL UTILITIES
// ─────────────────────────────────────────────────────────────
const NeoInput = ({ placeholder, type = 'text', value, onChange, className = '' }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`sid-input ${className}`}
  />
);

const NeoBtn = ({ children, primary, className = '', onClick, style }) => (
  <button
    className={`sid-btn px-6 py-3 text-sm ${primary ? 'sid-btn-primary' : 'sid-btn-ghost'} ${className}`}
    onClick={onClick}
    style={style}
  >
    {children}
  </button>
);

const FadeUp = ({ children, visible, className = '' }) => {
  if (!visible) return null;
  return <div className={`sid-fade-up ${className}`}>{children}</div>;
};

const AccentChip = ({ label, color }) => (
  <span
    className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border-2 border-[#0F172A] shadow-[1px_1px_0_#0F172A]"
    style={{ background: color }}
  >
    {label}
  </span>
);

// ─────────────────────────────────────────────────────────────
// 1. HERO SECTION with animated demo
// ─────────────────────────────────────────────────────────────
const HeroSection = ({ onDemoComplete }) => {
  const [phase, setPhase] = useState('idle'); // idle | typing | calculating | done
  const [progress, setProgress] = useState(0);
  const [typed, setTyped] = useState('');
  const intervalRef = useRef(null);

  const MARKS_STR = '285 / 300';

  const runDemo = () => {
    if (phase !== 'idle') return;
    setPhase('typing');
    let i = 0;
    intervalRef.current = setInterval(() => {
      setTyped(MARKS_STR.slice(0, ++i));
      if (i === MARKS_STR.length) {
        clearInterval(intervalRef.current);
        setTimeout(() => {
          setPhase('calculating');
          let p = 0;
          intervalRef.current = setInterval(() => {
            p += 3;
            setProgress(p);
            if (p >= 100) {
              clearInterval(intervalRef.current);
              setPhase('done');
              onDemoComplete?.();
            }
          }, 35);
        }, 500);
      }
    }, 60);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <section className="bg-[#0F172A] relative pt-24 pb-28 px-6 lg:px-16 overflow-hidden border-b-[4px] border-[#0F172A]">
      {/* animated grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        animation: 'sid-grid-glow 4s ease-in-out infinite',
      }}/>
      {/* Particles */}
      {[
        { size: 6, color: '#C7F36B', top: '20%', left: '10%', px: '60px', py: '-40px', dur: '8s' },
        { size: 4, color: '#B7E5FF', top: '60%', left: '5%',  px: '30px', py: '-80px', dur: '10s' },
        { size: 8, color: '#F7B5B5', top: '15%', right: '12%', px: '-50px', py: '70px', dur: '9s' },
        { size: 5, color: '#FFE89A', top: '75%', right: '8%',  px: '-40px', py: '-60px', dur: '12s' },
      ].map((p, i) => (
        <div key={i} className="sid-particle" style={{
          width: p.size, height: p.size, background: p.color,
          top: p.top, left: p.left, right: p.right,
          '--px': p.px, '--py': p.py,
          animationDuration: p.dur, animationDelay: `${i * 1.5}s`,
        }}/>
      ))}

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-16">
        {/* Left Copy */}
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1E293B] border border-slate-700 rounded-md mb-8">
            <span className="w-2 h-2 rounded-full bg-[#C7F36B]" style={{ animation: 'sid-pulse-dot 2s ease-in-out infinite' }}/>
            <span className="text-slate-300 sid-mono text-[10px] uppercase tracking-widest">Platform v2.4 — Live</span>
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
            <NeoBtn primary className="text-sm px-8 text-base" onClick={runDemo}>
              Initialize Prediction Session <LuZap />
            </NeoBtn>
            <NeoBtn className="text-sm px-8 text-base bg-transparent border-slate-700 text-white shadow-none hover:bg-[#1E293B]">
              Explore Tools <LuArrowRight />
            </NeoBtn>
          </div>
        </div>

        {/* Right: Animated Demo Card */}
        <div className="flex-1 w-full max-w-sm lg:max-w-none lg:pl-6">
          <div className="bg-white rounded-[14px] border-2 border-[#0F172A]"
            style={{ boxShadow: phase === 'done' ? '8px 8px 0px #C7F36B' : '8px 8px 0px #0F172A', transition: 'box-shadow 0.4s ease' }}>
            {/* Terminal header */}
            <div className="bg-[#0F172A] px-4 py-3 flex gap-2 items-center border-b-2 border-[#0F172A] rounded-t-[12px]">
              <span className="w-3 h-3 rounded-full bg-[#F7B5B5] border border-[#0F172A]"/>
              <span className="w-3 h-3 rounded-full bg-[#FFE89A] border border-[#0F172A]"/>
              <span className="w-3 h-3 rounded-full bg-[#C7F36B] border border-[#0F172A]"/>
              <span className="ml-4 text-[10px] text-slate-400 sid-mono uppercase tracking-widest flex items-center gap-2">
                <LuTerminal size={10}/> session.predict
              </span>
            </div>

            <div className="p-8 space-y-6">
              {/* Exam field */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Exam</p>
                <div className="sid-input pointer-events-none text-[#0F172A] bg-[#F8FAFC]">JEE Advanced 2024</div>
              </div>

              {/* Marks field */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Marks</p>
                <div className="sid-input pointer-events-none text-[#0F172A] bg-[#F8FAFC] sid-mono flex items-center gap-1">
                  {phase === 'idle' ? <span className="text-slate-400">—</span> : typed}
                  {phase === 'typing' && <span className="sid-blinking text-[#C7F36B] font-black">|</span>}
                </div>
              </div>

              {/* Calculation progress */}
              {(phase === 'calculating' || phase === 'done') && (
                <FadeUp visible className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {phase === 'calculating' ? 'Calculating rank...' : 'Analysis Complete'}
                  </p>
                  <div className="h-4 w-full bg-slate-100 rounded-full border-2 border-[#0F172A] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progress}%`,
                        background: phase === 'done' ? '#C7F36B' : '#B7E5FF',
                        transition: 'width 0.04s linear, background 0.4s ease',
                        borderRight: progress < 100 ? '2px solid #0F172A' : 'none',
                      }}
                    />
                  </div>
                  {phase === 'calculating' && (
                    <p className="sid-mono text-[11px] text-slate-400">Processing {progress}%...</p>
                  )}
                </FadeUp>
              )}

              {/* Result */}
              {phase === 'done' && (
                <FadeUp visible className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-[#B7E5FF] border-2 border-[#0F172A] rounded-[10px] shadow-[2px_2px_0_#0F172A]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 mb-1">Predicted Rank</p>
                    <p className="text-2xl font-black text-[#0F172A] sid-mono tracking-tighter">12,430</p>
                  </div>
                  <div className="p-4 bg-[#C7F36B] border-2 border-[#0F172A] rounded-[10px] shadow-[2px_2px_0_#0F172A]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0F172A] mb-1">Percentile</p>
                    <p className="text-2xl font-black text-[#0F172A] sid-mono tracking-tighter">96.2%</p>
                  </div>
                </FadeUp>
              )}

              {phase === 'idle' && (
                <p className="text-sm text-slate-400 text-center pt-2">
                  ↑ Click <strong className="text-[#0F172A]">Initialize Prediction Session</strong> to run the demo
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// 2. STUDENT SNAPSHOT BAR
// ─────────────────────────────────────────────────────────────
const SnapshotBar = ({ visible }) => {
  const items = [
    { label: 'Predicted Rank', value: '12,430', icon: LuTrophy,    accent: '#B7E5FF' },
    { label: 'Top Course',     value: 'Comp Sci', icon: LuBrain,     accent: '#C7F36B' },
    { label: 'Best College',   value: 'VIT',      icon: LuGraduationCap, accent: '#F7B5B5' },
    { label: 'Admission Prob', value: '72%',      icon: LuCircleDot, accent: '#FFE89A' },
  ];

  return (
    <section className="bg-[#F8FAFC] border-b-2 border-[#0F172A] px-6 lg:px-16 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="sid-section-label"><LuActivity size={12}/> Student Snapshot</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, idx) => (
            <div key={idx} className="sid-card flex items-center gap-4 p-4"
              style={{ borderLeft: `4px solid ${item.accent}`, animationDelay: `${idx * 0.08}s` }}>
              <div className="w-10 h-10 rounded-lg border-2 border-[#0F172A] flex items-center justify-center shrink-0"
                style={{ background: item.accent }}>
                <item.icon size={16} color="#0F172A" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{item.label}</p>
                <p className="text-xl font-black text-[#0F172A] sid-mono tracking-tighter leading-tight">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// 3. PROGRESS JOURNEY
// ─────────────────────────────────────────────────────────────
const ProgressJourney = () => {
  const [active, setActive] = useState(0);
  const steps = [
    { label: 'Predict Rank',    icon: LuActivity },
    { label: 'Find Colleges',   icon: LuSearch },
    { label: 'Compare Options', icon: LuScale },
    { label: 'Choose Course',   icon: LuGraduationCap },
  ];

  return (
    <section className="bg-white border-b-2 border-[#0F172A] px-6 lg:px-16 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="sid-section-label"><LuLayers size={12}/> Your Journey</div>
        <div className="flex items-start gap-0">
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <button
                onClick={() => setActive(idx)}
                className="flex flex-col items-center gap-3 flex-1 group focus:outline-none"
              >
                <div className="w-12 h-12 rounded-full border-2 border-[#0F172A] flex items-center justify-center transition-all duration-200 group-hover:-translate-y-1"
                  style={{
                    background: idx <= active ? '#0F172A' : '#F8FAFC',
                    boxShadow: idx <= active ? '3px 3px 0 #C7F36B' : '2px 2px 0 #0F172A',
                  }}>
                  <step.icon size={18} color={idx <= active ? '#C7F36B' : '#64748B'} />
                </div>
                <div className="text-center">
                  <p className="text-[10px] sid-mono font-black uppercase tracking-widest text-slate-500 mb-0.5">Step {idx + 1}</p>
                  <p className="text-xs font-black text-[#0F172A]">{step.label}</p>
                </div>
              </button>
              {idx < steps.length - 1 && (
                <div className="flex-1 h-[2px] mt-6 relative self-start mx-2"
                  style={{ background: idx < active ? '#C7F36B' : '#CBD5E1', border: '1px solid #0F172A' }}>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// 4. EXPANDABLE TOOL CARD
// ─────────────────────────────────────────────────────────────
const ToolPanel = ({ title, subtitle, icon: Icon, accentColor, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="sid-card overflow-hidden"
      style={{ borderTop: `4px solid ${accentColor}` }}>
      <button
        className="w-full p-6 flex items-center justify-between gap-4 text-left group focus:outline-none"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg border-2 border-[#0F172A] flex items-center justify-center shrink-0 transition-transform group-hover:rotate-6 duration-200"
            style={{ background: accentColor }}>
            <Icon size={18} color="#0F172A" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#0F172A] tracking-tight">{title}</h3>
            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
          </div>
        </div>
        <div className="w-8 h-8 border-2 border-[#0F172A] rounded-lg flex items-center justify-center bg-[#F8FAFC] shrink-0 transition-all duration-200"
          style={{ background: open ? accentColor : '#F8FAFC' }}>
          {open ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
        </div>
      </button>

      <div className={`sid-tool-body ${open ? 'open' : ''}`}>
        <div className="px-6 pb-6 border-t-2 border-dashed border-slate-200 pt-5">
          {children}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 5. SMART INSIGHT CARD
// ─────────────────────────────────────────────────────────────
const SmartInsight = ({ text }) => (
  <FadeUp visible className="mt-6">
    <div className="p-4 bg-[#0F172A] border-2 border-[#0F172A] rounded-[10px] shadow-[3px_3px_0_#C7F36B]">
      <div className="flex items-center gap-2 mb-2">
        <LuSparkles size={13} color="#C7F36B" />
        <span className="text-[10px] font-black uppercase tracking-widest text-[#C7F36B] sid-mono">AI Insight</span>
      </div>
      <p className="text-sm text-slate-300 font-medium leading-relaxed">{text}</p>
    </div>
  </FadeUp>
);

// ─────────────────────────────────────────────────────────────
// 6. TOOL IMPLEMENTATIONS
// ─────────────────────────────────────────────────────────────

const RankPredictorTool = () => {
  const [exam, setExam] = useState('');
  const [marks, setMarks] = useState('');
  const [result, setResult] = useState(null);

  const handlePredict = () => {
    if (exam && marks) setResult({ rank: '14,250', percentile: '95.82' });
  };

  return (
    <div className="space-y-4">
      <NeoInput placeholder="Exam Name (e.g. JEE Main)" value={exam} onChange={e => setExam(e.target.value)} />
      <NeoInput placeholder="Marks Scored" type="number" value={marks} onChange={e => setMarks(e.target.value)} />
      <NeoBtn primary className="w-full" onClick={handlePredict}>
        Run Analysis <LuArrowRight />
      </NeoBtn>
      {result && (
        <FadeUp visible className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-[#B7E5FF] border-2 border-[#0F172A] rounded-[10px] shadow-[2px_2px_0_#0F172A]">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 mb-1">Rank</p>
            <p className="text-2xl font-black text-[#0F172A] sid-mono">{result.rank}</p>
          </div>
          <div className="p-4 bg-[#C7F36B] border-2 border-[#0F172A] rounded-[10px] shadow-[2px_2px_0_#0F172A]">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#0F172A] mb-1">Percentile</p>
            <p className="text-2xl font-black text-[#0F172A] sid-mono">{result.percentile}%</p>
          </div>
          <SmartInsight text="Based on rank 14,250 in JEE Main, you have high probability of securing CSE/IT in top Tier-2 institutions and strong chances for core branches in NITs." />
        </FadeUp>
      )}
    </div>
  );
};

const CollegePredictorTool = () => {
  const [rank, setRank] = useState('');
  const [category, setCategory] = useState('');
  const [state, setState] = useState('');
  const [result, setResult] = useState(null);

  const handlePredict = () => {
    if (rank) setResult([
      { name: 'VIT Vellore',  code: 'VITV', chance: 'High',   color: '#C7F36B' },
      { name: 'SRM Chennai',  code: 'SRMC', chance: 'High',   color: '#C7F36B' },
      { name: 'NIT Trichy',   code: 'NITT', chance: 'Medium', color: '#FFE89A' },
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <NeoInput placeholder="Rank" type="number" value={rank} onChange={e => setRank(e.target.value)} />
        <NeoInput placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
      </div>
      <NeoInput placeholder="State Preference" value={state} onChange={e => setState(e.target.value)} />
      <NeoBtn primary className="w-full" onClick={handlePredict}>
        Generate Matches <LuMapPin />
      </NeoBtn>
      {result && (
        <FadeUp visible className="space-y-3 pt-2">
          {result.map((c, i) => (
            <div key={i} className="flex items-center gap-4 p-3 border-2 border-[#0F172A] rounded-[10px] bg-white hover:bg-slate-50 transition-colors shadow-[2px_2px_0_#0F172A]">
              <div className="w-10 h-10 bg-slate-100 border-2 border-[#0F172A] rounded-md flex items-center justify-center shrink-0">
                <span className="font-black text-[10px] text-slate-500 sid-mono">{c.code}</span>
              </div>
              <div className="flex-1 font-bold text-sm text-[#0F172A]">{c.name}</div>
              <AccentChip label={c.chance} color={c.color} />
            </div>
          ))}
          <SmartInsight text="Given your rank range, private engineering institutions in Tamil Nadu and Maharashtra offer the best placement-to-fees ratio for CSE branches." />
        </FadeUp>
      )}
    </div>
  );
};

const BranchPredictorTool = () => {
  const [rank, setRank] = useState('');
  const [college, setCollege] = useState('');
  const [result, setResult] = useState(null);

  return (
    <div className="space-y-4">
      <NeoInput placeholder="Institution Name" value={college} onChange={e => setCollege(e.target.value)} />
      <NeoInput placeholder="Your Rank" type="number" value={rank} onChange={e => setRank(e.target.value)} />
      <NeoBtn primary className="w-full" onClick={() => { if (rank && college) setResult(['Comp Science', 'AI & ML', 'Data Science', 'Electronics']); }}>
        Analyze Branches <LuBookOpen />
      </NeoBtn>
      {result && (
        <FadeUp visible className="pt-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Eligible Branches</p>
          <div className="flex flex-wrap gap-2">
            {result.map(b => (
              <span key={b} className="px-3 py-1.5 bg-white border-2 border-[#0F172A] rounded-md text-xs font-bold shadow-[2px_2px_0_#0F172A]">{b}</span>
            ))}
          </div>
          <SmartInsight text="CSE and AI & ML are optimal picks given current cutoffs. Data Science is also a strong emerging option with industry demand increasing 3x in recent years." />
        </FadeUp>
      )}
    </div>
  );
};

const CourseFitTool = () => {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const questions = [
    'I prefer solving mathematical equations over writing essays.',
    'I enjoy configuring or building software systems.',
    'Systematic logic is more natural to me than open-ended creativity.',
  ];
  const advance = () => step < questions.length - 1 ? setStep(s => s + 1) : setResult(['B.Tech Computer Science', 'B.Sc Data Science', 'B.E. Information Technology']);

  return !result ? (
    <div className="space-y-4">
      <div className="flex gap-1">
        {questions.map((_, i) => (
          <div key={i} className="flex-1 h-2 border-2 border-[#0F172A] rounded-full overflow-hidden">
            <div className="h-full sid-bar-fill" style={{ '--target-width': i <= step ? '100%' : '0%', background: '#C7F36B', width: i <= step ? '100%' : '0%' }}/>
          </div>
        ))}
      </div>
      <div className="p-5 min-h-[80px] border-2 border-[#0F172A] rounded-[10px] bg-[#F8FAFC] flex items-center justify-center text-center shadow-[2px_2px_0_#0F172A]">
        <p className="font-bold text-[#0F172A] text-sm sid-mono">"{questions[step]}"</p>
      </div>
      <div className="flex gap-4">
        <NeoBtn className="flex-1 py-3 text-sm" onClick={advance}>Disagree</NeoBtn>
        <NeoBtn primary className="flex-1 py-3 text-sm" onClick={advance}>Agree</NeoBtn>
      </div>
    </div>
  ) : (
    <FadeUp visible className="space-y-2">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Top Recommended Profiles</p>
      {result.map((course, i) => (
        <div key={i} className="flex items-center gap-3 bg-[#F8FAFC] px-4 py-3 rounded-md border-2 border-[#0F172A] font-bold text-sm shadow-[2px_2px_0_#0F172A]">
          <LuCheck size={16} className="text-[#C7F36B] stroke-[3]" />
          {course}
        </div>
      ))}
      <SmartInsight text="Your answers indicate a strong aptitude for logic-based disciplines. Computer Science will give you the broadest career flexibility over the next decade." />
    </FadeUp>
  );
};

const CollegeFitTool = () => {
  const [result, setResult] = useState(null);
  return (
    <div className="space-y-4">
      <select className="sid-input"><option value="">Select Fee Budget</option><option>&lt; 10 Lakhs Total</option><option>10 – 20 Lakhs Total</option></select>
      <select className="sid-input"><option value="">Campus Size Preference</option><option>Large (100+ Acres)</option><option>Boutique & Urban</option></select>
      <NeoBtn primary className="w-full" onClick={() => setResult([
        { name: 'SRM Institute', loc: 'Chennai', place: '85%' },
        { name: 'Manipal Univ.', loc: 'Manipal', place: '90%' },
      ])}>Process Criteria</NeoBtn>
      {result && (
        <FadeUp visible className="space-y-3 pt-2">
          {result.map((c, i) => (
            <div key={i} className="flex gap-3 p-3 border-2 border-[#0F172A] rounded-[10px] bg-slate-50 shadow-[2px_2px_0_#0F172A]">
              <div className="w-10 h-10 border-2 border-[#0F172A] rounded-md shrink-0 flex items-center justify-center bg-white text-[10px] font-black sid-mono">{c.name.substring(0, 2).toUpperCase()}</div>
              <div>
                <p className="font-bold text-sm text-[#0F172A]">{c.name}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{c.loc} • Placement: {c.place}</p>
              </div>
            </div>
          ))}
          <SmartInsight text="Manipal University edges out with higher placement % despite similar fees. Strong alumni network in core engineering sectors." />
        </FadeUp>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 7. VS COMPARISON TOOL
// ─────────────────────────────────────────────────────────────
const ComparisonTool = () => {
  const [colA, setColA] = useState('');
  const [colB, setColB] = useState('');
  const [result, setResult] = useState(null);

  const winners = [1, 0, 0, 1]; // index of winner per row (0=A, 1=B)
  const metrics = ['Avg Package', 'Total Fees', 'Placement %', 'Campus Size'];

  const handleCompare = () => {
    if (colA && colB) setResult({
      colA: { stats: ['₹8.5L', '₹12L', '92%', '250 Acres'] },
      colB: { stats: ['₹9.2L', '₹15L', '88%', '120 Acres'] },
      winnerLabels: [
        { label: 'Higher Package →', winner: colB },
        { label: 'Lower Fees →',     winner: colA },
        { label: 'Better Placement →', winner: colA },
        { label: 'Larger Campus →', winner: colA },
      ],
    });
  };

  return (
    <div className="space-y-4">
      {/* VS Layout */}
      <div className="flex items-center gap-3">
        <NeoInput placeholder="Institution A" value={colA} onChange={e => setColA(e.target.value)} />
        <div className="sid-vs-badge shrink-0">VS</div>
        <NeoInput placeholder="Institution B" value={colB} onChange={e => setColB(e.target.value)} />
      </div>
      <NeoBtn primary className="w-full" onClick={handleCompare}>Run Comparison <LuScale /></NeoBtn>

      {result && (
        <FadeUp visible className="space-y-4 pt-2">
          {/* Winner chips */}
          <div className="flex flex-wrap gap-2">
            {result.winnerLabels.map((w, i) => (
              <div key={i} className="flex items-center gap-1 px-3 py-1.5 border-2 border-[#0F172A] rounded-md bg-white text-[11px] font-bold shadow-[2px_2px_0_#0F172A]">
                <LuCheck size={12} className="text-[#C7F36B]" />
                <span className="text-slate-500">{w.label}</span>
                <span className="text-[#0F172A] font-black">{w.winner}</span>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-hidden border-2 border-[#0F172A] rounded-[10px] shadow-[4px_4px_0_#0F172A]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0F172A] text-white">
                <tr>
                  <th className="p-3 border-r-2 border-slate-700 text-slate-400 font-medium">Metric</th>
                  <th className="p-3 border-r-2 border-slate-700 font-bold truncate">{colA || 'College A'}</th>
                  <th className="p-3 font-bold truncate">{colB || 'College B'}</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {metrics.map((m, i) => (
                  <tr key={i} className="border-b-2 border-[#0F172A] last:border-0">
                    <td className="p-3 border-r-2 border-[#0F172A] font-bold text-slate-500">{m}</td>
                    <td className={`p-3 border-r-2 border-[#0F172A] sid-mono font-black ${winners[i] === 0 ? 'bg-[#C7F36B]/20' : ''}`}>
                      {result.colA.stats[i]}
                    </td>
                    <td className={`p-3 sid-mono font-black ${winners[i] === 1 ? 'bg-[#C7F36B]/20' : ''}`}>
                      {result.colB.stats[i]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <SmartInsight text={`Overall verdict: ${colA || 'College A'} leads in placement percentage and campus infrastructure. ${colB || 'College B'} offers a higher average package with a more urban campus experience.`} />
        </FadeUp>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 8. FLOATING AI ADVISOR
// ─────────────────────────────────────────────────────────────
const AIAdvisor = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Hi! I\'m your GuideXpert AI. Ask me anything about colleges, ranks, or courses.' }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  const SUGGESTIONS = [
    'My rank is 15k, what colleges?',
    'Best CSE colleges under 10 LPA fees?',
    'Should I prefer NIT or private college?',
  ];

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages(m => [...m, { from: 'user', text: msg },
      { from: 'ai', text: `Based on your query "${msg}", I recommend exploring our Rank Predictor and College Predictor tools above for personalized data-backed suggestions.` }
    ]);
    setInput('');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="sid-advisor-bubble bg-white border-2 border-[#0F172A] rounded-[14px] shadow-[6px_6px_0_#0F172A] w-80 flex flex-col overflow-hidden" style={{ maxHeight: '420px' }}>
          {/* Header */}
          <div className="bg-[#0F172A] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LuBot size={16} color="#C7F36B" />
              <span className="text-white font-black text-sm">GuideXpert AI</span>
              <span className="w-2 h-2 rounded-full bg-[#C7F36B]" style={{ animation: 'sid-pulse-dot 2s infinite' }}/>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white transition-colors"><LuX size={16} /></button>
          </div>

          {/* Chat body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]" style={{ maxHeight: '240px' }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-[10px] text-xs font-medium border-2 border-[#0F172A] shadow-[2px_2px_0_#0F172A] leading-relaxed
                  ${m.from === 'user' ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'bg-white text-[#0F172A]'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          <div className="px-3 pt-2 pb-1 flex gap-1 overflow-x-auto border-t border-slate-200 bg-white">
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => send(s)}
                className="shrink-0 text-[10px] font-bold px-2 py-1 border border-slate-300 rounded-md bg-[#F8FAFC] hover:bg-[#C7F36B]/20 transition-colors whitespace-nowrap">
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3 bg-white border-t-2 border-[#0F172A]">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask anything..."
              className="flex-1 bg-[#F8FAFC] border-2 border-[#0F172A] rounded-[8px] px-3 py-2 text-xs font-medium outline-none focus:bg-white transition-all"
            />
            <button onClick={() => send()} className="sid-btn sid-btn-primary px-3 py-2 text-xs rounded-[8px]">
              <LuSend size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="sid-btn sid-btn-primary px-5 py-3 text-sm rounded-[14px] flex items-center gap-2"
      >
        {open ? <LuX size={16} /> : <LuBot size={18} />}
        {!open && 'AI Advisor'}
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 9. MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function StudentsDashboard() {
  const [snapshotVisible, setSnapshotVisible] = useState(true);

  return (
    <div className="sid-page min-h-screen bg-[#F8FAFC]" style={{ colorScheme: 'light' }}>
      <style>{GLOBAL_CSS}</style>

      <HeroSection onDemoComplete={() => setSnapshotVisible(true)} />

      <SnapshotBar visible={snapshotVisible} />

      <ProgressJourney />

      {/* ── PREDICTORS ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-16 py-16">
        <div className="sid-section-label"><LuActivity size={12}/> Predictors</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ToolPanel title="Rank Predictor" subtitle="Data-driven rank estimation." icon={LuTrophy} accentColor="#B7E5FF">
            <RankPredictorTool />
          </ToolPanel>
          <ToolPanel title="College Predictor" subtitle="Algorithmic admission mapping." icon={LuSearch} accentColor="#F7B5B5">
            <CollegePredictorTool />
          </ToolPanel>
          <ToolPanel title="Branch Predictor" subtitle="Verify academic pathways." icon={LuRocket} accentColor="#FFE89A">
            <BranchPredictorTool />
          </ToolPanel>
        </div>
      </section>

      {/* ── DISCOVERY TOOLS ── */}
      <section className="bg-white border-y-2 border-[#0F172A]">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-16">
          <div className="sid-section-label"><LuGraduationCap size={12}/> Discovery Tools</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ToolPanel title="Course Fit Test" subtitle="Behavioral alignment assessment." icon={LuGraduationCap} accentColor="#C7F36B">
              <CourseFitTool />
            </ToolPanel>
            <ToolPanel title="Culture Fit" subtitle="Campus lifestyle matching." icon={LuMapPin} accentColor="#B7E5FF">
              <CollegeFitTool />
            </ToolPanel>
          </div>
        </div>
      </section>

      {/* ── DECISION TOOLS ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-16 py-16">
        <div className="sid-section-label"><LuScale size={12}/> Decision Tools</div>
        <div className="max-w-2xl">
          <ToolPanel title="Comparative Analysis" subtitle="Head-to-head metric evaluation." icon={LuScale} accentColor="#D8B4FE">
            <ComparisonTool />
          </ToolPanel>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#C7F36B] border-t-4 border-[#0F172A] py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <LuSparkles className="mx-auto mb-6 text-4xl text-[#0F172A]" />
          <h2 className="text-4xl md:text-5xl font-black text-[#0F172A] mb-6 tracking-tighter">
            Ready to optimize your<br />admission strategy?
          </h2>
          <p className="text-lg text-[#0F172A]/80 font-medium mb-10 max-w-xl mx-auto">
            Join 50,000+ students making data-backed decisions for their academic future.
          </p>
          <NeoBtn className="text-lg px-10 py-4 mx-auto bg-white shadow-[6px_6px_0_#0F172A] hover:-translate-y-1">
            Create Account — It's Free <LuArrowRight />
          </NeoBtn>
        </div>
      </section>

      <AIAdvisor />
    </div>
  );
}
