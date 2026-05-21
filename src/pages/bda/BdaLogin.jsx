import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">GuideXpert</h1>
          <p className="text-sm text-gray-600 mt-1">BDA Portal — Sign in</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email or phone</label>
            <input
              type="text"
              autoComplete="username"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
              placeholder="you@email.com or 10-digit mobile"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary-blue text-white font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
