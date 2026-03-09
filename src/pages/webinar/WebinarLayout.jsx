import { Outlet } from 'react-router-dom';
import { useWebinarAuth } from '../../contexts/WebinarAuthContext';
import { WebinarProvider, useWebinar } from './context/WebinarContext';
import Sidebar from './components/Sidebar';

function WebinarLayoutInner() {
  const {
    sidebarOpen,
    setSidebarOpen,
    sidebarExpanded,
  } = useWebinar();

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <a
        href="#main-content"
        className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 [clip:rect(0,0,0,0)] focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:px-4 focus-visible:py-2 focus-visible:w-auto focus-visible:h-auto focus-visible:overflow-visible focus-visible:[clip:auto] focus-visible:bg-primary-navy focus-visible:text-white focus-visible:rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50"
      >
        Skip to main content
      </a>
      <Sidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />
      <main id="main-content" tabIndex={-1} className={`flex-1 flex flex-col min-w-0 relative transition-[margin] duration-200 overflow-x-hidden ${sidebarExpanded ? 'lg:ml-[30vw]' : 'lg:ml-[72px]'}`}>
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-2 left-2 z-10 p-1.5 rounded-lg bg-white border border-gray-200 shadow-card text-gray-600 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex-1 flex flex-col min-h-0 overflow-auto overflow-x-hidden pt-12 lg:pt-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function WebinarLayout() {
  const { user } = useWebinarAuth();
  return (
    <WebinarProvider initialDisplayName={user?.name}>
      <WebinarLayoutInner />
    </WebinarProvider>
  );
}
