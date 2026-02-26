import { ApplyModalProvider } from '../../contexts/ApplyModalContext';
import Header from './Header';
import Footer from './Footer';

/**
 * Layout for Psychometric Test and Course Fit assessment pages.
 * Renders the same Header (standalone) and Footer as the landing page
 * so the tests feel like part of the main site.
 * Set hideNavAndFooter to true to render only the main content (no navbar/footer).
 */
export default function AssessmentLayout({ children, hideNavAndFooter = false }) {
  return (
    <ApplyModalProvider>
      <div className="min-h-screen flex flex-col">
        {!hideNavAndFooter && <Header standalone />}
        <main className="grow">{children}</main>
        {!hideNavAndFooter && <Footer />}
      </div>
    </ApplyModalProvider>
  );
}
