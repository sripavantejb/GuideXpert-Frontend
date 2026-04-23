import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
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
import FunnelAnalytics from './pages/admin/FunnelAnalytics';
import Leads from './pages/admin/Leads';
import IitCounselling from './pages/admin/IitCounselling';
import IitCounsellingUtm from './pages/admin/IitCounsellingUtm';
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
import OsviCalls from './pages/admin/OsviCalls';
import OsviCallsData from './pages/admin/OsviCallsData';
import PosterDownloads from './pages/admin/PosterDownloads';
import CertifiedCounsellors from './pages/admin/CertifiedCounsellors';
import PosterAutomationAdminPage from './pages/admin/posters/PosterAutomationAdminPage';
import PosterPublicPage from './pages/PosterPublicPage';
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
import CounsellorRankPredictorHome from './pages/counsellor/CounsellorRankPredictorHome';
import CounsellorExamPredictor from './pages/counsellor/CounsellorExamPredictor';
import CounsellorCertificate from './pages/counsellor/Certificate';
const CollegePredictorExams = lazy(() => import('./pages/counsellor/CollegePredictorExams'));
const CollegePredictorPredict = lazy(() => import('./pages/counsellor/CollegePredictorPredict'));
import HoliPosterPage from './pages/HoliPosterPage';
import InterPosterPage from './pages/InterPosterPage';
import GxPosterPage from './pages/GxPosterPage';
import SidPosterPage from './pages/SidPosterPage';
import WrongCareerChoicePosterPage from './pages/WrongCareerChoicePosterPage';
import InterResultsPosterPage from './pages/InterResultsPosterPage';
import BtechCsePosterPage from './pages/BtechCsePosterPage';
import JeePosterPage from './pages/JeePosterPage';
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
const StudentsDashboard = lazy(() => import('./pages/StudentsDashboard'));
const IitCounsellingPage = lazy(() => import('./pages/IitCounsellingPage'));
const RankPredictorToolPage = lazy(() => import('./pages/studentsTools/RankPredictorPage'));
const StudentExamPredictorPage = lazy(() => import('./pages/studentsTools/StudentExamPredictorPage'));
const CollegePredictorToolPage = lazy(() => import('./pages/studentsTools/CollegePredictorPage'));
const BranchPredictorToolPage = lazy(() => import('./pages/studentsTools/BranchPredictorPage'));
const CourseFitTestToolPage = lazy(() => import('./pages/studentsTools/CourseFitTestPage'));
const CollegeFitTestToolPage = lazy(() => import('./pages/studentsTools/CollegeFitTestPage'));
const CollegeComparisonToolPage = lazy(() => import('./pages/studentsTools/CollegeComparisonPage'));
const ExamPredictorToolPage = lazy(() => import('./pages/studentsTools/ExamPredictorPage'));
const DeadlineManagerToolPage = lazy(() => import('./pages/studentsTools/DeadlineManagerPage'));
const PredictorsHubPage = lazy(() => import('./pages/studentsTools/PredictorsHubPage'));
const TestsHubPage = lazy(() => import('./pages/studentsTools/TestsHubPage'));
import CollegePredictorPage from './pages/CollegePredictorPage';
import RankPredictorHome from './pages/RankPredictorHome';
import ExamPredictor from './pages/ExamPredictor';
import BlogDetails from './pages/BlogDetails';
import BlogsPage from './pages/BlogsPage';
import LegacyBlogRedirect from './pages/LegacyBlogRedirect';
import AdminBlog from './pages/AdminBlog';
import { onAdminUnauthorized, onCounsellorUnauthorized, onWebinarUnauthorized } from './utils/authSession';

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

function SessionExpiryRedirects() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout: adminLogout } = useAuth();
  const { logout: webinarLogout } = useWebinarAuth();
  const { logout: counsellorLogout } = useCounsellorAuth();

  useEffect(() => {
    const offAdmin = onAdminUnauthorized(() => {
      adminLogout();
      if (!location.pathname.startsWith('/admin/login')) {
        navigate('/admin/login', { replace: true });
      }
    });
    const offWebinar = onWebinarUnauthorized(() => {
      webinarLogout();
      if (!location.pathname.startsWith('/webinar/login')) {
        navigate('/webinar/login', { replace: true });
      }
    });
    const offCounsellor = onCounsellorUnauthorized(() => {
      counsellorLogout();
      if (!location.pathname.startsWith('/counsellor/login')) {
        navigate('/counsellor/login', { replace: true });
      }
    });
    return () => {
      offAdmin();
      offWebinar();
      offCounsellor();
    };
  }, [adminLogout, counsellorLogout, webinarLogout, location.pathname, navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CounsellorAuthProvider>
          <WebinarAuthProvider>
            <SessionExpiryRedirects />
            <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<LandingPage />} />
          <Route path="/meet" element={<MeetingRegistration />} />
          <Route path="/training" element={<TrainingMeeting />} />
          <Route path="/counsellor-poster" element={<Suspense fallback={<div className="min-h-screen"><PageSkeleton /></div>}><CounsellorCertificate /></Suspense>} />
          <Route path="/holiposter" element={<HoliPosterPage />} />
          <Route path="/interposter" element={<InterPosterPage />} />
          <Route path="/gx-poster" element={<GxPosterPage />} />
          <Route path="/sid-poster" element={<SidPosterPage />} />
          <Route path="/wrong-career-choice" element={<WrongCareerChoicePosterPage />} />
          <Route path="/inter-results-poster" element={<InterResultsPosterPage />} />
          <Route path="/btechcse-poster" element={<BtechCsePosterPage />} />
          <Route path="/jee-poster" element={<JeePosterPage />} />
          <Route path="/certificate/:id" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-pulse text-gray-500">Loading...</div></div>}><CertificateViewPage /></Suspense>} />
          <Route path="/collegepredictor" element={<CollegePredictorPage />} />
          <Route path="/rank-predictor" element={<RankPredictorHome />} />
          <Route path="/rank-predictor/:examId" element={<ExamPredictor />} />
          <Route
            path="/iit-counselling"
            element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white"><div className="animate-pulse text-sm font-medium">Loading counselling form…</div></div>}>
                <IitCounsellingPage />
              </Suspense>
            }
          />
          <Route
            path="/students"
            element={
              <Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white">
                    <div className="animate-pulse text-sm font-medium">Loading intelligence suite…</div>
                  </div>
                }
              >
                <StudentsDashboard />
              </Suspense>
            }
          />
          <Route
            path="/students/rank-predictor"
            element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white"><div className="animate-pulse text-sm font-medium">Loading rank predictor…</div></div>}>
                <RankPredictorToolPage />
              </Suspense>
            }
          />
          <Route
            path="/students/rank-predictor/:examId"
            element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white"><div className="animate-pulse text-sm font-medium">Loading exam predictor…</div></div>}>
                <StudentExamPredictorPage />
              </Suspense>
            }
          />
          <Route
            path="/students/predictors"
            element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white"><div className="animate-pulse text-sm font-medium">Loading predictor hub…</div></div>}>
                <PredictorsHubPage />
              </Suspense>
            }
          />
          <Route
            path="/students/tests"
            element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white"><div className="animate-pulse text-sm font-medium">Loading tests hub…</div></div>}>
                <TestsHubPage />
              </Suspense>
            }
          />
          <Route
            path="/students/college-predictor"
            element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white"><div className="animate-pulse text-sm font-medium">Loading college predictor…</div></div>}>
                <CollegePredictorToolPage />
              </Suspense>
            }
          />
          <Route
            path="/students/branch-predictor"
            element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white"><div className="animate-pulse text-sm font-medium">Loading branch predictor…</div></div>}>
                <BranchPredictorToolPage />
              </Suspense>
            }
          />
          <Route
            path="/students/course-fit-test"
            element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white"><div className="animate-pulse text-sm font-medium">Loading course fit test…</div></div>}>
                <CourseFitTestToolPage />
              </Suspense>
            }
          />
          <Route
            path="/students/college-fit-test"
            element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white"><div className="animate-pulse text-sm font-medium">Loading college fit test…</div></div>}>
                <CollegeFitTestToolPage />
              </Suspense>
            }
          />
          <Route
            path="/students/college-comparison"
            element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white"><div className="animate-pulse text-sm font-medium">Loading comparison workspace…</div></div>}>
                <CollegeComparisonToolPage />
              </Suspense>
            }
          />
          <Route
            path="/students/exam-predictor"
            element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white"><div className="animate-pulse text-sm font-medium">Loading exam predictor…</div></div>}>
                <ExamPredictorToolPage />
              </Suspense>
            }
          />
          <Route
            path="/students/deadline-manager"
            element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white"><div className="animate-pulse text-sm font-medium">Loading deadline manager…</div></div>}>
                <DeadlineManagerToolPage />
              </Suspense>
            }
          />
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
            <Route path="funnel-analytics" element={<FunnelAnalytics />} />
            <Route path="certified-counsellors" element={<CertifiedCounsellors />} />
            <Route path="leads" element={<Leads />} />
            <Route path="iit-counselling" element={<IitCounselling />} />
            <Route path="iit-counselling-utm" element={<IitCounsellingUtm />} />
            <Route path="organic-rank-leads" element={<Leads organicOnly />} />
            <Route path="lead-status" element={<LeadStatus />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="slots" element={<Slots />} />
            <Route path="export" element={<Export />} />
            <Route path="settings" element={<Settings />} />
            <Route path="meeting-attendance" element={<MeetingAttendance />} />
            <Route path="training-feedback" element={<TrainingFeedback />} />
            <Route path="training-form-responses" element={<TrainingFormResponses />} />
            <Route path="influencer-tracking" element={<InfluencerTracking />} />
            <Route path="poster-downloads" element={<PosterDownloads />} />
            <Route path="posters" element={<PosterAutomationAdminPage />} />
            <Route path="assessment-results" element={<AssessmentResults />} />
            <Route path="assessment-2-results" element={<Navigate to="/admin/assessment-results?type=2" replace />} />
            <Route path="assessment-3-results" element={<Navigate to="/admin/assessment-results?type=3" replace />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="webinar-progress" element={<WebinarProgressAdmin />} />
            <Route path="blogs" element={<AdminBlog />} />
            <Route path="osvi-calls" element={<OsviCalls />} />
            <Route path="osvi-calls-data" element={<OsviCallsData />} />
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
            <Route path="tools/rank-predictor" element={<ErrorBoundary><CounsellorRankPredictorHome /></ErrorBoundary>} />
            <Route path="tools/rank-predictor/:examId" element={<ErrorBoundary><CounsellorExamPredictor /></ErrorBoundary>} />
            <Route path="tools/college-predictor" element={<ErrorBoundary><Suspense fallback={<div className="h-64 flex items-center justify-center p-4"><PageSkeleton /></div>}><CollegePredictorExams /></Suspense></ErrorBoundary>} />
            <Route path="tools/college-predictor/:exam" element={<ErrorBoundary><Suspense fallback={<div className="h-64 flex items-center justify-center p-4"><PageSkeleton /></div>}><CollegePredictorPredict /></Suspense></ErrorBoundary>} />
            <Route path="marketing" element={<ErrorBoundary><Suspense fallback={<div className="h-64 flex items-center justify-center p-4"><PageSkeleton /></div>}><CounsellorMarketing /></Suspense></ErrorBoundary>} />
            <Route path="certificate" element={<ErrorBoundary><CounsellorCertificate /></ErrorBoundary>} />
            <Route path="college-referrals" element={<ErrorBoundary><Suspense fallback={<div className="h-64 flex items-center justify-center p-4"><PageSkeleton /></div>}><CollegeReferrals /></Suspense></ErrorBoundary>} />
            <Route path="college-referrals/:collegeSlug" element={<ErrorBoundary><Suspense fallback={<div className="h-64 flex items-center justify-center p-4"><PageSkeleton /></div>}><CollegeReferralDetail /></Suspense></ErrorBoundary>} />
            <Route path="know-about-colleges" element={<ErrorBoundary><Suspense fallback={<div className="h-64 flex items-center justify-center p-4"><PageSkeleton /></div>}><CollegeReferrals /></Suspense></ErrorBoundary>} />
            <Route path="know-about-colleges/:collegeSlug" element={<ErrorBoundary><Suspense fallback={<div className="h-64 flex items-center justify-center p-4"><PageSkeleton /></div>}><CollegeReferralDetail /></Suspense></ErrorBoundary>} />
            <Route path="announcements-feed" element={<ErrorBoundary><Suspense fallback={<div className="h-64 flex items-center justify-center p-4"><PageSkeleton /></div>}><AnnouncementsFeed /></Suspense></ErrorBoundary>} />
            <Route path="training" element={<ErrorBoundary><Suspense fallback={<div className="h-64 flex items-center justify-center p-4"><PageSkeleton /></div>}><CounsellorTraining /></Suspense></ErrorBoundary>} />
            <Route path="settings" element={<ErrorBoundary><Suspense fallback={<div className="h-64 flex items-center justify-center p-4"><PageSkeleton /></div>}><CounsellorSettings /></Suspense></ErrorBoundary>} />
            <Route path="help" element={<ErrorBoundary><Suspense fallback={<div className="h-64 flex items-center justify-center p-4"><PageSkeleton /></div>}><CounsellorHelp /></Suspense></ErrorBoundary>} />
          </Route>

          <Route path="/p/*" element={<PosterPublicPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </WebinarAuthProvider>
        </CounsellorAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
