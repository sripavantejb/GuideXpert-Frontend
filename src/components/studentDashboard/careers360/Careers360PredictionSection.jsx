import { Link } from 'react-router-dom';
import { LuCalendar, LuRocket, LuScale, LuZap } from 'react-icons/lu';
import {
  getCollegePredictorLinks,
  getRankPredictorLinks,
  OTHER_PRODUCTS,
  SECTION_COPY,
} from './careers360HomeData';
import { HubSectionShell, LinkPillGrid } from './Careers360Shared';
import { LAYOUT } from './careers360Theme';

const PRODUCT_ICONS = {
  compare: LuScale,
  fit: LuZap,
  calendar: LuCalendar,
};

export function Careers360PredictionSection() {
  const collegeLinks = getCollegePredictorLinks();
  const rankLinks = getRankPredictorLinks();
  const { title, description } = SECTION_COPY.predictors;

  return (
    <HubSectionShell id="rank-predictors" variant="gray" title={title} description={description}>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className={LAYOUT.card}>
          <h3 className="text-sm font-bold text-[#333]">College shortlists</h3>
          <p className="mt-2 text-xs leading-relaxed text-[#666]">
            Build lists from rank, category, and domicile using cutoff history.
          </p>
          <div className="mt-5 max-h-60 overflow-y-auto pr-1">
            <LinkPillGrid links={collegeLinks} columns={2} />
          </div>
        </div>
        <div className={LAYOUT.card}>
          <h3 className="text-sm font-bold text-[#333]">Rank from marks</h3>
          <p className="mt-2 text-xs leading-relaxed text-[#666]">
            Estimate rank before official results for supported entrance exams.
          </p>
          <div className="mt-5 max-h-60 overflow-y-auto pr-1">
            <LinkPillGrid links={rankLinks} columns={2} />
          </div>
        </div>
      </div>
    </HubSectionShell>
  );
}

export function Careers360OtherProducts() {
  const { title, description } = SECTION_COPY.moreTools;

  return (
    <section className={`${LAYOUT.section} bg-white`}>
      <div className={LAYOUT.container}>
        <div className="mb-8 max-w-2xl">
          <h2 className="text-xl font-bold text-[#333] sm:text-2xl">{title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#666]">{description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {OTHER_PRODUCTS.map((product) => {
            const Icon = PRODUCT_ICONS[product.icon] || LuRocket;
            return (
              <Link
                key={product.id}
                to={product.to}
                className="group flex flex-col items-center rounded-xl border border-[#e8eaed] bg-[#fafbfc] px-4 py-6 text-center transition hover:border-[#f27921] hover:bg-white hover:shadow-sm"
              >
                <Icon className="h-7 w-7 text-[#f27921]" />
                <h3 className="mt-3 text-sm font-semibold text-[#333]">{product.title}</h3>
                <p className="mt-1.5 hidden text-xs leading-relaxed text-[#666] sm:block">{product.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
