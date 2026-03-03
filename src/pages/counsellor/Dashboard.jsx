import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiBookOpen,
  FiCalendar,
  FiClipboard,
  FiBarChart2,
  FiTarget,
  FiTrendingUp,
  FiClock,
  FiArrowRight,
  FiArrowUpRight,
  FiArrowDownRight,
  FiStar,
  FiCheckCircle,
  FiAward,
  FiZap,
  FiCompass,
  FiBriefcase,
} from 'react-icons/fi';
import { useCounsellorProfile } from '../../contexts/CounsellorProfileContext';
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

const performanceKPIs = [
  { label: 'Students Counseled', value: '342', change: '+18', up: true, icon: FiUsers },
  { label: 'Admission Success', value: '87%', change: '+4.2%', up: true, icon: FiCheckCircle },
  { label: 'Session Completion', value: '94%', change: '+1.1%', up: true, icon: FiCalendar },
  { label: 'Satisfaction Score', value: '4.8', change: '+0.2', up: true, icon: FiStar },
];

/* ───────── Section Header ───────── */

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-1 h-6 rounded-full bg-primary-navy" />
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>
      {subtitle && (
        <p className="text-sm text-gray-500 ml-4">{subtitle}</p>
      )}
    </div>
  );
}

/* ───────── Sub-Components ───────── */

function StatCard({ label, value, icon: Icon, accent, pill, progress }) {
  const styles = accentStyles[accent] || accentStyles.blue;
  const hasProgress = progress != null && !pill;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white transition-all duration-300 cursor-default portal-card portal-card-hover">
      {/* Top accent bar */}
      <div
        className="h-[3px] shrink-0"
        style={{ background: `linear-gradient(90deg, ${styles.accent} 0%, transparent 100%)` }}
      />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/5 shadow-card ${styles.iconBg}`}>
            <Icon className={`h-5 w-5 ${styles.iconColor}`} />
          </div>
          <p className="text-right text-3xl font-extrabold tabular-nums tracking-tight text-gray-900">{value}</p>
        </div>

        <p className="mt-3 text-[0.8125rem] font-medium leading-snug text-gray-600">{label}</p>

        <div className="mt-4 min-h-[3.25rem] flex flex-col justify-end">
          {pill && (
            <span className="inline-flex w-fit items-center rounded-lg bg-slate-100/90 px-2.5 py-1 text-xs font-medium text-gray-600">
              {pill}
            </span>
          )}
          {hasProgress && (
            <div>
              <div className="mb-1.5 flex items-center justify-between text-[0.6875rem] font-medium text-gray-500">
                <span>Weekly goal</span>
                <span className="text-gray-700">{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${styles.bar}`}
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
    </div>
  );
}

function FeatureCard({ title, desc, icon: Icon, bg, iconColor, link }) {
  return (
    <Link
      to={link}
      className="portal-card portal-card-hover group flex flex-col rounded-xl bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary-navy/15"
    >
      <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${bg}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <h3 className="mb-1 text-base font-bold text-gray-900">{title}</h3>
      <p className="flex-1 text-sm leading-relaxed text-gray-500">{desc}</p>
      <div className="mt-4">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary-navy/5 px-3 py-1.5 text-xs font-semibold text-primary-navy transition-colors group-hover:bg-primary-navy/10">
          Open <FiArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}

function ToolCard({ title, desc, icon: Icon, accuracy }) {
  return (
    <div className="portal-card portal-card-hover rounded-xl bg-white p-6 transition-all duration-200 hover:-translate-y-0.5">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-navy/10">
          <Icon className="w-5 h-5 text-primary-navy" />
        </div>
        {accuracy && (
          <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            {accuracy} accuracy
          </span>
        )}
      </div>
      <h4 className="mb-1 text-base font-bold text-gray-900">{title}</h4>
      <p className="mb-5 text-sm leading-relaxed text-gray-500">{desc}</p>
      <button type="button" className="inline-flex items-center gap-1.5 rounded-lg bg-primary-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-navy/90">
        Launch Tool <FiArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function KPICard({ label, value, change, up, icon: Icon }) {
  return (
    <div className="portal-card portal-card-hover rounded-xl bg-white p-6 transition-shadow duration-200">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-navy/10">
          <Icon className="h-4.5 w-4.5 text-primary-navy" />
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

/* ───────── Main Dashboard ───────── */

export default function CounsellorDashboard() {
  const { displayName } = useCounsellorProfile();

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
              <p className="text-sm font-medium text-gray-500">Welcome back, {displayName}</p>
              <div className="h-px w-12 bg-gray-200" />
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-semibold uppercase tracking-wider shadow-sm bg-gradient-to-r from-primary-navy to-sidebar-blue">
                  <FiAward className="w-4 h-4" />
                  Certified Counsellor
                </span>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary-navy">
                  Professional Tools Portal
                </h2>
                <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-primary-navy to-sidebar-blue" />
              </div>
              <p className="text-base text-gray-500 font-medium">Manage your counseling practice efficiently</p>
            </div>

            {/* Right: purposeful CTA + mini stats */}
            <div className="hidden lg:flex shrink-0 flex-col items-end gap-3">
              <Link
                to="/counsellor/sessions"
                className="portal-card portal-card-hover flex items-center gap-3 rounded-xl bg-white/90 px-5 py-4 transition-all duration-200 hover:bg-white"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-navy/10">
                  <FiCalendar className="h-6 w-6 text-primary-navy" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">View today&apos;s sessions</p>
                  <p className="text-xs text-gray-500">Next: Today 2 PM</p>
                </div>
                <FiArrowRight className="h-5 w-5 text-gray-400 shrink-0" />
              </Link>
              <div className="portal-card flex gap-4 rounded-xl bg-white/80 px-4 py-3">
                <div className="text-center">
                  <p className="text-xl font-bold tabular-nums text-primary-navy">12</p>
                  <p className="text-[0.6875rem] font-medium text-gray-500">Upcoming</p>
                </div>
                <div className="w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-xl font-bold tabular-nums text-primary-navy">3</p>
                  <p className="text-[0.6875rem] font-medium text-gray-500">Action needed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
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

      {/* ── Section D: Performance Dashboard ── */}
      <div>
        <SectionHeader title="Performance Dashboard" subtitle="Track your progress and impact" />

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {performanceKPIs.map((k) => (
            <KPICard key={k.label} {...k} />
          ))}
        </div>

      </div>

      {/* Bottom spacer */}
      <div className="h-6" />
    </div>
  );
}
