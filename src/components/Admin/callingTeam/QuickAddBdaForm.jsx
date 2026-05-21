import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { createBda } from '../../../utils/callingTeamApi';

export default function QuickAddBdaForm({ onCreated, compact = false }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('Enter BDA name (at least 2 characters)');
      return;
    }
    const emailVal = email.trim().toLowerCase();
    if (!emailVal || !emailVal.includes('@')) {
      setError('Valid email is required for BDA login');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    const res = await createBda({
      name: trimmed,
      phone: phone.trim() || undefined,
      email: emailVal,
      password,
      status: 'active',
    });
    setSaving(false);
    if (res.success) {
      setSuccess(`Added ${trimmed}`);
      setName('');
      setPhone('');
      setEmail('');
      setPassword('');
      onCreated?.(res.data?.data);
    } else {
      const msg = res.message || 'Could not create BDA';
      if (res.status === 404) {
        setError(`${msg}. Deploy the latest backend (BDA routes) or point Vite proxy to a local API.`);
      } else {
        setError(msg);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white border border-primary-blue-200 rounded-xl p-4 ${compact ? '' : 'shadow-sm'}`}
    >
      <p className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
        <FiPlus className="text-primary-blue" />
        Add BDA
      </p>
      <div className={`grid gap-3 ${compact ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5' : 'grid-cols-1 md:grid-cols-5'}`}>
        <input
          required
          placeholder="Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <input
          placeholder="Phone (optional, 10 digits)"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          inputMode="numeric"
        />
        <input
          type="email"
          required
          placeholder="Email *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password * (min 6)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-blue text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save BDA'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-2 text-sm text-green-700">{success}</p>}
    </form>
  );
}
