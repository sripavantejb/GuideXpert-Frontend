import { Link } from 'react-router-dom';
import { LuArrowRight, LuChevronRight } from 'react-icons/lu';
import { EXAM_STRIP_LINKS } from './careers360HomeData';
import { C360, LAYOUT } from './careers360Theme';

export default function Careers360ExamStrip() {
  return (
    <div className="border-b border-[#e8eaed] bg-white">
      <div className={LAYOUT.container}>
        <div className="flex gap-1 overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {EXAM_STRIP_LINKS.map((item) => (
            <Link
              key={`${item.label}-${item.to}`}
              to={item.to}
              className={`shrink-0 whitespace-nowrap px-3 py-1.5 text-sm transition ${
                item.highlight
                  ? 'font-semibold text-[#f27921] hover:underline'
                  : 'text-[#555] hover:text-[#f27921]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LinkPillGrid({ links, columns = 3 }) {
  const colClass =
    columns === 4
      ? 'sm:grid-cols-2 lg:grid-cols-4'
      : columns === 2
        ? 'sm:grid-cols-2'
        : 'sm:grid-cols-2 lg:grid-cols-3';

  return (
    <ul className={`grid grid-cols-1 gap-x-6 gap-y-0.5 ${colClass}`}>
      {links.map((link) => (
        <li key={`${link.label}-${link.to}`}>
          <Link
            to={link.to}
            className="group flex items-center gap-1 py-2 text-sm text-[#444] transition hover:text-[#f27921]"
          >
            <span className="line-clamp-1">{link.label}</span>
            <LuChevronRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition group-hover:opacity-100" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function SectionViewAll({ to, label = 'See all' }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
      style={{ color: C360.link }}
    >
      {label} <LuArrowRight className="h-4 w-4" />
    </Link>
  );
}

export function HubSectionShell({ title, description, children, id, variant = 'white' }) {
  const bg = variant === 'gray' ? C360.bgSection : C360.bgSectionAlt;

  return (
    <section id={id} className={LAYOUT.section} style={{ backgroundColor: bg }}>
      <div className={LAYOUT.container}>
        <div className={LAYOUT.hubGrid}>
          <div className={LAYOUT.hubSidebar}>
            <h2 className="text-xl font-bold leading-tight text-[#333] sm:text-2xl">{title}</h2>
            {description ? (
              <p className="mt-4 text-sm leading-relaxed text-[#666] sm:text-[15px]">{description}</p>
            ) : null}
          </div>
          <div className={LAYOUT.hubContent}>{children}</div>
        </div>
      </div>
    </section>
  );
}
