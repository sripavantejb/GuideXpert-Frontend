import { useState } from 'react';
import { useOneOnOneCounselorAuth } from '../../contexts/OneOnOneCounselorAuthContext';
import { oocUpdateProfile } from '../../utils/oneOnOneCounselorApi';

export default function OneOnOneCounselorProfile() {
  const { user, refreshUser } = useOneOnOneCounselorAuth();
  const [bio, setBio] = useState(user?.bio || '');
  const [designation, setDesignation] = useState(user?.designation || '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const body = { bio, designation };
    if (password.length >= 6) body.password = password;
    const res = await oocUpdateProfile(body);
    setLoading(false);
    if (res.success) {
      await refreshUser();
      setMessage('Profile updated.');
      setPassword('');
    } else {
      setMessage(res.message || 'Update failed');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-lg">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Profile</h1>
      <dl className="text-sm space-y-2 mb-6">
        <div>
          <dt className="text-slate-500">Name</dt>
          <dd className="font-medium">{user?.name}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Email</dt>
          <dd>{user?.email}</dd>
        </div>
        <div>
          <dt className="text-slate-500">College</dt>
          <dd>{user?.collegeName || '—'}</dd>
        </div>
      </dl>
      <form onSubmit={save} className="space-y-4 bg-white border rounded-xl p-5">
        <div>
          <label className="block text-sm font-medium mb-1">Designation</label>
          <input
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">New password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Leave blank to keep current"
          />
        </div>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="py-2 px-4 rounded-lg bg-[#0f2744] text-white text-sm font-medium disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}
