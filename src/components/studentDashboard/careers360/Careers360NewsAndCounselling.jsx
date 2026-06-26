import { Link } from 'react-router-dom';
import { SECTION_COPY, WORKSPACE_UPDATES } from './careers360HomeData';
import { WORKSPACE_IMAGES } from './studentWorkspaceImages';
import { HubSectionShell, SectionViewAll } from './Careers360Shared';
import { LAYOUT } from './careers360Theme';
import CollegeCampusImage from '../landing/CollegeCampusImage';

export function Careers360NewsSection() {
  const { title, subtitle } = SECTION_COPY.updates;

  return (
    <section className={`${LAYOUT.sectionCompact} bg-white`}>
      <div className={LAYOUT.container}>
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#333] sm:text-xl">{title}</h2>
            <p className="mt-1 text-sm text-[#666]">{subtitle}</p>
          </div>
          <SectionViewAll to="/students/rank-predictor" label="All tools" />
        </div>
        <ul className="divide-y divide-[#eee] rounded-xl border border-[#e8eaed]">
          {WORKSPACE_UPDATES.map((item) => (
            <li key={item.id}>
              <Link
                to={item.to}
                className="flex gap-5 px-4 py-5 transition hover:bg-[#fafbfc] sm:items-center sm:px-5"
              >
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-md bg-[#eef2f7] sm:h-[4.5rem] sm:w-24">
                  {item.image ? (
                    <CollegeCampusImage
                      id={item.imageId || `update-${item.id}`}
                      name={item.title}
                      src={item.image}
                      className="h-full w-full"
                      imgClassName="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.tag ? (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                          item.tag === 'Updated'
                            ? 'bg-[#dbeafe] text-[#1d4ed8]'
                            : 'bg-[#fff4ed] text-[#f27921]'
                        }`}
                      >
                        {item.tag}
                      </span>
                    ) : null}
                    <span className="line-clamp-2 text-sm font-medium leading-snug text-[#333] sm:line-clamp-1">
                      {item.title}
                    </span>
                  </div>
                </div>
                <span className="hidden shrink-0 text-xs text-[#999] sm:block">{item.date}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Careers360CounsellingSection() {
  const { title, description } = SECTION_COPY.guidance;

  return (
    <HubSectionShell id="fit-tests" variant="gray" title={title} description={description}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Link
          to="/students/course-fit-test"
          className="group relative overflow-hidden rounded-xl border border-[#e8eaed] transition hover:border-[#f27921]/40"
        >
          <div className="absolute inset-0">
            <CollegeCampusImage
              id="guidance-course"
              name="Course fit test"
              src={WORKSPACE_IMAGES.updateFitCourse}
              className="h-full w-full"
              imgClassName="h-full w-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          </div>
          <div className="relative flex min-h-[200px] flex-col justify-end p-6 text-white">
            <h3 className="text-base font-bold">Course fit test</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/90">
              Map interests to engineering and science tracks before you shortlist.
            </p>
            <span className="mt-4 inline-flex w-fit rounded-lg bg-[#f27921] px-4 py-2 text-sm font-semibold">
              Start course test
            </span>
          </div>
        </Link>
        <Link
          to="/students/college-fit-test"
          className="group relative overflow-hidden rounded-xl border border-[#e8eaed] transition hover:border-[#f27921]/40"
        >
          <div className="absolute inset-0">
            <CollegeCampusImage
              id="guidance-college"
              name="College fit test"
              src={WORKSPACE_IMAGES.updateCompare}
              className="h-full w-full"
              imgClassName="h-full w-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          </div>
          <div className="relative flex min-h-[200px] flex-col justify-end p-6 text-white">
            <h3 className="text-base font-bold">College fit test</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/90">
              Filter campuses by budget, location, and preferences beyond rank alone.
            </p>
            <span className="mt-4 inline-flex w-fit rounded-lg border border-white/60 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
              Start college test
            </span>
          </div>
        </Link>
      </div>
      <Link
        to="/students/tests"
        className={`${LAYOUT.cardMuted} mt-5 flex items-center justify-between gap-4 transition hover:border-[#f27921]/40`}
      >
        <div>
          <p className="font-semibold text-[#333]">Browse all fit tests</p>
          <p className="mt-1 text-sm text-[#666]">Structured assessments in one hub</p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-[#2563eb]">Open hub →</span>
      </Link>
    </HubSectionShell>
  );
}
