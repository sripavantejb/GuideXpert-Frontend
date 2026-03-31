import '../styles/studentDashboard.css';
import StudentDashboardShell from '../components/studentDashboard/StudentDashboardShell';
import HeroSection from '../components/studentDashboard/HeroSection';
import ToolGridSection from '../components/studentDashboard/ToolGridSection';
import RankPredictorPanel from '../components/studentDashboard/RankPredictorPanel';
import CollegePredictorPanel from '../components/studentDashboard/CollegePredictorPanel';
import BranchPredictorPanel from '../components/studentDashboard/BranchPredictorPanel';
import CourseFitQuiz from '../components/studentDashboard/CourseFitQuiz';
import CollegeFitPanel from '../components/studentDashboard/CollegeFitPanel';
import CollegeComparisonPanel from '../components/studentDashboard/CollegeComparisonPanel';
import CTASection from '../components/studentDashboard/CTASection';

export default function StudentIntelligenceDashboard() {
  return (
    <StudentDashboardShell>
      <main>
        <HeroSection />
        <ToolGridSection />
        <RankPredictorPanel />
        <CollegePredictorPanel />
        <BranchPredictorPanel />
        <CourseFitQuiz />
        <CollegeFitPanel />
        <CollegeComparisonPanel />
        <CTASection />
      </main>
      <footer className="border-t-2 border-black bg-[#0F172A] px-4 py-8 text-center text-sm text-slate-500 sm:px-6">
        <p>GuideXpert · Student Intelligence Dashboard (demo tools)</p>
      </footer>
    </StudentDashboardShell>
  );
}
