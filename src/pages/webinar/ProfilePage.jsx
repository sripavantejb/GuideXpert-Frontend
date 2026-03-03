import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiAward, FiSettings } from 'react-icons/fi';
import { useWebinar } from './context/WebinarContext';
import { SESSIONS } from './data/mockWebinarData';

function formatWatchTime(seconds) {
  if (!seconds || seconds < 0) return '0m';
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
}

export default function ProfilePage() {
  const {
    user,
    completedSessions,
    playbackPosition,
    bookmarkedSessions,
  } = useWebinar();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || 'Trainee');

  const totalSessions = SESSIONS.length;
  const completedCount = completedSessions?.length ?? 0;
  const completionPercent = totalSessions
    ? Math.round((completedCount / totalSessions) * 100)
    : 0;

  const totalWatchSeconds = useMemo(() => {
    return Object.values(playbackPosition || {}).reduce((a, b) => a + (Number(b) || 0), 0);
  }, [playbackPosition]);

  const bookmarksCount = bookmarkedSessions?.length ?? 0;

  const lastWatchedSession = useMemo(() => {
    if (!playbackPosition || typeof playbackPosition !== 'object') return null;
    let maxPos = 0;
    let sessionId = null;
    for (const [id, pos] of Object.entries(playbackPosition)) {
      const p = Number(pos) || 0;
      if (p > maxPos) {
        maxPos = p;
        sessionId = id;
      }
    }
    return sessionId ? SESSIONS.find((s) => s.id === sessionId) : null;
  }, [playbackPosition]);

  const displayName = user?.name || 'Trainee';
  const setDisplayName = user?.setDisplayName;

  const handleSaveName = () => {
    const trimmed = String(nameInput).trim();
    if (setDisplayName && trimmed) setDisplayName(trimmed);
    else if (setDisplayName) setDisplayName('');
    setEditingName(false);
  };

  return (
    <div className="px-4 py-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">Profile</h1>

      {/* Header: avatar + display name */}
      <div className="rounded-[20px] bg-white border border-gray-200 shadow-card p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 shrink-0 border-2 border-gray-100">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="w-full h-full flex items-center justify-center text-3xl font-semibold text-gray-500">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0 text-center sm:text-left">
            {editingName ? (
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                  placeholder="Display name"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="px-3 py-2 bg-primary-navy text-white rounded-lg text-sm font-medium hover:bg-primary-navy/90 transition-colors"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-xl font-semibold text-gray-800">
                  {displayName}
                </h2>
                {setDisplayName && (
                  <button
                    type="button"
                    onClick={() => {
                      setNameInput(displayName);
                      setEditingName(true);
                    }}
                    className="text-sm text-primary-navy hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats block */}
      <div className="rounded-[20px] bg-white border border-gray-200 shadow-card p-6">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
          Your stats
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-2xl font-bold text-primary-navy">{completionPercent}%</p>
            <p className="text-sm text-gray-600">Course completion</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-2xl font-bold text-gray-800">
              {completedCount} <span className="text-base font-normal text-gray-500">/ {totalSessions}</span>
            </p>
            <p className="text-sm text-gray-600">Sessions completed</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-2xl font-bold text-gray-800">{formatWatchTime(totalWatchSeconds)}</p>
            <p className="text-sm text-gray-600">Total watch time</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-2xl font-bold text-gray-800">{bookmarksCount}</p>
            <p className="text-sm text-gray-600">Bookmarks</p>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="rounded-[20px] bg-white border border-gray-200 shadow-card p-6">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
          Quick links
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/webinar/certificates"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-primary-blue-50 text-primary-navy font-medium hover:bg-primary-blue-100 transition-colors"
          >
            <FiAward className="w-5 h-5" />
            My Certificates
          </Link>
          <Link
            to="/webinar/settings"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition-colors"
          >
            <FiSettings className="w-5 h-5" />
            Settings
          </Link>
        </div>
      </div>

      {/* Last watched (optional) */}
      {lastWatchedSession && (
        <div className="rounded-[20px] bg-white border border-gray-200 shadow-card p-6">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">
            Last watched
          </h2>
          <p className="text-sm text-gray-600">
            <Link
              to="/webinar"
              className="text-primary-navy font-medium hover:underline"
            >
              {lastWatchedSession.title}
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
