import { Link } from 'react-router-dom';
import { DATA_STATS, SECTION_COPY, getTopExamLinks, TOP_COLLEGE_LINKS } from './careers360HomeData';
import { HubSectionShell, LinkPillGrid, SectionViewAll } from './Careers360Shared';
import { LAYOUT } from './careers360Theme';
import { TRENDING_COLLEGES } from '../landing/landingPageData';
import CollegeCampusImage from '../landing/CollegeCampusImage';

export function Careers360DataSection() {
  const examLinks = getTopExamLinks();
  const { title, description } = SECTION_COPY.data;
  const featuredColleges = TRENDING_COLLEGES.slice(0, 6);

  return (
    <HubSectionShell variant="white" title={title} description={description}>
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {DATA_STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[#e8eaed] bg-[#fafbfc] px-4 py-5 text-center"
          >
            <p className="text-lg font-bold text-[#333] sm:text-xl">{stat.value}</p>
            <p className="mt-1 text-xs leading-snug text-[#666]">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {featuredColleges.map((college) => (
          <Link
            key={college.id}
            to={college.to}
            className="group overflow-hidden rounded-xl border border-[#e8eaed] bg-white transition hover:border-[#f27921]/40 hover:shadow-sm"
          >
            <div className="aspect-[4/3] overflow-hidden bg-[#eef2f7]">
              <CollegeCampusImage
                id={college.id}
                name={college.name}
                src={college.image}
                className="h-full w-full transition duration-300 group-hover:scale-105"
                imgClassName="h-full w-full object-cover"
              />
            </div>
            <p className="truncate px-2 py-2 text-xs font-semibold text-[#333] sm:text-sm">{college.name}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className={LAYOUT.card}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-[#333]">Featured colleges</h3>
            <SectionViewAll to="/students/college-predictor" />
          </div>
          <p className="mb-4 text-xs leading-relaxed text-[#666]">
            Institutes students explore most often when building shortlists on GuideXpert.
          </p>
          <LinkPillGrid links={TOP_COLLEGE_LINKS.slice(0, 12)} columns={2} />
        </div>
        <div className={LAYOUT.card}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-[#333]">Supported exams</h3>
            <SectionViewAll to="/students/rank-predictor" />
          </div>
          <p className="mb-4 text-xs leading-relaxed text-[#666]">
            Jump straight to the rank predictor for your entrance exam.
          </p>
          <LinkPillGrid links={examLinks.slice(0, 12)} columns={2} />
        </div>
      </div>
    </HubSectionShell>
  );
}
