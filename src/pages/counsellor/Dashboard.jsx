import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiBookOpen,
  FiCalendar,
  FiClipboard,
  FiFolder,
  FiBarChart2,
  FiTarget,
  FiTrendingUp,
  FiClock,
  FiArrowRight,
  FiArrowUpRight,
  FiArrowDownRight,
  FiActivity,
  FiEye,
  FiMail,
  FiStar,
  FiCheckCircle,
  FiAward,
  FiZap,
  FiCompass,
  FiBriefcase,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/* ───────── Static / Demo Data ───────── */

const accentStyles = {
  blue: { bar: 'bg-blue-500', iconBg: 'bg-blue-50', iconColor: 'text-blue-600', accent: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.2)' },
  emerald: { bar: 'bg-emerald-500', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', accent: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.2)' },
  amber: { bar: 'bg-amber-500', iconBg: 'bg-amber-50', iconColor: 'text-amber-600', accent: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.2)' },
  violet: { bar: 'bg-violet-500', iconBg: 'bg-violet-50', iconColor: 'text-violet-600', accent: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.2)' },
};

const stats = [
  { label: 'Active Students', value: '142', icon: FiUsers, accent: 'blue', pill: '+5 this week', progress: null },
  { label: 'Ongoing Admissions', value: '38', icon: FiBookOpen, accent: 'emerald', pill: '3 action needed', progress: null },
  { label: 'Upcoming Sessions', value: '12', icon: FiCalendar, accent: 'amber', pill: 'Next: Today 2 PM', progress: null },
  { label: 'Conversion Rate', value: '73%', icon: FiTrendingUp, accent: 'violet', pill: null, progress: 73 },
];

const featureCards = [
  {
    title: 'Student Management',
    desc: 'Manage student profiles, documents, and status tracking all in one place.',
    icon: FiUsers,
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    link: '/counsellor/students',
  },
  {
    title: 'Admissions Tracker',
    desc: 'Track college applications, course selections, deadlines, and stages.',
    icon: FiBookOpen,
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    link: '/counsellor/admissions',
  },
  {
    title: 'Session Scheduler',
    desc: 'Schedule meetings, set availability, and integrate with Google Meet / Zoom.',
    icon: FiCalendar,
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    link: '/counsellor/sessions',
  },
  {
    title: 'Assessment Tools',
    desc: 'Aptitude, interest, and readiness tests to evaluate student potential.',
    icon: FiClipboard,
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    link: '/counsellor/tools',
  },
  {
    title: 'Resource Library',
    desc: 'Access PDFs, videos, notes, and templates for counseling sessions.',
    icon: FiFolder,
    bg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    link: '/counsellor/resources',
  },
  {
    title: 'Reports & Insights',
    desc: 'View performance trends, success metrics, and detailed analytics.',
    icon: FiBarChart2,
    bg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    link: '/counsellor/reports',
  },
];

const toolCards = [
  {
    title: 'College Predictor',
    desc: 'Suggest colleges based on rank, region, budget and preferences.',
    icon: FiTarget,
    accuracy: '92%',
  },
  {
    title: 'Rank Predictor',
    desc: 'Predict expected rank from exam performance scores.',
    icon: FiBarChart2,
    accuracy: '88%',
  },
  {
    title: 'Exam Predictor',
    desc: 'Suggest suitable exams based on student profile and strengths.',
    icon: FiZap,
    accuracy: '85%',
  },
  {
    title: 'Deadline Manager',
    desc: 'Track important exam and admission deadlines at a glance.',
    icon: FiClock,
    accuracy: null,
  },
];

const marketingMetrics = [
  { label: 'Profile Views', value: '2,847', change: '+12.5%', up: true, icon: FiEye },
  { label: 'Lead Generation', value: '164', change: '+8.3%', up: true, icon: FiTrendingUp },
  { label: 'Active Campaigns', value: '5', change: '+2', up: true, icon: FiActivity },
  { label: 'Student Inquiries', value: '47', change: '-3.1%', up: false, icon: FiMail },
];

const performanceKPIs = [
  { label: 'Students Counseled', value: '342', change: '+18', up: true, icon: FiUsers },
  { label: 'Admission Success', value: '87%', change: '+4.2%', up: true, icon: FiCheckCircle },
  { label: 'Session Completion', value: '94%', change: '+1.1%', up: true, icon: FiCalendar },
  { label: 'Satisfaction Score', value: '4.8', change: '+0.2', up: true, icon: FiStar },
];

const monthlyTrend = [
  { month: 'Aug', students: 28, admissions: 12 },
  { month: 'Sep', students: 35, admissions: 18 },
  { month: 'Oct', students: 42, admissions: 22 },
  { month: 'Nov', students: 38, admissions: 25 },
  { month: 'Dec', students: 50, admissions: 30 },
  { month: 'Jan', students: 58, admissions: 34 },
  { month: 'Feb', students: 64, admissions: 38 },
];

const monthlyComparison = [
  { month: 'Aug', thisYear: 28, lastYear: 22 },
  { month: 'Sep', thisYear: 35, lastYear: 28 },
  { month: 'Oct', thisYear: 42, lastYear: 34 },
  { month: 'Nov', thisYear: 38, lastYear: 30 },
  { month: 'Dec', thisYear: 50, lastYear: 40 },
  { month: 'Jan', thisYear: 58, lastYear: 44 },
  { month: 'Feb', thisYear: 64, lastYear: 48 },
];

/* ───────── Section Header ───────── */

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-1 h-6 rounded-full bg-[#003366]" />
        <h3 className="text-lg font-extrabold text-[#0f172a]">{title}</h3>
      </div>
      {subtitle && (
        <p className="text-[0.8125rem] text-gray-500 ml-4">{subtitle}</p>
      )}
    </div>
  );
}

/* ───────── Sub-Components ───────── */

function StatCard({ label, value, icon: Icon, accent, pill, progress }) {
  const styles = accentStyles[accent] || accentStyles.blue;
  const hasProgress = progress != null && !pill;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-white transition-all duration-300 cursor-default"
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        border: '1px solid rgba(226,232,240,0.8)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)';
        e.currentTarget.style.borderColor = styles.border;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)';
        e.currentTarget.style.borderColor = 'rgba(226,232,240,0.8)';
      }}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${styles.accent} 0%, transparent 100%)` }}
      />
      <div className="p-6 pt-7">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`w-12 h-12 rounded-xl ${styles.iconBg} flex items-center justify-center shrink-0 ring-1 ring-black/5`}
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
          >
            <Icon className={`w-5 h-5 ${styles.iconColor}`} />
          </div>
          <p className="text-3xl font-extrabold text-gray-900 tracking-tight tabular-nums">{value}</p>
        </div>

        <p className="text-[0.8125rem] font-medium text-gray-600 mt-3">{label}</p>

        {pill && (
          <span
            className="inline-flex items-center mt-2.5 text-xs font-medium px-2.5 py-1 rounded-lg text-gray-600"
            style={{ background: 'rgba(241,245,249,0.9)' }}
          >
            {pill}
          </span>
        )}

        {hasProgress && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-[0.6875rem] font-medium text-gray-500 mb-1.5">
              <span>Weekly goal</span>
              <span className="text-gray-700">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${styles.bar} rounded-full transition-all duration-500 ease-out`}
                style={{
                  width: `${progress}%`,
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.2) inset',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureCard({ title, desc, icon: Icon, bg, iconColor, link }) {
  return (
    <Link
      to={link}
      className="group bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 hover:border-[#003366]/15 transition-all duration-200 flex flex-col"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mb-4`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <h3 className="text-[0.95rem] font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 flex-1 leading-relaxed">{desc}</p>
      <div className="mt-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#003366]/[0.04] text-[#003366] text-xs font-semibold group-hover:bg-[#003366]/[0.08] transition-colors">
          Open <FiArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}

function ToolCard({ title, desc, icon: Icon, accuracy }) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-[#003366]/[0.06] flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#003366]" />
        </div>
        {accuracy && (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            {accuracy} accuracy
          </span>
        )}
      </div>
      <h4 className="text-[0.95rem] font-bold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-500 mb-5 leading-relaxed">{desc}</p>
      <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#003366] text-white text-xs font-semibold rounded-lg hover:bg-[#004080] transition-colors">
        Launch Tool <FiArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function MetricCard({ label, value, change, up, icon: Icon }) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-gray-600" />
        </div>
        <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {up ? <FiArrowUpRight className="w-3.5 h-3.5" /> : <FiArrowDownRight className="w-3.5 h-3.5" />}
          {change}
        </span>
      </div>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function KPICard({ label, value, change, up, icon: Icon }) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-[#003366]/[0.06] flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-[#003366]" />
        </div>
        <span className="text-[0.8125rem] text-gray-500 font-medium">{label}</span>
      </div>
      <div className="flex items-end gap-2.5">
        <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</p>
        <span className={`inline-flex items-center gap-0.5 text-[0.6875rem] font-semibold mb-1 px-2 py-0.5 rounded-full ${up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {up ? <FiArrowUpRight className="w-3 h-3" /> : <FiArrowDownRight className="w-3 h-3" />}
          {change} vs last month
        </span>
      </div>
    </div>
  );
}

/* ───────── Custom Tooltip ───────── */

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
      <p className="font-bold text-gray-900 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-gray-600">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color }} />
          {entry.name}: <span className="font-semibold text-gray-900">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ───────── Main Dashboard ───────── */

export default function CounsellorDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-12">

      {/* ── Section A: Hero + Stats ── */}
      <div>
        {/* Hero backdrop — rich gradient orbs so glass blur reads clearly */}
        <div
          className="relative -mx-2 -mt-2 mb-0 rounded-2xl overflow-hidden"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 30%, rgba(29,78,216,0.12) 0%, transparent 60%),
              radial-gradient(ellipse 70% 50% at 85% 60%, rgba(0,51,102,0.1) 0%, transparent 55%),
              radial-gradient(ellipse 50% 40% at 60% 20%, rgba(59,130,246,0.08) 0%, transparent 50%),
              linear-gradient(180deg, rgba(248,250,252,0.9) 0%, rgba(241,245,249,1) 100%)
            `,
          }}
        >
        {/* Hero Panel — True frosted glass */}
        <div
          className="relative mb-8 mx-2 mt-2 rounded-2xl p-8 lg:p-10 overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.65)',
            boxShadow: `
              0 8px 32px rgba(0,0,0,0.08),
              0 0 0 1px rgba(255,255,255,0.4) inset,
              0 1px 0 0 rgba(255,255,255,0.8) inset
            `,
          }}
        >
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Left: content — unchanged */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-500">Welcome back, Dr. Counsellor</p>
              <div className="h-px w-12 bg-gray-200" />
              <div className="flex items-center gap-2.5">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-semibold uppercase tracking-wider shadow-sm"
                  style={{ background: 'linear-gradient(to right, #003366, #1d4ed8)' }}
                >
                  <FiAward className="w-4 h-4" />
                  Certified Counsellor
                </span>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: '#003366' }}>
                  Professional Tools Portal
                </h2>
                <div
                  className="mt-2 h-1 w-24 rounded-full"
                  style={{ background: 'linear-gradient(to right, #003366, #1d4ed8)' }}
                />
              </div>
              <p className="text-base text-gray-500 font-medium">Manage your counseling practice efficiently</p>
            </div>

            {/* Right: Soft glass panels — depth layers, no icons */}
            <div
              className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 w-[35%] max-w-[240px] h-32 pointer-events-none select-none items-center justify-center"
              aria-hidden
            >
              <div className="relative w-full h-full">
                {/* Panel 1 — back layer */}
                <div
                  className="absolute w-[85%] h-20 rounded-2xl"
                  style={{
                    left: '0',
                    top: '50%',
                    transform: 'translateY(-50%) rotate(-3deg)',
                    background: 'rgba(255,255,255,0.35)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
                  }}
                />
                {/* Panel 2 */}
                <div
                  className="absolute w-[80%] h-20 rounded-2xl"
                  style={{
                    right: '0',
                    top: '45%',
                    transform: 'translateY(-50%) rotate(2deg)',
                    background: 'rgba(248,250,252,0.3)',
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                    border: '1px solid rgba(255,255,255,0.55)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.025)',
                  }}
                />
                {/* Panel 3 */}
                <div
                  className="absolute w-[75%] h-16 rounded-2xl left-1/2 -translate-x-1/2"
                  style={{
                    top: '52%',
                    transform: 'translate(-50%, -50%) rotate(-1deg)',
                    background: 'rgba(241,245,249,0.28)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.5)',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.02)',
                  }}
                />
                {/* Panel 4 — front, smallest */}
                <div
                  className="absolute w-[60%] h-12 rounded-xl left-1/2 -translate-x-1/2"
                  style={{
                    top: '48%',
                    transform: 'translate(-50%, -50%) rotate(1.5deg)',
                    background: 'rgba(255,255,255,0.22)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.45)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.015)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </div>

      {/* ── Section B: Core Feature Cards ── */}
      <div>
        <SectionHeader title="Quick Access" subtitle="Your core counseling tools and modules" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureCards.map((c) => (
            <FeatureCard key={c.title} {...c} />
          ))}
        </div>
      </div>

      {/* ── Section C: Advanced Counselor Tools ── */}
      <div>
        <SectionHeader title="Comprehensive Counselor Tools" subtitle="All-in-one platform for managing your counseling practice" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {toolCards.map((t) => (
            <ToolCard key={t.title} {...t} />
          ))}
        </div>
      </div>

      {/* ── Section D: Marketing Support ── */}
      <div className="bg-[#f8fafc] rounded-2xl border border-gray-100 p-6 lg:p-8">
        <SectionHeader title="Marketing Support" subtitle="Get help reaching more students" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {marketingMetrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Link
            to="/counsellor/marketing"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#003366] text-white text-xs font-semibold rounded-lg hover:bg-[#004080] transition-colors"
          >
            View Marketing Dashboard <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Section E: Performance Dashboard ── */}
      <div>
        <SectionHeader title="Performance Dashboard" subtitle="Track your progress and impact" />

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {performanceKPIs.map((k) => (
            <KPICard key={k.label} {...k} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart — Monthly Trend */}
          <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h4 className="text-sm font-bold text-gray-800 mb-4">Monthly Trend</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="students"
                    stroke="#003366"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#003366', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#003366', strokeWidth: 2, stroke: '#fff' }}
                    name="Students"
                  />
                  <Line
                    type="monotone"
                    dataKey="admissions"
                    stroke="#16a34a"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }}
                    name="Admissions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-5 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <span className="w-3 h-[3px] bg-[#003366] rounded inline-block" /> Students
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <span className="w-3 h-[3px] bg-emerald-600 rounded inline-block" /> Admissions
              </span>
            </div>
          </div>

          {/* Bar Chart — Year over Year */}
          <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h4 className="text-sm font-bold text-gray-800 mb-4">Year-over-Year Comparison</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyComparison} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="thisYear" fill="#003366" name="This Year" radius={[4, 4, 0, 0]} barSize={22} />
                  <Bar dataKey="lastYear" fill="#c2d7eb" name="Last Year" radius={[4, 4, 0, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-5 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <span className="w-3 h-3 bg-[#003366] rounded-sm inline-block" /> This Year
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <span className="w-3 h-3 bg-[#c2d7eb] rounded-sm inline-block" /> Last Year
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="h-6" />
    </div>
  );
}
