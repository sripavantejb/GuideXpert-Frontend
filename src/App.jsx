import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import MeetingRegistration from './pages/MeetingRegistration';
import AdminLayout from './components/Admin/AdminLayout';
import Overview from './pages/admin/Overview';
import Leads from './pages/admin/Leads';
import Analytics from './pages/admin/Analytics';
import Slots from './pages/admin/Slots';
import Export from './pages/admin/Export';
import Settings from './pages/admin/Settings';
import MeetingAttendance from './pages/admin/MeetingAttendance';
import InfluencerTracking from './pages/admin/InfluencerTracking';
import LeadStatus from './pages/admin/LeadStatus';

/* Counsellor portal — lazy loaded */
import CounsellorLayout from './components/Counsellor/CounsellorLayout';
const CounsellorDashboard = lazy(() => import('./pages/counsellor/Dashboard'));
const CounsellorStudents = lazy(() => import('./pages/counsellor/Students'));
const CounsellorAdmissions = lazy(() => import('./pages/counsellor/Admissions'));
const CounsellorSessions = lazy(() => import('./pages/counsellor/Sessions'));
const CounsellorTools = lazy(() => import('./pages/counsellor/Tools'));
const CounsellorReports = lazy(() => import('./pages/counsellor/Reports'));
const CounsellorResources = lazy(() => import('./pages/counsellor/Resources'));
const CounsellorMarketing = lazy(() => import('./pages/counsellor/Marketing'));
const CounsellorSettings = lazy(() => import('./pages/counsellor/Settings'));

function ProtectedAdmin({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<LandingPage />} />
          <Route path="/meet" element={<MeetingRegistration />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdmin>
                <AdminLayout />
              </ProtectedAdmin>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Overview />} />
            <Route path="leads" element={<Leads />} />
            <Route path="lead-status" element={<LeadStatus />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="slots" element={<Slots />} />
            <Route path="export" element={<Export />} />
            <Route path="settings" element={<Settings />} />
            <Route path="meeting-attendance" element={<MeetingAttendance />} />
            <Route path="influencer-tracking" element={<InfluencerTracking />} />
          </Route>

          {/* Counsellor Portal */}
          <Route path="/counsellor" element={<CounsellorLayout />}>
            <Route index element={<Navigate to="/counsellor/dashboard" replace />} />
            <Route path="dashboard" element={<Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>}><CounsellorDashboard /></Suspense>} />
            <Route path="students" element={<Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>}><CounsellorStudents /></Suspense>} />
            <Route path="admissions" element={<Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>}><CounsellorAdmissions /></Suspense>} />
            <Route path="sessions" element={<Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>}><CounsellorSessions /></Suspense>} />
            <Route path="tools" element={<Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>}><CounsellorTools /></Suspense>} />
            <Route path="reports" element={<Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>}><CounsellorReports /></Suspense>} />
            <Route path="resources" element={<Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>}><CounsellorResources /></Suspense>} />
            <Route path="marketing" element={<Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>}><CounsellorMarketing /></Suspense>} />
            <Route path="settings" element={<Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>}><CounsellorSettings /></Suspense>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
