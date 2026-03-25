import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CounsellorAuthProvider, useCounsellorAuth } from './contexts/CounsellorAuthContext';
import { WebinarAuthProvider, useWebinarAuth } from './contexts/WebinarAuthContext';
import { CounsellorProfileProvider } from './contexts/CounsellorProfileContext';
import { CounsellorTrainingProvider } from './contexts/CounsellorTrainingContext';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import MeetingRegistration from './pages/MeetingRegistration';
import TrainingMeeting from './pages/TrainingMeeting';
import FeedbackForm from './pages/FeedbackForm';
import TrainingForm from './pages/TrainingForm';
import AssessmentForm from './pages/AssessmentForm';
import AssessmentForm2 from './pages/AssessmentForm2';
import AssessmentForm3 from './pages/AssessmentForm3';
import AssessmentForm4 from './pages/AssessmentForm4';
import AssessmentForm5 from './pages/AssessmentForm5';
import AssessmentFormCounsellorTest from './pages/AssessmentFormCounsellorTest';
import AssessmentLayout from './components/Layout/AssessmentLayout';
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
import AssessmentResults from './pages/admin/AssessmentResults';
import TrainingFeedback from './pages/admin/TrainingFeedback';
import TrainingFormResponses from './pages/admin/TrainingFormResponses';
import Announcements from './pages/admin/Announcements';
import WebinarProgressAdmin from './pages/admin/WebinarProgress';
import CounsellorLogin from './pages/counsellor/CounsellorLogin';
import WebinarLogin from './pages/webinar/WebinarLogin';

/* Counsellor portal — lazy loaded */
import CounsellorLayout from './components/Counsellor/CounsellorLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import PageSkeleton from './components/UI/PageSkeleton';
const CounsellorDashboard = lazy(() => import('./pages/counsellor/Dashboard'));
const CounsellorStudents = lazy(() => import('./pages/counsellor/Students'));
const CounsellorAdmissions = lazy(() => import('./pages/counsellor/Admissions'));
const CounsellorSessions = lazy(() => import('./pages/counsellor/Sessions'));
const CounsellorMarketing = lazy(() => import('./pages/counsellor/Marketing'));
/* Tools and Certificate loaded eagerly to avoid dynamic import chunk failures */
import CounsellorTools from './pages/counsellor/Tools';
import CounsellorCertificate from './pages/counsellor/Certificate';
import HoliPosterPage from './pages/HoliPosterPage';
import InterPosterPage from './pages/InterPosterPage';
const CollegeReferrals = lazy(() => import('./pages/counsellor/CollegeReferrals'));
const CollegeReferralDetail = lazy(() => import('./pages/counsellor/CollegeReferralDetail'));
const AnnouncementsFeed = lazy(() => import('./pages/counsellor/AnnouncementsFeed'));
const CounsellorSettings = lazy(() => import('./pages/counsellor/Settings'));
const CounsellorHelp = lazy(() => import('./pages/counsellor/Help'));
const CounsellorTraining = lazy(() => import('./pages/counsellor/Training'));
const WebinarLayout = lazy(() => import('./pages/webinar/WebinarLayout'));
const WebinarDashboard = lazy(() => import('./pages/webinar/WebinarDashboard'));
const ProgressPage = lazy(() => import('./pages/webinar/ProgressPage'));
const DoubtsPage = lazy(() => import('./pages/webinar/DoubtsPage'));
const ProfilePage = lazy(() => import('./pages/webinar/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/webinar/SettingsPage'));
const CertificatesPage = lazy(() => import('./pages/webinar/CertificatesPage'));
const CertificateViewPage = lazy(() => import('./pages/CertificateViewPage'));
import CollegePredictorPage from './pages/CollegePredictorPage';
import RankPredictorHome from './pages/RankPredictorHome';
import ExamPredictor from './pages/ExamPredictor';
import BlogDetails from './pages/BlogDetails';
import BlogsPage from './pages/BlogsPage';
import LegacyBlogRedirect from './pages/LegacyBlogRedirect';
import AdminBlog from './pages/AdminBlog';

function ProtectedAdmin({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function ProtectedCounsellor({ children }) {
  const { isAuthenticated } = useCounsellorAuth();
  if (!isAuthenticated) {
    return <Navigate to="/counsellor/login" replace />;
  }
  return children;
}

function ProtectedWebinar({ children }) {
  const { isAuthenticated } = useWebinarAuth();
  if (!isAuthenticated) {
    return <Navigate to="/webinar/login" replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <CounsellorAuthProvider>
        <WebinarAuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<LandingPage />} />
          <Route path="/meet" element={<MeetingRegistration />} />
          <Route path="/training" element={<TrainingMeeting />} />
          <Route path="/counsellor-poster" element={<Suspense fallback={<div className="min-h-screen"><PageSkeleton /></div>}><CounsellorCertificate /></Suspense>} />
          <Route path="/holiposter" element={<HoliPosterPage />} />
          <Route path="/interposter" element={<InterPosterPage />} />
          <Route path="/certificate/:id" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-pulse text-gray-500">Loading...</div></div>}><CertificateViewPage /></Suspense>} />
          <Route path="/collegepredictor" element={<CollegePredictorPage />} />
          <Route path="/rank-predictor" element={<RankPredictorHome />} />
          <Route path="/rank-predictor/:examId" element={<ExamPredictor />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blogs/:id" element={<BlogDetails />} />
          <Route path="/blog" element={<Navigate to="/blogs" replace />} />
          <Route path="/blog/:id" element={<LegacyBlogRedirect />} />
          <Route path="/webinar/login" element={<WebinarLogin />} />
          <Route path="/webinar" element={<ProtectedWebinar><Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-pulse text-gray-500">Loading...</div></div>}><WebinarLayout /></Suspense></ProtectedWebinar>}>
            <Route index element={<Suspense fallback={<div className="p-4 animate-pulse text-gray-500">Loading...</div>}><WebinarDashboard /></Suspense>} />
            <Route path="progress" element={<Suspense fallback={<div className="p-4 animate-pulse text-gray-500">Loading...</div>}><ProgressPage /></Suspense>} />
            <Route path="doubts" element={<Suspense fallback={<div className="p-4 animate-pulse text-gray-500">Loading...</div>}><DoubtsPage /></Suspense>} />
            <Route path="profile" element={<Suspense fallback={<div className="p-4 animate-pulse text-gray-500">Loading...</div>}><ProfilePage /></Suspense>} />
            <Route path="settings" element={<Suspense fallback={<div className="p-4 animate-pulse text-gray-500">Loading...</div>}><SettingsPage /></Suspense>} />
            <Route path="certificates" element={<Suspense fallback={<div className="p-4 animate-pulse text-gray-500">Loading...</div>}><CertificatesPage /></Suspense>} />
          </Route>
          <Route path="/activationform" element={<FeedbackForm />} />
          <Route path="/training-form" element={<TrainingForm />} />
          <Route path="/assessment" element={<AssessmentForm />} />
          <Route path="/assessment-2" element={<AssessmentForm2 />} />
          <Route path="/assessment-3" element={<AssessmentForm3 />} />
          <Route path="/assessment-4" element={<AssessmentForm4 />} />
          <Route path="/assessment-5" element={<AssessmentForm5 />} />
          <Route path="/assessment-career-dna" element={<AssessmentLayout hideNavAndFooter><AssessmentFormCounsellorTest type="career-dna" /></AssessmentLayout>} />
          <Route path="/assessment-course-fit" element={<AssessmentLayout hideNavAndFooter><AssessmentFormCounsellorTest type="course-fit" /></AssessmentLayout>} />
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
            <Route path="training-feedback" element={<TrainingFeedback />} />
            <Route path="training-form-responses" element={<TrainingFormResponses />} />
            <Route path="influencer-tracking" element={<InfluencerTracking />} />
            <Route path="assessment-results" element={<AssessmentResults />} />
            <Route path="assessment-2-results" element={<Navigate to="/admin/assessment-results?type=2" replace />} />
            <Route path="assessment-3-results" element={<Navigate to="/admin/assessment-results?type=3" replace />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="webinar-progress" element={<WebinarProgressAdmin />} />
            <Route path="blogs" element={<AdminBlog />} />
          </Route>

          {/* Counsellor Portal */}
          <Route path="/counsellor/login" element={<CounsellorLogin />} />
          <Route path="/counsellor" element={<ProtectedCounsellor><CounsellorProfileProvider><CounsellorTrainingProvider><CounsellorLayout /></CounsellorTrainingProvider></CounsellorProfileProvider></ProtectedCounsellor>}>
            <Route index element={<Navigate to="/counsellor/dashboard" replace />} />
            <Route path="dashboard" element={<ErrorBoundary><Suspense fallback={<div className="h-64 flex items-center justify-center p-4"><PageSkeleton /></div>}><CounsellorDashboard /></Suspense></ErrorBoundary>} />
            <Route path="students" element={<ErrorBoundary><Suspense fallback={<div className="h-64 flex items-center justify-center p-4"><PageSkeleton /></div>}><CounsellorStudents /></Suspense></ErrorBoundary>} />
            <Route path="admissions" element={<ErrorBoundary><Suspense fallback={<div className="h-64 flex items-center justify-center p-4"><PageSkeleton /></div>}><CounsellorAdmissions /></Suspense></ErrorBoundary>} />
            <Route path="sessions" element={<ErrorBoundary><Suspense fallback={<div className="h-64 flex items-center justify-center p-4"><PageSkeleton /></div>}><CounsellorSessions /></Suspense></ErrorBoundary>} />
            <Route path="tools" element={<ErrorBoundary><CounsellorTools /></ErrorBoundary>} />
            <Route path="marketing" element={<ErrorBoundary><Suspense fallback={<div className="h-64 flex items-center justify-center p-4"><PageSkeleton /></div>}><CounsellorMarketing /></Suspense></ErrorBoundary>} />
            <Route path="certificate" element={<ErrorBoundary><CounsellorCertificate /></ErrorBoundary>} />
            <Route path="college-referrals" element={<ErrorBoundary><Suspense fallback={<div className="h-64 flex items-center justify-center p-4"><PageSkeleton /></div>}><CollegeReferrals /></Suspense></ErrorBoundary>} />
            <Route path="college-referrals/:collegeSlug" element={<ErrorBoundary><Suspense fallback={<div className="h-64 flex items-center justify-center p-4"><PageSkeleton /></div>}><CollegeReferralDetail /></Suspense></ErrorBoundary>} />
            <Route path="announcements-feed" element={<ErrorBoundary><Suspense fallback={<div className="h-64 flex items-center justify-center p-4"><PageSkeleton /></div>}><AnnouncementsFeed /></Suspense></ErrorBoundary>} />
            <Route path="training" element={<ErrorBoundary><Suspense fallback={<div className="h-64 flex items-center justify-center p-4"><PageSkeleton /></div>}><CounsellorTraining /></Suspense></ErrorBoundary>} />
            <Route path="settings" element={<ErrorBoundary><Suspense fallback={<div className="h-64 flex items-center justify-center p-4"><PageSkeleton /></div>}><CounsellorSettings /></Suspense></ErrorBoundary>} />
            <Route path="help" element={<ErrorBoundary><Suspense fallback={<div className="h-64 flex items-center justify-center p-4"><PageSkeleton /></div>}><CounsellorHelp /></Suspense></ErrorBoundary>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </WebinarAuthProvider>
        </CounsellorAuthProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
