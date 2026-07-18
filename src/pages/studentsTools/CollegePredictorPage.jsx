import { Link } from 'react-router-dom';
import { LuArrowRight } from 'react-icons/lu';
import {
  FiBookOpen,
  FiZap,
  FiBarChart2,
  FiTarget,
  FiCpu,
  FiAward,
  FiActivity,
  FiTrendingUp,
  FiFileText,
  FiGrid,
} from 'react-icons/fi';
import { ENTRANCE_EXAMS } from '../../constants/collegePredictorOptions';
import {
  swContainer,
  swHeroEyebrow,
  swHubCard,
  swLinkCta,
  swPageShell,
  swPageSubtitle,
  swPageTitle,
} from './components/studentWorkspaceUi';

const EXAM_ICON_MAP = {
  KCET: { Icon: FiCpu, iconClass: 'bg-sky-50 text-sky-600' },
  MHT_CET: { Icon: FiActivity, iconClass: 'bg-rose-50 text-rose-600' },
  KEAM: { Icon: FiAward, iconClass: 'bg-orange-50 text-orange-600' },
  AP_EAMCET: { Icon: FiBookOpen, iconClass: 'bg-sky-50 text-sky-600' },
  TS_EAMCET: { Icon: FiFileText, iconClass: 'bg-orange-50 text-orange-600' },
  TNEA: { Icon: FiTrendingUp, iconClass: 'bg-sky-50 text-sky-600' },
  JEE: { Icon: FiZap, iconClass: 'bg-rose-50 text-rose-600' },
  WBJEE: { Icon: FiGrid, iconClass: 'bg-violet-50 text-violet-600' },
};

const DEFAULT_ICON = { Icon: FiBarChart2, iconClass: 'bg-orange-50 text-orange-600' };

const examCards = ENTRANCE_EXAMS.filter((e) => e.supported !== false).map((exam) => ({
  ...exam,
  ...(EXAM_ICON_MAP[exam.value] || DEFAULT_ICON),
}));

export default function CollegePredictorPage() {
  return (
    <main className={swPageShell}>
      <div className={swContainer}>
        <header className="mb-8">
          <p className={swHeroEyebrow}>College predictors</p>
          <h1 className={`mt-2 ${swPageTitle}`}>Choose your exam</h1>
          <p className={swPageSubtitle}>
            Select an entrance exam, enter your profile, verify your phone, then see college matches.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {examCards.map((exam) => {
            const ExamIcon = exam.Icon;
            return (
              <Link
                key={exam.value}
                to={`/students/college-predictor/${exam.value}`}
                className={swHubCard}
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${exam.iconClass}`}>
                  <ExamIcon className="h-5 w-5" strokeWidth={2.25} aria-hidden />
                </div>
                <h3 className="text-lg font-bold text-[#333]">{exam.label}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#666]">{exam.description}</p>
                <span className={swLinkCta}>
                  Predict now <LuArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}
