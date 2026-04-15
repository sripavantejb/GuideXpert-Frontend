import { Link } from 'react-router-dom';
import {
  FiArrowRight,
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
import StudentWorkspaceNavbar from '../../components/studentDashboard/StudentWorkspaceNavbar';
import StudentWorkspaceFooter from '../../components/studentDashboard/StudentWorkspaceFooter';
import { getRankPredictorExams } from '../../utils/rankPredictor';

const EXAM_ICON_MAP = {
  apeamcet: { Icon: FiBookOpen, bg: 'bg-[#B7E5FF]' },
  jeeadvanced: { Icon: FiZap, bg: 'bg-[#F7B5B5]' },
  jeemainpercentile: { Icon: FiBarChart2, bg: 'bg-[#c7f36b]' },
  jeemainmarks: { Icon: FiTarget, bg: 'bg-[#F7B5B5]' },
  kcet: { Icon: FiCpu, bg: 'bg-[#B7E5FF]' },
  keam: { Icon: FiAward, bg: 'bg-[#c7f36b]' },
  mhcet: { Icon: FiActivity, bg: 'bg-[#F7B5B5]' },
  tnea: { Icon: FiTrendingUp, bg: 'bg-[#B7E5FF]' },
  tseamcet: { Icon: FiFileText, bg: 'bg-[#c7f36b]' },
  wbjee: { Icon: FiGrid, bg: 'bg-[#B7E5FF]' },
};

const DEFAULT_ICON = { Icon: FiBarChart2, bg: 'bg-[#c7f36b]' };

const examCards = getRankPredictorExams().map((exam) => ({
  ...exam,
  ...(EXAM_ICON_MAP[exam.id] || DEFAULT_ICON),
}));

export default function RankPredictorPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <StudentWorkspaceNavbar />
      <main className="student-tool-page-shell relative flex min-h-0 flex-1 flex-col">
        <div className="mx-auto w-full min-w-0 max-w-7xl shrink-0 px-4 pt-5 pb-3 sm:px-6 sm:pt-8 sm:pb-6 lg:px-8">
          <section className="rounded-[14px] border-[3px] border-black bg-[#0F172A] p-5 shadow-[4px_4px_0_#000] sm:p-8 lg:p-10">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Student tool workspace</p>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl">Rank Predictors</h1>
            <p className="mt-2 max-w-2xl text-sm font-normal leading-relaxed text-slate-300 sm:text-base">
              Choose your exam to estimate rank from your marks.
            </p>
          </section>
        </div>

        <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-7xl flex-1 flex-col px-4 pb-8 pt-2 sm:px-6 sm:pb-10 sm:pt-4 lg:px-8 lg:pb-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
            {examCards.map((exam) => {
              const ExamIcon = exam.Icon;
              return (
                <Link
                  key={exam.id}
                  to={`/students/rank-predictor/${exam.id}`}
                  className="group flex min-w-0 flex-col rounded-[12px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] sm:p-5"
                >
                  <div className={`mb-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border-2 border-black shadow-[2px_2px_0_#000] ${exam.bg}`}>
                    <ExamIcon className="h-5 w-5 text-[#0F172A]" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-base font-black tracking-tight text-[#0F172A]">{exam.name}</h3>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-500">{exam.description}</p>
                  <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-[10px] border-[3px] border-black bg-[#c7f36b] px-4 py-2 text-xs font-black text-[#0F172A] shadow-[3px_3px_0_#000] transition-transform group-active:translate-x-0.5 group-active:translate-y-0.5 group-active:shadow-none">
                    Predict now <FiArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <StudentWorkspaceFooter />
    </div>
  );
}
