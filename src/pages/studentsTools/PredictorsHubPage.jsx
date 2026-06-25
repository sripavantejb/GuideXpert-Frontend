import {
  LuActivity,
  LuSearch,
  LuRocket,
  LuZap,
  LuCalendar,
} from 'react-icons/lu';
import HubPageLayout from './components/HubPageLayout';

const PREDICTOR_CARDS = [
  {
    title: 'Rank Predictor',
    description: 'Estimate your exam rank using marks and historical data.',
    to: '/students/rank-predictor',
    icon: LuActivity,
    iconClass: 'bg-sky-50 text-sky-600',
  },
  {
    title: 'College Predictor',
    description: 'Generate likely college matches using rank and category.',
    to: '/students/college-predictor',
    icon: LuSearch,
    iconClass: 'bg-rose-50 text-rose-600',
  },
  {
    title: 'Branch Predictor',
    description: 'Check branch opportunities for your preferred institutions.',
    to: '/students/branch-predictor',
    icon: LuRocket,
    iconClass: 'bg-violet-50 text-violet-600',
  },
  {
    title: 'Exam Predictor',
    description: 'Suggest suitable exams based on your profile and strengths.',
    to: '/students/exam-predictor',
    icon: LuZap,
    iconClass: 'bg-amber-50 text-amber-600',
  },
  {
    title: 'Deadline Manager',
    description: 'Track important exam and admission deadlines at a glance.',
    to: '/students/deadline-manager',
    icon: LuCalendar,
    iconClass: 'bg-indigo-50 text-indigo-600',
  },
];

export default function PredictorsHubPage() {
  return (
    <HubPageLayout
      eyebrow="Predictor hub"
      title="Predictor tools"
      subtitle="Select a predictor to analyze your academic outcomes."
      cards={PREDICTOR_CARDS}
    />
  );
}
