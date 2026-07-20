import { LuGraduationCap, LuMapPin } from 'react-icons/lu';
import HubPageLayout from './components/HubPageLayout';

const TEST_CARDS = [
  {
    title: 'Course Fit Test',
    description: 'Map preferences to course pathways with a short, structured aptitude quiz.',
    to: '/students/course-fit-test',
    icon: LuGraduationCap,
    iconClass: 'bg-[#fff4ed] text-[#f27921]',
    cta: 'Start quiz',
  },
  {
    title: 'College Fit Test',
    description: 'Filter colleges by budget, campus style, city, and placement priority.',
    to: '/students/college-fit-test',
    icon: LuMapPin,
    iconClass: 'bg-[#041e30] text-white',
    cta: 'Set preferences',
  },
];

export default function TestsHubPage() {
  return (
    <HubPageLayout
      eyebrow="Fit tests hub"
      title="Student fit tests"
      subtitle="Guided assessments that turn preferences into a clear shortlist."
      cards={TEST_CARDS}
      gridClassName="grid grid-cols-1 gap-5 md:grid-cols-2"
    />
  );
}
