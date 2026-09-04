import { useEffect, useRef, useState } from 'react';
import { animate, motion } from 'framer-motion';
import { FiUsers, FiTrendingUp, FiActivity } from 'react-icons/fi';
import { MOTION_EASE } from '../../../pages/admin/webinar-progress/webinarProgressShared';

function AnimatedNumber({ value, decimals = 0, reduced, suffix = '' }) {
  const [display, setDisplay] = useState(reduced ? value : 0);
  const currentRef = useRef(reduced ? Number(value) || 0 : 0);

  useEffect(() => {
    const target = Number(value) || 0;
    if (reduced) {
      currentRef.current = target;
      setDisplay(target);
      return undefined;
    }
    const controls = animate(currentRef.current, target, {
      duration: 0.7,
      ease: MOTION_EASE,
      onUpdate: (v) => {
        currentRef.current = v;
        setDisplay(decimals > 0 ? Math.round(v * 10) / 10 : Math.round(v));
      },
    });
    return () => controls.stop();
  }, [value, reduced, decimals]);

  const formatted =
    decimals > 0 ? display.toFixed(decimals) : Number(display).toLocaleString('en-IN');
  return (
    <span className="tabular-nums">
      {formatted}
      {suffix}
    </span>
  );
}

function RadialProgress({ percent, reduced, empty }) {
  const size = 168;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = c * (1 - clamped / 100);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e8eef5"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#tpRadial)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: reduced ? offset : c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: reduced ? 0 : 0.9, ease: MOTION_EASE, delay: reduced ? 0 : 0.2 }}
        />
        <defs>
          <linearGradient id="tpRadial" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4d8ec7" />
            <stop offset="100%" stopColor="#003366" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-semibold tracking-tight text-slate-900">
          <AnimatedNumber value={clamped} reduced={reduced} suffix="%" />
        </p>
        <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
          {empty ? 'Awaiting trainees' : 'Cohort complete'}
        </p>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, subtitle, delay, reduced, decimals = 0, suffix = '' }) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: MOTION_EASE, delay }}
      className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_8px_30px_rgba(4,30,48,0.06)] backdrop-blur-md"
    >
      <div
        className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-primary-blue-100/80 to-transparent opacity-80"
        aria-hidden
      />
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-navy/8 text-primary-navy">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
        <AnimatedNumber value={value} reduced={reduced} decimals={decimals} suffix={suffix} />
      </p>
      {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
    </motion.div>
  );
}

function HeroSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)]">
      <div className="h-[240px] animate-pulse rounded-2xl bg-slate-200/60" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[140px] animate-pulse rounded-2xl bg-slate-200/60" />
        ))}
      </div>
    </div>
  );
}

export default function HeroMetrics({ stats, loading, reducedMotion }) {
  if (loading && !stats) return <HeroSkeleton />;

  const enrolled = stats?.totalEnrolled ?? 0;
  const completed = stats?.fullyCompleted ?? 0;
  const avg = stats?.averagePercent ?? 0;
  const active = stats?.activeLast24h ?? 0;
  const empty = enrolled === 0;
  const completionPct = empty ? 0 : Math.round((completed / enrolled) * 100);
  const radialPct = empty ? 0 : (completed > 0 ? completionPct : Math.round(avg));

  return (
    <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(280px,1.05fr)_minmax(0,1.7fr)]">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: MOTION_EASE }}
        className="relative overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-white via-white to-primary-blue-50/80 p-6 shadow-[0_12px_40px_rgba(4,30,48,0.08)]"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-navy/70">
          Command center
        </p>
        <p className="mt-1 text-sm font-medium text-slate-600">Overall completion</p>
        <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
          <RadialProgress percent={radialPct} reduced={reducedMotion} empty={empty} />
          <div className="w-full space-y-2 text-sm sm:max-w-[180px]">
            <div className="flex justify-between text-slate-600">
              <span>Finished</span>
              <span className="font-semibold tabular-nums text-slate-900">{completed}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Enrolled</span>
              <span className="font-semibold tabular-nums text-slate-900">{enrolled}</span>
            </div>
            {empty ? (
              <p className="pt-1 text-xs leading-relaxed text-slate-400">
                The 26–27 list is empty until someone logs into the webinar.
              </p>
            ) : (
              <p className="pt-1 text-xs text-slate-400">
                {completionPct}% of enrolled trainees have finished every module.
              </p>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          icon={FiUsers}
          label="Total enrolled"
          value={enrolled}
          subtitle={empty ? 'Waiting for first login' : `${completed} fully complete`}
          delay={reducedMotion ? 0 : 0.08}
          reduced={reducedMotion}
        />
        <MetricCard
          icon={FiTrendingUp}
          label="Avg. progress"
          value={avg}
          decimals={1}
          suffix="%"
          subtitle="Across all modules"
          delay={reducedMotion ? 0 : 0.14}
          reduced={reducedMotion}
        />
        <MetricCard
          icon={FiActivity}
          label="Active 24h"
          value={active}
          subtitle="Last activity window"
          delay={reducedMotion ? 0 : 0.2}
          reduced={reducedMotion}
        />
      </div>
    </div>
  );
}
