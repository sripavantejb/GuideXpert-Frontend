import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CAMPUS_SHOWCASE } from './landingPageData';
import CollegeCampusImage from './CollegeCampusImage';
import SectionBackdrop from './SectionBackdrop';
import Reveal from './Reveal';

const INTERVAL_MS = 4500;

export default function CampusImageCarousel() {
  const [index, setIndex] = useState(0);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % CAMPUS_SHOWCASE.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const campus = CAMPUS_SHOWCASE[index];

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden border-b border-white/5 bg-slate-900"
      aria-labelledby="campus-showcase-heading"
    >
      <SectionBackdrop dark />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Campus life</p>
          <h2 id="campus-showcase-heading" className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Explore top campuses
          </h2>
          <p className="mt-3 text-sm text-slate-400 sm:text-base">
            Get a feel for the institutions shaping India&apos;s next generation of engineers and leaders.
          </p>
        </Reveal>

        <motion.div style={{ y }} className="relative mt-10">
          <div className="relative aspect-[21/9] overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/40 sm:aspect-[2.4/1]">
            {CAMPUS_SHOWCASE.map((item, i) => (
              <motion.div
                key={item.id}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: i === index ? 1 : 0, scale: i === index ? 1 : 1.05 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <CollegeCampusImage
                  id={item.id}
                  name={item.name}
                  src={item.image}
                  className="h-full w-full"
                />
              </motion.div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-slate-900/10" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
              <motion.p
                key={campus.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-semibold text-white sm:text-2xl"
              >
                {campus.name}
              </motion.p>
            </div>
          </div>

          <div className="mt-5 flex justify-center gap-2">
            {CAMPUS_SHOWCASE.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Show ${item.name}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-10 bg-emerald-400' : 'w-4 bg-white/25 hover:bg-white/40'}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
