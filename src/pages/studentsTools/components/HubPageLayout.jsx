import { Link } from 'react-router-dom';
import { FiCheck, FiHome, FiChevronRight } from 'react-icons/fi';
import { LuArrowRight } from 'react-icons/lu';
import { LAYOUT } from '../../../components/studentDashboard/careers360/careers360Theme';
import {
  swHubCard,
  swLinkCta,
  swPageShell,
} from './studentWorkspaceUi';

export default function HubPageLayout({
  eyebrow,
  title,
  subtitle,
  cards,
  gridClassName = 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3',
  trustBadge = 'Trusted by 500K+ Students',
}) {
  return (
    <main className={`${swPageShell} !bg-[#f3f5f8]`}>
      <section className="sw-c360-tool-hero relative overflow-hidden !py-0">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 18% 22%, rgba(242,121,33,0.18), transparent 42%), radial-gradient(circle at 82% 18%, rgba(56,189,248,0.12), transparent 38%)',
          }}
          aria-hidden
        />
        <div className={`relative ${LAYOUT.container} py-8 sm:py-10 lg:py-12`}>
          <nav
            className="sw-fade-up mb-8 flex flex-wrap items-center gap-1.5 text-[13px] !text-white/70"
            aria-label="Breadcrumb"
          >
            <Link
              to="/students"
              className="inline-flex items-center gap-1 !text-white/70 transition hover:!text-white"
            >
              <FiHome className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only">Home</span>
            </Link>
            <FiChevronRight className="h-3.5 w-3.5 opacity-50" aria-hidden />
            <span className="font-medium !text-white">{title}</span>
          </nav>

          <header className="sw-fade-up max-w-3xl text-white">
            {trustBadge ? (
              <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#16a34a]/20 px-3 py-1 text-xs font-semibold !text-[#86efac] ring-1 ring-[#4ade80]/35">
                <FiCheck className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                {trustBadge}
              </p>
            ) : null}
            {eyebrow ? (
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] !text-[#f27921]">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="font-sw-display text-[1.85rem] font-bold leading-[1.15] tracking-tight !text-white sm:text-4xl lg:text-[2.55rem]">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed !text-white/80 sm:text-base">
                {subtitle}
              </p>
            ) : null}
          </header>
        </div>
      </section>

      <div className={`${LAYOUT.container} py-10 sm:py-12`}>
        <section className={`${gridClassName} sw-fade-up sw-fade-up-delay-1`}>
          {cards.map((card) => (
            <Link key={card.to} to={card.to} className={swHubCard}>
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f27921]/50 to-transparent opacity-0 transition group-hover:opacity-100"
                aria-hidden
              />
              {card.icon ? (
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconClass}`}>
                  <card.icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
              ) : null}
              <h2 className="font-sw-display text-lg font-bold tracking-tight text-[#041e30]">
                {card.title}
              </h2>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-[#5a6570]">{card.description}</p>
              <span className={swLinkCta}>
                {card.cta || 'Open tool'} <LuArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
