import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SECTION_COPY } from './careers360HomeData';
import { OUTCOME_IMAGES } from './studentWorkspaceImages';
import { LAYOUT } from './careers360Theme';
import { STUDENT_OUTCOMES } from '../landing/landingPageData';
import CollegeCampusImage from '../landing/CollegeCampusImage';

export default function Careers360ImpactSection() {
  const [index, setIndex] = useState(0);
  const { title, description } = SECTION_COPY.outcomes;

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % STUDENT_OUTCOMES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const outcome = STUDENT_OUTCOMES[index];
  const outcomeImage = OUTCOME_IMAGES[outcome.id];

  return (
    <section className={`${LAYOUT.section} bg-[#f5f7fa]`}>
      <div className={LAYOUT.container}>
        <div className="mb-8 max-w-2xl">
          <h2 className="text-xl font-bold text-[#333] sm:text-2xl">{title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#666]">{description}</p>
        </div>

        <div className={`${LAYOUT.card} overflow-hidden p-0`}>
          <div className="grid sm:min-h-[300px] sm:grid-cols-[minmax(0,42%)_minmax(0,1fr)]">
            <div className="relative h-52 w-full sm:h-full sm:min-h-[300px]">
              <CollegeCampusImage
                id={`outcome-${outcome.id}`}
                name={outcome.colleges[0]}
                src={outcomeImage}
                className="absolute inset-0 h-full w-full"
                imgClassName="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-center gap-5 p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#999]">Achieved rank</p>
                  <p className="mt-1 text-2xl font-bold leading-tight text-[#333] sm:text-[1.75rem]">
                    {outcome.rank}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center rounded-full bg-[#fff4ed] px-3 py-1.5 text-xs font-semibold text-[#f27921]">
                  {outcome.accuracy}% match with shortlist
                </span>
              </div>

              <p className="text-sm leading-relaxed text-[#666]">
                <span className="font-semibold text-[#333]">{outcome.exam}</span> — predicted institutes aligned with
                where the student eventually secured a seat.
              </p>

              <ul className="flex flex-wrap gap-2">
                {outcome.colleges.map((college) => (
                  <li
                    key={college}
                    className="rounded-lg border border-[#e8eaed] bg-[#fafbfc] px-3 py-1.5 text-sm text-[#444]"
                  >
                    {college}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-center gap-2 border-t border-[#e8eaed] bg-[#fafbfc] px-4 py-4">
            {STUDENT_OUTCOMES.map((o, i) => (
              <button
                key={o.id}
                type="button"
                aria-label={`Show outcome ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-6 bg-[#f27921]' : 'w-1.5 bg-[#ccc] hover:bg-[#aaa]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Careers360CommunityCTA() {
  const { title, description, cta } = SECTION_COPY.helpCta;

  return (
    <section className={`${LAYOUT.sectionCompact} bg-white`}>
      <div className={LAYOUT.container}>
        <div className={`${LAYOUT.cardMuted} flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center`}>
          <div className="max-w-xl">
            <h2 className="text-lg font-bold text-[#333] sm:text-xl">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#666]">{description}</p>
          </div>
          <Link
            to="/students/tests"
            className="shrink-0 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: '#f27921' }}
          >
            {cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
