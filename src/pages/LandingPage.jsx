import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import ApplySection from '../components/Sections/ApplySection';
import ProblemStatementSection from '../components/Sections/ProblemStatementSection';
import WhyBecomeSection from '../components/Sections/WhyBecomeSection';
import ShapeCareersSection from '../components/Sections/ShapeCareersSection';
import CertificationSection from '../components/Sections/CertificationSection';
import TrainingSupportSection from '../components/Sections/TrainingSupportSection';
import ToolsSection from '../components/Sections/ToolsSection';
import HowToBecomeSection from '../components/Sections/HowToBecomeSection';
import FAQSection from '../components/Sections/FAQSection';
import LegacySection from '../components/Sections/LegacySection';
import { ApplyModalProvider } from '../contexts/ApplyModalContext';

export default function LandingPage() {
  return (
    <ApplyModalProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <ApplySection />
          <ProblemStatementSection />
          <WhyBecomeSection />
          <ShapeCareersSection />
          <CertificationSection />
          <TrainingSupportSection />
          <ToolsSection />
          <HowToBecomeSection />
          <FAQSection />
          <LegacySection />
        </main>
        <Footer />
      </div>
    </ApplyModalProvider>
  );
}
