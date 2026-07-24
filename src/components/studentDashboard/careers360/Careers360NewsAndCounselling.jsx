import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { SECTION_COPY, WORKSPACE_UPDATES } from './careers360HomeData';
import { SectionViewAll } from './Careers360Shared';
import { LAYOUT } from './careers360Theme';
import CollegeCampusImage from '../landing/CollegeCampusImage';
import {
  CounsellingIllustration,
  NewsHeaderVector,
  SectionDecorDots,
} from './SectionIllustrations';
import { getStudentWorkspaceUpdatesFeed } from '../../../utils/api';
import { formatUpdateDate } from '../../../utils/studentWorkspaceUpdates';

function normalizeHomeItems(apiItems) {
  if (!Array.isArray(apiItems) || apiItems.length === 0) return null;
  return apiItems.map((item) => ({
    id: item.id,
    tag: item.tag || item.category,
    title: item.title,
    date: formatUpdateDate(item.publishedAt),
    to: item.linkUrl || '/students/updates',
    image: item.imageUrl || '',
    imageId: `live-update-${item.id}`,
    external: /^https?:\/\//i.test(item.linkUrl || ''),
  }));
}

export function Careers360NewsSection() {
  const { title, subtitle } = SECTION_COPY.updates;
  const [items, setItems] = useState(WORKSPACE_UPDATES);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await getStudentWorkspaceUpdatesFeed({ placement: 'home', limit: 8 });
      if (cancelled) return;
      const live = normalizeHomeItems(res.success ? res.data?.data?.items : null);
      if (live?.length) setItems(live);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className={`${LAYOUT.sectionCompact} relative overflow-hidden bg-white`}>
      <SectionDecorDots className="absolute right-8 top-4 h-14 w-14 opacity-40" />
      <div className={LAYOUT.container}>
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <NewsHeaderVector className="hidden h-16 w-28 shrink-0 sm:block" />
            <div>
              <h2 className="text-lg font-bold text-[#333] sm:text-xl">{title}</h2>
              <p className="mt-1 text-sm text-[#666]">{subtitle}</p>
            </div>
          </div>
          <SectionViewAll to="/students/updates" label="All updates" />
        </div>
        <ul className="divide-y divide-[#eee] rounded-xl border border-[#e8eaed]">
          {items.map((item) => {
            const body = (
              <>
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-[#eef2f7] sm:h-[4.5rem] sm:w-24">
                  {item.image ? (
                    <CollegeCampusImage
                      id={item.imageId || `update-${item.id}`}
                      name={item.title}
                      src={item.image}
                      className="h-full w-full"
                      imgClassName="h-full w-full object-cover"
                    />
                  ) : null}
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1e3a5f]/25 to-transparent" />
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
              </>
            );

            return (
              <li key={item.id}>
                {item.external ? (
                  <a
                    href={item.to}
                    target="_blank"
                    rel="noreferrer"
                    className="flex gap-5 px-4 py-5 transition hover:bg-[#fafbfc] sm:items-center sm:px-5"
                  >
                    {body}
                  </a>
                ) : (
                  <Link
                    to={item.to}
                    className="flex gap-5 px-4 py-5 transition hover:bg-[#fafbfc] sm:items-center sm:px-5"
                  >
                    {body}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function Careers360CounsellingSection({ onBookCounselling }) {
  return (
    <section
      id="career-counselling"
      className="relative overflow-hidden border-b border-[#e8eaed] py-12 sm:py-16"
      style={{
        background: 'linear-gradient(165deg, #faf7f2 0%, #fff8f1 45%, #ffffff 100%)',
      }}
    >
      <SectionDecorDots className="absolute left-4 top-8 h-16 w-16 opacity-50" />
      <div className={`${LAYOUT.container} grid items-center gap-10 lg:grid-cols-2 lg:gap-14`}>
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f27921]">
            Career counselling
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#1a1a1a] sm:text-3xl sm:leading-tight">
            Still unsure about colleges, branches, or what to choose next?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-[#555] lg:mx-0">
            Need guidance on admissions, want to understand campus options, or simply talk through your
            shortlist with someone who has done it? Book a free one-on-one session with an IITian
            mentor — personalised, calm, and focused on your goals.
          </p>

          <ul className="mx-auto mt-8 flex max-w-lg flex-col gap-3 text-left sm:max-w-md lg:mx-0">
            {[
              'Confused between colleges or branches after seeing your predicted rank?',
              'Want to know which campuses fit your budget, category, and preferences?',
              'Ready to plan counselling with help from someone who has walked this path?',
            ].map((q) => (
              <li
                key={q}
                className="flex gap-3 border-b border-[#f0e6da] pb-3 text-sm leading-relaxed text-[#444] last:border-0 last:pb-0"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f27921]" aria-hidden />
                {q}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col items-center gap-3 lg:items-start">
            <button
              type="button"
              onClick={onBookCounselling}
              className="inline-flex items-center justify-center rounded-lg bg-[#f27921] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e06810]"
            >
              Book free IITian 1-on-1 counselling
            </button>
            <p className="text-xs text-[#888]">100% free · Live session with an IITian mentor</p>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <CounsellingIllustration className="shadow-sm" />
        </div>
      </div>
    </section>
  );
}
