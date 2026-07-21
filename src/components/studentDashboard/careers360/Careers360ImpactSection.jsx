import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SECTION_COPY } from './careers360HomeData';
import { OUTCOME_IMAGES } from './studentWorkspaceImages';
import { LAYOUT } from './careers360Theme';
import { STUDENT_OUTCOMES } from '../landing/landingPageData';
import CollegeCampusImage from '../landing/CollegeCampusImage';
import {
  ImpactAccentVector,
  SectionDecorDots,
} from './SectionIllustrations';
import PixarLottie from './PixarLottie';
import { STUDENT_LOTTIES } from './studentsAnimations';

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
    <section className={`${LAYOUT.section} relative overflow-hidden bg-[#f5f7fa]`}>
      <SectionDecorDots className="absolute right-6 top-8 h-16 w-16 opacity-40" />
      <div className={LAYOUT.container}>
        <div className="mb-8 flex max-w-3xl items-start gap-4">
          <div className="hidden h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#e8eaed] bg-white sm:block">
            <PixarLottie
              src={STUDENT_LOTTIES.success}
              label="Student success animation"
              className="h-full w-full"
            />
          </div>
          <ImpactAccentVector className="mt-0.5 h-14 w-14 shrink-0 sm:hidden" />
          <div>
            <h2 className="text-xl font-bold text-[#333] sm:text-2xl">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#666]">{description}</p>
          </div>
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
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#1e3a5f]/35 via-transparent to-[#f27921]/15" />
              <div className="absolute bottom-4 left-4 rounded-lg border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                Verified outcome
              </div>
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
    <section className={`${LAYOUT.sectionCompact} relative overflow-hidden bg-white`}>
      <SectionDecorDots className="absolute bottom-2 right-8 h-14 w-14 opacity-40" />
      <div className={LAYOUT.container}>
        <div className={`${LAYOUT.cardMuted} flex flex-col items-stretch gap-6 overflow-hidden sm:flex-row sm:items-center`}>
          <div className="mx-auto h-36 w-36 shrink-0 overflow-hidden rounded-xl border border-[#e8eaed] bg-white sm:mx-0 sm:h-40 sm:w-44">
            <PixarLottie
              src={STUDENT_LOTTIES.cta}
              label="Graduation celebration animation"
              className="h-full w-full"
            />
          </div>
          <div className="min-w-0 flex-1">
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
