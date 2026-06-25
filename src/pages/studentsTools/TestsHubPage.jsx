import { LuGraduationCap, LuMapPin } from 'react-icons/lu';
import HubPageLayout from './components/HubPageLayout';

const TEST_CARDS = [
  {
    title: 'Course Fit Test',
    description: 'Understand which courses align with your aptitude and interests.',
    to: '/students/course-fit-test',
    icon: LuGraduationCap,
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'College Fit Test',
    description: 'Find colleges that match your budget, campus style, and goals.',
    to: '/students/college-fit-test',
    icon: LuMapPin,
    iconClass: 'bg-sky-50 text-sky-600',
  },
];

export default function TestsHubPage() {
  return (
    <HubPageLayout
      eyebrow="Fit tests hub"
      title="Student fit tests"
      subtitle="Explore guided tests to understand your course and college fit."
      cards={TEST_CARDS}
      gridClassName="grid grid-cols-1 gap-5 md:grid-cols-2"
    />
  );
}
