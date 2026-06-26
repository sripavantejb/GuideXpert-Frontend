import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LuArrowRight, LuMapPin } from 'react-icons/lu';
import CollegeCampusImage from './CollegeCampusImage';
import { TRENDING_COLLEGES } from './landingPageData';
import SectionBackdrop from './SectionBackdrop';
import Reveal from './Reveal';
import { fadeUp, defaultViewport, staggerContainer } from './motion';

export default function TrendingCollegesSlider() {
  const scrollRef = useRef(null);

  return (
    <section
      className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white via-slate-50/60 to-white"
      aria-labelledby="trending-colleges-heading"
    >
      <SectionBackdrop dark={false} particles={false} />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Trending now</p>
          <h2 id="trending-colleges-heading" className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Colleges students are exploring
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
            Top institutions with strong placements and campus culture — explore predictions for each.
          </p>
        </Reveal>

        <div
          ref={scrollRef}
          className="mt-10 flex gap-5 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <motion.div
            className="flex gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={staggerContainer}
          >
            {TRENDING_COLLEGES.map((college) => (
              <motion.div key={college.id} variants={fadeUp} className="w-[280px] shrink-0 snap-start sm:w-[300px]">
                <Link
                  to={college.to}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                >
                  <div className="relative h-40 overflow-hidden">
                    <CollegeCampusImage
                      id={college.id}
                      name={college.name}
                      src={college.image}
                      className="h-full w-full transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-medium text-white/90">
                      <LuMapPin className="h-3.5 w-3.5" aria-hidden />
                      {college.location || 'India'}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-semibold text-slate-900">{college.name}</h3>
                    <p className="mt-1 text-sm text-emerald-600">{college.placement}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 transition group-hover:gap-2.5 group-hover:text-emerald-600">
                      Explore <LuArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
