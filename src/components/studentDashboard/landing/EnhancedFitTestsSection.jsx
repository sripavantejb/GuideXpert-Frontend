import { motion } from 'framer-motion';
import { LuSparkles } from 'react-icons/lu';
import { FIT_TEST_HIGHLIGHTS } from './landingPageData';
import { ToolCard } from '../WorkspaceSectionBand';
import SectionBackdrop from './SectionBackdrop';
import Reveal from './Reveal';
import { fadeUp, defaultViewport, staggerContainer } from './motion';

export default function EnhancedFitTestsSection({ section, tools }) {
  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-heading`}
      className="relative overflow-hidden border-b border-white/5 bg-slate-900"
    >
      <SectionBackdrop dark />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${section.badgeClassDark}`}>
            {section.badge}
          </span>
          <h2 id={`${section.id}-heading`} className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {section.label}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">{section.description}</p>
        </Reveal>

        <motion.div
          className="mt-10 grid gap-4 sm:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={staggerContainer}
        >
          {FIT_TEST_HIGHLIGHTS.map((item) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm"
            >
              <LuSparkles className="h-5 w-5 text-emerald-400" aria-hidden />
              <h3 className="mt-3 font-semibold text-white">{item.title}</h3>
              <p className="mt-1.5 text-sm text-slate-400">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className={`relative z-10 mt-10 ${section.gridClass}`}>
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} cta={section.cta} theme="dark" />
          ))}
        </div>
      </div>
    </section>
  );
}
