import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useWebinarAuth } from '../../contexts/WebinarAuthContext';
import { WebinarProvider, useWebinar } from './context/WebinarContext';
import Sidebar from './components/Sidebar';
import WebinarTopNav from './components/WebinarTopNav';
import WebinarTour from './components/WebinarTour';

function WebinarLayoutInner({ tourSeenKey }) {
  const {
    sidebarOpen,
    setSidebarOpen,
    sidebarExpanded,
  } = useWebinar();
  const [showTour, setShowTour] = useState(() =>
    typeof window !== 'undefined' && tourSeenKey && !localStorage.getItem(tourSeenKey)
  );

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
      <div className={`flex-1 flex flex-col min-w-0 relative transition-[margin] duration-200 overflow-x-hidden ${sidebarExpanded ? 'lg:ml-[30vw]' : 'lg:ml-[72px]'}`}>
        <WebinarTopNav
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen((o) => !o)}
        />
        <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col min-h-0 overflow-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      {showTour && <WebinarTour storageKey={tourSeenKey} onDone={() => setShowTour(false)} />}
    </div>
  );
}

export default function WebinarLayout() {
  const { user } = useWebinarAuth();
  const tourSeenKey =
    'webinar_tour_seen_' + (user?.id ?? user?.phone ?? user?.email ?? 'anon');
  return (
    <WebinarProvider initialDisplayName={user?.name}>
      <WebinarLayoutInner tourSeenKey={tourSeenKey} />
    </WebinarProvider>
  );
}
