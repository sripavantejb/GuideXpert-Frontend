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
import { getRankPredictorExams } from '../../utils/rankPredictor';
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
  apeamcet: { Icon: FiBookOpen, iconClass: 'bg-sky-50 text-sky-600' },
  jeeadvanced: { Icon: FiZap, iconClass: 'bg-rose-50 text-rose-600' },
  jeemainpercentile: { Icon: FiBarChart2, iconClass: 'bg-orange-50 text-orange-600' },
  jeemainmarks: { Icon: FiTarget, iconClass: 'bg-rose-50 text-rose-600' },
  kcet: { Icon: FiCpu, iconClass: 'bg-sky-50 text-sky-600' },
  keam: { Icon: FiAward, iconClass: 'bg-orange-50 text-orange-600' },
  mhcet: { Icon: FiActivity, iconClass: 'bg-rose-50 text-rose-600' },
  tnea: { Icon: FiTrendingUp, iconClass: 'bg-sky-50 text-sky-600' },
  tseamcet: { Icon: FiFileText, iconClass: 'bg-orange-50 text-orange-600' },
  wbjee: { Icon: FiGrid, iconClass: 'bg-violet-50 text-violet-600' },
};

const DEFAULT_ICON = { Icon: FiBarChart2, iconClass: 'bg-orange-50 text-orange-600' };

const examCards = getRankPredictorExams().map((exam) => ({
  ...exam,
  ...(EXAM_ICON_MAP[exam.id] || DEFAULT_ICON),
}));

export default function RankPredictorPage() {
  return (
    <main className={swPageShell}>
      <div className={swContainer}>
        <header className="mb-8">
          <p className={swHeroEyebrow}>Rank predictors</p>
          <h1 className={`mt-2 ${swPageTitle}`}>Choose your exam</h1>
          <p className={swPageSubtitle}>Select an exam to estimate rank from your marks.</p>
        </header>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {examCards.map((exam) => {
            const ExamIcon = exam.Icon;
            return (
              <Link
                key={exam.id}
                to={`/students/rank-predictor/${exam.id}`}
                className={swHubCard}
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${exam.iconClass}`}>
                  <ExamIcon className="h-5 w-5" strokeWidth={2.25} aria-hidden />
                </div>
                <h3 className="text-lg font-bold text-[#333]">{exam.name}</h3>
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
