import { ApplyModalProvider } from '../../contexts/ApplyModalContext';
import Header from './Header';
import Footer from './Footer';

/**
 * Layout for Psychometric Test and Course Fit assessment pages.
 * Renders the same Header (standalone) and Footer as the landing page
 * so the tests feel like part of the main site.
 */
export default function AssessmentLayout({ children }) {
  return (
    <ApplyModalProvider>
      <div className="min-h-screen flex flex-col">
        <Header standalone />
        <main className="grow">{children}</main>
        <Footer />
      </div>
    </ApplyModalProvider>
  );
}
