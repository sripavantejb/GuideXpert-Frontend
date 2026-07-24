import { Link } from 'react-router-dom';
import { FiLogOut, FiUser } from 'react-icons/fi';
import { useStudentAuthRequired } from '../../contexts/StudentAuthContext';
import { studyingLabel } from '../../utils/studentProfileStore';
import ToolWorkspaceLayout from '../pages/studentsTools/components/ToolWorkspaceLayout';
import {
  swBtnSecondary,
  swEmptyState,
  swFormSubtitle,
  swFormTitle,
  swInput,
  swLabel,
  swResultsPanel,
  swSectionSubtitle,
  swSectionTitle,
  swSelect,
  swBtnPrimary,
} from '../pages/studentsTools/components/studentWorkspaceUi';
import { STUDYING_OPTIONS } from '../../utils/studentProfileStore';
import { useState } from 'react';
import RequireStudentAuth from './RequireStudentAuth';

function formatWhen(iso) {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function PredictionCard({ item }) {
  return (
    <article className="border border-[#d5dde8] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a94a0]">
            {item.tool || item.type}
          </p>
          <h3 className="mt-1 font-sw-display text-base font-bold text-[#041e30]">{item.title}</h3>
          {item.summary ? (
            <p className="mt-1.5 text-sm leading-relaxed text-[#5a6570]">{item.summary}</p>
          ) : null}
        </div>
        <time className="shrink-0 text-xs text-[#8a94a0]" dateTime={item.createdAt}>
          {formatWhen(item.createdAt)}
        </time>
      </div>
    </article>
  );
}

function ProfileContent() {
  const { profile, session, predictions, updateProfile, logout } = useStudentAuthRequired();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: profile?.fullName || session?.fullName || '',
    age: profile?.age != null ? String(profile.age) : '',
    currentlyStudying: profile?.currentlyStudying || '',
    city: profile?.city || '',
  });
  const [savedMsg, setSavedMsg] = useState('');

  const onSave = (e) => {
    e.preventDefault();
    updateProfile({
      fullName: form.fullName.trim(),
      age: form.age ? Number(form.age) : null,
      currentlyStudying: form.currentlyStudying,
      city: form.city.trim(),
    });
    setEditing(false);
    setSavedMsg('Profile updated.');
    setTimeout(() => setSavedMsg(''), 2500);
  };

  return (
    <ToolWorkspaceLayout
      title="My profile"
      subtitle="Your details and every prediction you’ve run in GuideXpert tools."
      howItWorks={[
        'Sign up once with name, age, and what you’re studying.',
        'Login before using any predictor so results stay linked to you.',
        'All rank, college, and fit predictions appear in this profile history.',
      ]}
      showRelatedTools
      results={
        <section className={swResultsPanel}>
          <h2 className={swSectionTitle}>Your predictions</h2>
          <p className={swSectionSubtitle}>
            {predictions.length
              ? `${predictions.length} saved result${predictions.length === 1 ? '' : 's'}.`
              : 'No predictions yet — run a tool to see results here.'}
          </p>
          {predictions.length ? (
            <div className="mt-6 space-y-3">
              {predictions.map((item) => (
                <PredictionCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className={`mt-6 ${swEmptyState}`}>
              <p className="text-sm text-[#5a6570]">Try the College Predictor or a Rank Predictor to get started.</p>
              <Link
                to="/students/college-predictor"
                className="mt-4 inline-flex text-sm font-semibold text-[#f27921] hover:underline"
              >
                Open College Predictor
              </Link>
            </div>
          )}
        </section>
      }
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center bg-[#041e30] text-white">
          <FiUser className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className={swFormTitle}>{profile?.fullName || session?.fullName || 'Student'}</h2>
          <p className={swFormSubtitle}>{session?.phone}</p>
        </div>
      </div>

      {savedMsg ? <p className="mb-3 text-sm font-semibold text-[#e06810]">{savedMsg}</p> : null}

      {editing ? (
        <form className="space-y-4" onSubmit={onSave}>
          <label className={swLabel}>
            Full name
            <input
              className={swInput}
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
            />
          </label>
          <label className={swLabel}>
            Age
            <input
              className={swInput}
              type="number"
              min={10}
              max={80}
              value={form.age}
              onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
            />
          </label>
          <label className={swLabel}>
            Currently studying
            <select
              className={swSelect}
              value={form.currentlyStudying}
              onChange={(e) => setForm((p) => ({ ...p, currentlyStudying: e.target.value }))}
            >
              <option value="">Select</option>
              {STUDYING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className={swLabel}>
            City
            <input
              className={swInput}
              value={form.city}
              onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={swBtnPrimary}>
              Save profile
            </button>
            <button type="button" className={swBtnSecondary} onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3 text-sm">
          <p>
            <span className="text-[#8a94a0]">Age</span>
            <span className="mt-0.5 block font-semibold text-[#041e30]">{profile?.age ?? '—'}</span>
          </p>
          <p>
            <span className="text-[#8a94a0]">Currently studying</span>
            <span className="mt-0.5 block font-semibold text-[#041e30]">
              {studyingLabel(profile?.currentlyStudying)}
            </span>
          </p>
          <p>
            <span className="text-[#8a94a0]">City</span>
            <span className="mt-0.5 block font-semibold text-[#041e30]">{profile?.city || '—'}</span>
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <button type="button" className={swBtnPrimary} onClick={() => setEditing(true)}>
              Edit profile
            </button>
            <button type="button" className={swBtnSecondary} onClick={logout}>
              <FiLogOut className="h-4 w-4" aria-hidden />
              Logout
            </button>
          </div>
        </div>
      )}
    </ToolWorkspaceLayout>
  );
}

export default function StudentProfilePage() {
  return (
    <RequireStudentAuth title="Login to view your profile">
      <ProfileContent />
    </RequireStudentAuth>
  );
}
