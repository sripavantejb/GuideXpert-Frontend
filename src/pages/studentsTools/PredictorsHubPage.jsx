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
    description: 'Estimate your exam rank using marks and historical score distributions.',
    to: '/students/rank-predictor',
    icon: LuActivity,
    iconClass: 'bg-[#041e30] text-white',
    cta: 'Choose exam',
  },
  {
    title: 'College Predictor',
    description: 'Generate likely college matches using rank, category, and state preference.',
    to: '/students/college-predictor',
    icon: LuSearch,
    iconClass: 'bg-[#fff4ed] text-[#f27921]',
    cta: 'Find colleges',
  },
  {
    title: 'Branch Predictor',
    description: 'See realistic branch opportunities for your preferred institutions.',
    to: '/students/branch-predictor',
    icon: LuRocket,
    iconClass: 'bg-[#e8f1f8] text-[#0b3a5c]',
    cta: 'Analyze branches',
  },
  {
    title: 'Exam Predictor',
    description: 'Map scores to predicted ranks across supported entrance exams.',
    to: '/students/exam-predictor',
    icon: LuZap,
    iconClass: 'bg-[#fff8ed] text-[#c45a0c]',
    cta: 'Run prediction',
  },
  {
    title: 'Deadline Manager',
    description: 'Track registrations, applications, and counseling windows in one place.',
    to: '/students/deadline-manager',
    icon: LuCalendar,
    iconClass: 'bg-[#eef2f7] text-[#041e30]',
    cta: 'View deadlines',
  },
];

export default function PredictorsHubPage() {
  return (
    <HubPageLayout
      eyebrow="Predictor hub"
      title="Predictor tools"
      subtitle="Professional planning tools to turn marks into clear admission next steps."
      cards={PREDICTOR_CARDS}
    />
  );
}
