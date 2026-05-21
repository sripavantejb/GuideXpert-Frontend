import { useState } from 'react';
import { FiCopy, FiKey, FiRefreshCw } from 'react-icons/fi';
import { BDA_LANGUAGES } from '../../../constants/bdaLanguage';
import { createBda } from '../../../utils/callingTeamApi';

const BDA_LOGIN_PATH = '/bda/login';

function generatePassword() {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 10; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs border rounded-md hover:bg-gray-50"
      title={`Copy ${label}`}
    >
      <FiCopy className="w-3 h-3" />
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function BdaCredentialsPanel({ onCreated }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [language, setLanguage] = useState('Hindi');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [createdCreds, setCreatedCreds] = useState(null);

  const loginUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${BDA_LOGIN_PATH}` : BDA_LOGIN_PATH;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCreatedCreds(null);

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('BDA name is required (at least 2 characters)');
      return;
    }
    const emailVal = email.trim().toLowerCase();
    if (!emailVal || !emailVal.includes('@')) {
      setError('Valid email is required — BDAs use this to sign in');
      return;
    }
    const phoneVal = phone.replace(/\D/g, '').slice(-10);
    if (phoneVal && phoneVal.length !== 10) {
      setError('Phone must be exactly 10 digits, or leave blank');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and confirm password do not match');
      return;
    }
    if (!BDA_LANGUAGES.some((l) => l.value === language)) {
      setError('Select BDA language (Hindi or Telugu)');
      return;
    }

    setSaving(true);
    const res = await createBda({
      name: trimmed,
      phone: phoneVal || undefined,
      email: emailVal,
      password,
      language,
      status: 'active',
    });
    setSaving(false);

    if (res.success) {
      setCreatedCreds({
        name: trimmed,
        email: emailVal,
        phone: phoneVal || '',
        password,
        language,
        loginUrl,
      });
      setName('');
      setPhone('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      onCreated?.(res.data?.data);
    } else {
      const msg = res.message || 'Could not create BDA credentials';
      setError(
        res.status === 404
          ? `${msg}. Deploy the latest backend or point Vite proxy to your local API.`
          : msg
      );
    }
  };

  return (
    <section className="bg-white rounded-xl border border-primary-blue-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b bg-primary-blue-50/80 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <FiKey className="text-primary-blue" />
            Create BDA login credentials
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Admin creates email/phone and password here. The BDA signs in at{' '}
            <a href={BDA_LOGIN_PATH} target="_blank" rel="noreferrer" className="text-primary-blue font-medium underline">
              {BDA_LOGIN_PATH}
            </a>{' '}
            (separate from admin login).
          </p>
        </div>
        <div className="text-xs text-gray-600 bg-white border rounded-lg px-3 py-2">
          <span className="font-medium text-gray-800">Portal URL:</span>{' '}
          <code className="text-primary-navy">{loginUrl}</code>
          <div className="mt-1">
            <CopyButton text={loginUrl} label="portal URL" />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-xs font-medium text-gray-600">BDA name *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">BDA language *</label>
            <select
              required
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              {BDA_LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label} leads
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-0.5">Must match IIT form preferred language</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Login email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="bda@example.com"
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Login phone (optional)</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit mobile"
              inputMode="numeric"
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-500 mt-0.5">BDA can sign in with email or this phone</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Password *</label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => {
                  const p = generatePassword();
                  setPassword(p);
                  setConfirmPassword(p);
                }}
                className="px-3 py-2 text-xs font-medium border rounded-lg hover:bg-gray-50 whitespace-nowrap"
              >
                Generate
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Confirm password *</label>
            <input
              type="text"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              autoComplete="new-password"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 text-sm font-medium rounded-lg bg-primary-blue text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Creating…' : 'Create credentials & activate BDA'}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {createdCreds && (
        <div className="mx-4 mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm">
          <p className="font-semibold text-green-900 mb-2">Credentials created — share with the BDA</p>
          <ul className="space-y-2 text-gray-800">
            <li className="flex flex-wrap items-center gap-2">
              <span className="font-medium">Name:</span> {createdCreds.name}
            </li>
            <li>
              <span className="font-medium">Language:</span> {createdCreds.language}
            </li>
            <li className="flex flex-wrap items-center gap-2">
              <span className="font-medium">Email:</span> {createdCreds.email}
              <CopyButton text={createdCreds.email} label="email" />
            </li>
            {createdCreds.phone && (
              <li className="flex flex-wrap items-center gap-2">
                <span className="font-medium">Phone:</span> {createdCreds.phone}
                <CopyButton text={createdCreds.phone} label="phone" />
              </li>
            )}
            <li className="flex flex-wrap items-center gap-2">
              <span className="font-medium">Password:</span>
              <code className="bg-white px-2 py-0.5 rounded border">{createdCreds.password}</code>
              <CopyButton text={createdCreds.password} label="password" />
            </li>
            <li className="flex flex-wrap items-center gap-2">
              <span className="font-medium">Login URL:</span>
              <code className="text-xs break-all">{createdCreds.loginUrl}</code>
              <CopyButton text={createdCreds.loginUrl} label="login URL" />
            </li>
          </ul>
          <button
            type="button"
            onClick={() => setCreatedCreds(null)}
            className="mt-3 text-xs text-green-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </section>
  );
}
