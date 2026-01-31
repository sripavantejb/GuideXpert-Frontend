import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './components/Admin/AdminLayout';
import Overview from './pages/admin/Overview';
import Leads from './pages/admin/Leads';
import Analytics from './pages/admin/Analytics';
import Slots from './pages/admin/Slots';
import Export from './pages/admin/Export';
import Settings from './pages/admin/Settings';

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
            <Route path="analytics" element={<Analytics />} />
            <Route path="slots" element={<Slots />} />
            <Route path="export" element={<Export />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
