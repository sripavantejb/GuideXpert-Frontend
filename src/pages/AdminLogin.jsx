import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (result.success) {
      navigate('/admin', { replace: true });
    } else {
      setError(result.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8" style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
          <h1 className="text-2xl font-bold text-primary-blue-600 mb-2" style={{ color: '#003366' }}>
            GuideXpert Admin
          </h1>
          <p className="text-gray-500 text-sm mb-6">Sign in to view leads</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none"
                placeholder="Username"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none"
                placeholder="Password"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg font-medium text-white bg-primary-blue-600 hover:bg-primary-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: '#003366' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            {import.meta.env.DEV && (
              <p className="mt-4 text-xs text-gray-400 text-center">
                Dev: use <kbd className="px-1 py-0.5 bg-gray-200 rounded">admin</kbd> / <kbd className="px-1 py-0.5 bg-gray-200 rounded">admin123</kbd> (sample admin is created on first login if none exist).
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}




