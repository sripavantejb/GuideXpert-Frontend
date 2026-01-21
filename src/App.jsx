import { Suspense, lazy } from 'react';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HeroSection from './components/Sections/HeroSection';
import LoadingFallback from './components/UI/LoadingFallback';

// Lazy load all sections below the fold
const WhyBecomeSection = lazy(() => import('./components/Sections/WhyBecomeSection'));
const ShapeCareersSection = lazy(() => import('./components/Sections/ShapeCareersSection'));
const CertificationSection = lazy(() => import('./components/Sections/CertificationSection'));
const TrainingSupportSection = lazy(() => import('./components/Sections/TrainingSupportSection'));
const ToolsSection = lazy(() => import('./components/Sections/ToolsSection'));
const HowToBecomeSection = lazy(() => import('./components/Sections/HowToBecomeSection'));
const FAQSection = lazy(() => import('./components/Sections/FAQSection'));
const LegacySection = lazy(() => import('./components/Sections/LegacySection'));
const ApplySection = lazy(() => import('./components/Sections/ApplySection'));

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero section loads immediately (above the fold) */}
        <HeroSection />
        
        {/* All other sections are lazy loaded */}
        <Suspense fallback={<LoadingFallback />}>
          <WhyBecomeSection />
        </Suspense>
        
        <Suspense fallback={<LoadingFallback />}>
          <ShapeCareersSection />
        </Suspense>
        
        <Suspense fallback={<LoadingFallback />}>
          <CertificationSection />
        </Suspense>
        
        <Suspense fallback={<LoadingFallback />}>
          <TrainingSupportSection />
        </Suspense>
        
        <Suspense fallback={<LoadingFallback />}>
          <ToolsSection />
        </Suspense>
        
        <Suspense fallback={<LoadingFallback />}>
          <HowToBecomeSection />
        </Suspense>
        
        <Suspense fallback={<LoadingFallback />}>
          <FAQSection />
        </Suspense>
        
        <Suspense fallback={<LoadingFallback />}>
          <LegacySection />
        </Suspense>
        
        <Suspense fallback={<LoadingFallback />}>
          <ApplySection />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;
