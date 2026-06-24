import { Link } from 'react-router-dom';
import { LuArrowRight } from 'react-icons/lu';
import StudentWorkspaceNavbar from '../../../components/studentDashboard/StudentWorkspaceNavbar';
import StudentWorkspaceFooter from '../../../components/studentDashboard/StudentWorkspaceFooter';
import {
  swContainer,
  swHeroEyebrow,
  swHubCard,
  swLinkCta,
  swPageShell,
  swPageSubtitle,
  swPageTitle,
} from './studentWorkspaceUi';

export default function HubPageLayout({ eyebrow, title, subtitle, cards, gridClassName = 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3' }) {
  return (
    <div className={swPageShell}>
      <StudentWorkspaceNavbar />
      <main className="flex-1">
        <div className={swContainer}>
          <header className="mb-10">
            <p className={swHeroEyebrow}>{eyebrow}</p>
            <h1 className={`mt-2 ${swPageTitle}`}>{title}</h1>
            <p className={swPageSubtitle}>{subtitle}</p>
          </header>

          <section className={gridClassName}>
            {cards.map((card) => (
              <Link key={card.to} to={card.to} className={swHubCard}>
                {card.icon ? (
                  <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${card.iconClass}`}>
                    <card.icon className="h-5 w-5" aria-hidden />
                  </div>
                ) : null}
                <h2 className="text-lg font-semibold text-slate-900">{card.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{card.description}</p>
                <span className={swLinkCta}>
                  {card.cta || 'Open tool'} <LuArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </Link>
            ))}
          </section>
        </div>
      </main>
      <StudentWorkspaceFooter />
    </div>
  );
}
