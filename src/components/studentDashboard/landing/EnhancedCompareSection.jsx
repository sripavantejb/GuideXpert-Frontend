import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LuArrowRight, LuScale } from 'react-icons/lu';
import { COMPARE_PREVIEW } from './landingPageData';
import { ToolCard } from '../WorkspaceSectionBand';
import SectionBackdrop from './SectionBackdrop';
import Reveal from './Reveal';
import { defaultViewport } from './motion';

function CompareBar({ label, left, right }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
        <span>{label}</span>
        <span className="text-slate-400">Higher is better</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-blue-500">
            {COMPARE_PREVIEW.left.name}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
              initial={{ width: 0 }}
              whileInView={{ width: `${left}%` }}
              viewport={defaultViewport}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-violet-500">
            {COMPARE_PREVIEW.right.name}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400"
              initial={{ width: 0 }}
              whileInView={{ width: `${right}%` }}
              viewport={defaultViewport}
              transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EnhancedCompareSection({ section, tools }) {
  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-heading`}
      className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white via-slate-50/60 to-white"
    >
      <SectionBackdrop dark={false} particles={false} />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
          <Reveal>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${section.badgeClass}`}>
              {section.badge}
            </span>
            <h2 id={`${section.id}-heading`} className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {section.label}
            </h2>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">{section.description}</p>

            <div className="mt-8 space-y-5">
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} cta={section.cta} theme="light" />
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-600">{COMPARE_PREVIEW.left.name}</p>
                  <p className="text-xs text-slate-400">{COMPARE_PREVIEW.left.short}</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <LuScale className="h-5 w-5" aria-hidden />
                </span>
                <div className="text-center">
                  <p className="text-lg font-bold text-violet-600">{COMPARE_PREVIEW.right.name}</p>
                  <p className="text-xs text-slate-400">{COMPARE_PREVIEW.right.short}</p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {COMPARE_PREVIEW.metrics.map((metric) => (
                  <CompareBar key={metric.label} {...metric} />
                ))}
              </div>

              <Link
                to="/students/college-comparison"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Compare colleges <LuArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
