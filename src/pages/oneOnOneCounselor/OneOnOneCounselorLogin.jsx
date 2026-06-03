import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import SplitLoginLayout, { LoginAlert, LoginPrimaryButton } from '../../components/auth/SplitLoginLayout';
import { useOneOnOneCounselorAuth } from '../../contexts/OneOnOneCounselorAuthContext';

export default function OneOnOneCounselorLogin() {
  const { login, isAuthenticated } = useOneOnOneCounselorAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/one-on-one-counselor/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Enter email and password');
      return;
    }
    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);
    if (res.success) {
      navigate('/one-on-one-counselor/dashboard', { replace: true });
    } else {
      setError(res.message || 'Login failed');
    }
  };

  return (
    <SplitLoginLayout
      badgeLabel="One-on-One Counselor"
      headline="Guide students through personalized IIT and career guidance sessions."
      steps={[
        { label: 'Sign in with your GuideXpert counselor email', active: true },
        { label: 'Manage your slots and student bookings', active: false },
      ]}
      rightTitle="Counselor workspace"
      rightSubtitle="Credentials are provided by GuideXpert admin"
      footer={<p className="text-xs text-gray-400 text-center">© 2026 GuideXpert</p>}
    >
      <LoginAlert message={error} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="ooc-email" className="block text-sm font-medium text-gray-900 mb-1">
            Email
          </label>
          <input
            id="ooc-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="ooc-password" className="block text-sm font-medium text-gray-900 mb-1">
            Password
          </label>
          <input
            id="ooc-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
            autoComplete="current-password"
          />
        </div>
        <LoginPrimaryButton loading={loading}>Sign in</LoginPrimaryButton>
      </form>
    </SplitLoginLayout>
  );
}
