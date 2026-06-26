import { Link } from 'react-router-dom';
import { LuArrowRight } from 'react-icons/lu';
import { Careers360NewsSection, Careers360CounsellingSection } from './Careers360NewsAndCounselling';
import { Careers360DataSection } from './Careers360DataSection';
import { Careers360PredictionSection, Careers360OtherProducts } from './Careers360PredictionSection';
import Careers360ImpactSection, { Careers360CommunityCTA } from './Careers360ImpactSection';
import Careers360ExamStrip from './Careers360Shared';
import { ToolCard } from '../landing/LandingWorkspaceSections';
import { getSectionTheme } from '../workspaceSectionThemes';
import { WORKSPACE_SECTIONS } from '../../../constants/studentWorkspaceTools';
import { LAYOUT } from './careers360Theme';

function OrganicLeadCard({ organicLead }) {
  if (!organicLead) return null;
  return (
    <section className="border-b border-[#ffe0cc] bg-[#fff8f3] py-6">
      <div className={LAYOUT.container}>
        <div className="flex flex-col gap-5 rounded-xl border border-[#ffd4b8] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#f27921]">Continue where you left off</p>
            <p className="mt-1.5 font-semibold text-[#333]">
              {organicLead.examName} · score {organicLead.score}
            </p>
          </div>
          <Link
            to={
              organicLead.examId
                ? `/students/rank-predictor/${organicLead.examId}`
                : '/students/rank-predictor'
            }
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: '#f27921' }}
          >
            Resume prediction <LuArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function SearchResultsPanel({ filteredBySection, filteredTools, onClearSearch }) {
  if (filteredTools.length === 0) {
    return (
      <section className={`${LAYOUT.sectionCompact} bg-white`}>
        <div className={`${LAYOUT.container} text-center`}>
          <p className="text-[#666]">No tools match your search.</p>
          <button
            type="button"
            onClick={onClearSearch}
            className="mt-5 rounded-lg px-5 py-2.5 text-sm font-medium text-white"
            style={{ backgroundColor: '#333' }}
          >
            Clear search
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={`${LAYOUT.sectionCompact} bg-white`}>
      <div className={`${LAYOUT.container} space-y-12`}>
        {WORKSPACE_SECTIONS.map((section, index) => {
          const tools = filteredBySection[section.id];
          if (!tools?.length) return null;
          return (
            <div key={section.id}>
              <h3 className="mb-5 text-lg font-bold text-[#333]">
                {section.label} <span className="text-sm font-normal text-[#999]">({tools.length})</span>
              </h3>
              <div className={section.gridClass}>
                {tools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    cta={section.cta}
                    compact={section.id === 'rank-predictors'}
                    theme={getSectionTheme(index)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function Careers360StyleHome({
  organicLead,
  hasSearch,
  filteredTools,
  filteredBySection,
  onClearSearch,
}) {
  return (
    <div id="student-workspace" className="bg-white">
      <Careers360ExamStrip />
      <OrganicLeadCard organicLead={organicLead} />
      <Careers360NewsSection />

      {hasSearch ? (
        <SearchResultsPanel
          filteredBySection={filteredBySection}
          filteredTools={filteredTools}
          onClearSearch={onClearSearch}
        />
      ) : (
        <>
          <Careers360CounsellingSection />
          <Careers360DataSection />
          <Careers360PredictionSection />
          <Careers360OtherProducts />
          <Careers360ImpactSection />
          <Careers360CommunityCTA />
        </>
      )}
    </div>
  );
}
