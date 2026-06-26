import { LuArrowRight } from 'react-icons/lu';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SECTION_THEMES } from './workspaceSectionThemes';
import { WorkspaceSectionArt } from './WorkspaceSectionArt';

const DARK_ICON_CLASS = {
  'bg-sky-50 text-sky-600': 'bg-sky-400/15 text-sky-300 ring-1 ring-sky-400/20',
  'bg-rose-50 text-rose-600': 'bg-rose-400/15 text-rose-300 ring-1 ring-rose-400/20',
  'bg-emerald-50 text-emerald-600': 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/20',
  'bg-violet-50 text-violet-600': 'bg-violet-400/15 text-violet-300 ring-1 ring-violet-400/20',
  'bg-amber-50 text-amber-600': 'bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/20',
  'bg-indigo-50 text-indigo-600': 'bg-indigo-400/15 text-indigo-300 ring-1 ring-indigo-400/20',
};

function resolveIconClass(iconClass, theme) {
  if (theme === 'light') return iconClass;
  return DARK_ICON_CLASS[iconClass] || 'bg-white/10 text-emerald-300 ring-1 ring-white/10';
}

export function ToolCard({ tool, cta = 'Open tool', compact = false, theme = 'light', showCategory = false }) {
  const t = SECTION_THEMES[theme];
  const Icon = tool.icon;
  const iconClass = resolveIconClass(tool.iconClass, theme);

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
      <Link
        to={tool.to}
        className={`group relative flex h-full flex-col rounded-2xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${t.card} ${
          compact ? 'p-5' : 'p-6'
        }`}
      >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div
          className={`flex shrink-0 items-center justify-center rounded-xl ${iconClass} ${compact ? 'h-10 w-10' : 'h-11 w-11'}`}
        >
          <Icon className={compact ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden />
        </div>
        {showCategory && tool.sectionLabel ? (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${t.categoryPill}`}>
            {tool.sectionLabel}
          </span>
        ) : null}
      </div>
      <h3 className={`font-semibold ${t.cardTitle} ${compact ? 'text-base' : 'text-lg'}`}>{tool.title}</h3>
      <p className={`mt-1.5 flex-1 leading-relaxed ${t.cardDescription} ${compact ? 'text-xs' : 'text-sm'}`}>
        {tool.description}
      </p>
      <span className={`mt-4 inline-flex items-center gap-1.5 text-sm font-medium transition group-hover:gap-2.5 ${t.cardCta}`}>
        {cta} <LuArrowRight className="h-4 w-4" aria-hidden />
      </span>
      </Link>
    </motion.div>
  );
}

export function SectionHeader({ section, count, theme = 'light' }) {
  const t = SECTION_THEMES[theme];
  const badgeClass = theme === 'dark' && section.badgeClassDark ? section.badgeClassDark : section.badgeClass;

  return (
    <div className={`mb-8 flex flex-col gap-4 border-b pb-8 sm:flex-row sm:items-end sm:justify-between ${t.headerBorder}`}>
      <div className="relative z-10 min-w-0 max-w-2xl">
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${badgeClass}`}>
          {section.badge}
        </span>
        <h3 id={`${section.id}-heading`} className={`mt-3 text-xl font-semibold tracking-tight sm:text-2xl ${t.title}`}>
          {section.label}
        </h3>
        <p className={`mt-2 text-sm leading-relaxed sm:text-base ${t.description}`}>{section.description}</p>
      </div>
      <p className={`relative z-10 shrink-0 text-sm font-medium ${t.count}`}>
        {count} tool{count === 1 ? '' : 's'}
      </p>
    </div>
  );
}

export default function WorkspaceSectionBand({ section, tools, theme, compact }) {
  const t = SECTION_THEMES[theme];
  const isDark = theme === 'dark';

  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-heading`}
      className={`relative overflow-hidden border-b ${isDark ? 'border-white/5' : 'border-slate-200/80'}`}
    >
      <div className={`relative ${t.band}`}>
        <div className="pointer-events-none absolute inset-0" style={{ background: t.gradient }} aria-hidden />
        <div
          className={`pointer-events-none absolute inset-0 ${t.gridOpacity}`}
          style={{
            backgroundImage: `linear-gradient(to right, ${t.gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${t.gridColor} 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
            maskImage: 'linear-gradient(to bottom, black 30%, transparent 95%)',
          }}
          aria-hidden
        />
        <WorkspaceSectionArt sectionId={section.id} dark={isDark} />

        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <SectionHeader section={section} count={tools.length} theme={theme} />
          <div className={`relative z-10 ${section.gridClass}`}>
            {tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={{ ...tool, sectionLabel: section.label }}
                cta={section.cta}
                compact={compact}
                theme={theme}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
