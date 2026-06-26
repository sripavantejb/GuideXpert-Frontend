import { WORKSPACE_SECTIONS } from '../../../constants/studentWorkspaceTools';
import WorkspaceSectionBand, { SectionHeader, ToolCard } from '../WorkspaceSectionBand';
import SectionBackdrop from './SectionBackdrop';
import RankPredictorCard from './RankPredictorCard';
import EnhancedFitTestsSection from './EnhancedFitTestsSection';
import EnhancedCompareSection from './EnhancedCompareSection';

export function EnhancedRankPredictorSection({ section, tools }) {
  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-heading`}
      className="relative overflow-hidden border-b border-white/5 bg-slate-900"
    >
      <SectionBackdrop dark />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <SectionHeader section={section} count={tools.length} theme="dark" />
        <div className={`relative z-10 ${section.gridClass}`}>
          {tools.map((tool) => (
            <RankPredictorCard key={tool.id} tool={tool} cta={section.cta} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function getLandingSections() {
  return {
    rank: WORKSPACE_SECTIONS.find((s) => s.id === 'rank-predictors'),
    admission: WORKSPACE_SECTIONS.find((s) => s.id === 'admission-predictors'),
    fit: WORKSPACE_SECTIONS.find((s) => s.id === 'fit-tests'),
    compare: WORKSPACE_SECTIONS.find((s) => s.id === 'compare'),
  };
}

export function AdmissionPredictorsSection({ section, tools }) {
  return <WorkspaceSectionBand section={section} tools={tools} theme="light" compact={false} />;
}

export { EnhancedFitTestsSection, EnhancedCompareSection, ToolCard };
