import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import SplitLoginLayout, {
  LoginAlert,
  LoginPrimaryButton,
} from '../../components/auth/SplitLoginLayout';
import { useBdaAuth } from '../../contexts/BdaAuthContext';

export default function BdaLogin() {
  const { login, isAuthenticated } = useBdaAuth();
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/bda/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!loginId.trim()) {
      setError('Enter email or phone number');
      return;
    }
    if (!password) {
      setError('Enter password');
      return;
    }
    setLoading(true);
    const res = await login(loginId.trim(), password);
    setLoading(false);
    if (res.success) {
      navigate('/bda/dashboard', { replace: true });
    } else {
      setError(res.message || 'Login failed');
    }
  };

  return (
    <SplitLoginLayout
      badgeLabel="BDA Login"
      headline="Connect with students. Track leads and grow conversions every day."
      steps={[
        { label: 'Sign in with your BDA email or phone and password', active: true },
        { label: 'Access your BDA Calling Dashboard', active: false },
      ]}
      rightTitle="Your BDA workspace starts here"
      rightSubtitle="Sign in with credentials provided by your admin"
      footer={<p className="text-xs text-gray-400 text-center">© 2026 GuideXpert</p>}
    >
      <LoginAlert message={error} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="bda-login-id" className="block text-sm font-medium text-gray-900 mb-1">
            Email or phone
          </label>
          <input
            id="bda-login-id"
            type="text"
            autoComplete="username"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="you@email.com or 10-digit mobile"
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500"
          />
        </div>
        <div>
          <label htmlFor="bda-password" className="block text-sm font-medium text-gray-900 mb-1">
            Password
          </label>
          <input
            id="bda-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500"
          />
        </div>
        <LoginPrimaryButton loading={loading}>{loading ? 'Signing in…' : 'Sign in'}</LoginPrimaryButton>
      </form>
    </SplitLoginLayout>
  );
}
