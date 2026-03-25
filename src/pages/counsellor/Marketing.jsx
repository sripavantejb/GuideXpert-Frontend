import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiCopy, FiDownload } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import { useCounsellorProfile } from '../../contexts/CounsellorProfileContext';
import MarketingPoster from '../../components/Counsellor/MarketingPoster';

const HEADLINE_OPTIONS = [
  'Free Career Assessment',
  'Webinar: Choose Your Path',
  'Book a Session',
];
const CTA_OPTIONS = [
  'Book a Free Session',
  'Register for Webinar',
  'Get Career Guidance',
];
const BACKGROUND_OPTIONS = [
  { value: 'blue', label: 'Blue gradient' },
  { value: 'navy', label: 'Navy' },
  { value: 'light', label: 'Light' },
];

const FORMATS = [
  { id: 'instagram-post', label: 'Instagram Post', width: 800, height: 800, ratio: '1:1' },
  { id: 'instagram-story', label: 'Instagram Story', width: 720, height: 1280, ratio: '9:16' },
  { id: 'whatsapp-status', label: 'WhatsApp Status', width: 720, height: 1280, ratio: '9:16' },
  { id: 'facebook-post', label: 'Facebook Post', width: 1200, height: 628, ratio: '1.91:1' },
];

const CAPTION_TEMPLATES = [
  { id: 'general', label: 'General', template: "I'm a GuideXpert Certified Counsellor. Join me for a free career clarity session. Book now 👇\n\n{{link}}" },
  { id: 'linkedin', label: 'LinkedIn', template: "As a GuideXpert Certified Counsellor, I help students with career clarity and guidance. Book a free session to explore your options.\n\n{{link}}" },
  { id: 'instagram', label: 'Instagram', template: "GuideXpert Certified Counsellor here ✨ Free career clarity session – link in bio / below 👇\n\n{{link}}" },
];

/** Seasonal and official poster flows (full customise & download on dedicated pages). */
const AUTOMATED_POSTERS = [
  {
    id: 'holi',
    title: 'Holi',
    description: 'Seasonal poster with your name and phone. Download PNG or PDF after eligibility check.',
    to: '/holiposter',
    previewSrc: '/holiposter.svg',
  },
  {
    id: 'inter',
    title: 'Inter',
    description: 'Counsellor poster template. Customise and download from the dedicated page.',
    to: '/interposter',
    previewSrc: '/interposter.svg',
  },
  {
    id: 'certified',
    title: 'Official certified poster',
    description: 'Your certified counsellor poster from the standard template.',
    to: '/counsellor/certificate',
    previewSrc: '/downloadcertificate.svg',
  },
];

const STATS_KEY = 'guidexpert_marketing_stats';

function getStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : { downloads: {}, linkClicks: 0, leads: 0 };
  } catch {
    return { downloads: {}, linkClicks: 0, leads: 0 };
  }
}

function setStats(updates) {
  const prev = getStats();
  const next = { ...prev, ...updates };
  localStorage.setItem(STATS_KEY, JSON.stringify(next));
  return next;
}

const initialPosterConfig = (id) => ({
  headline: HEADLINE_OPTIONS[0],
  ctaText: CTA_OPTIONS[0],
  backgroundVariant: 'blue',
  captionId: CAPTION_TEMPLATES[0].id,
});

const posterTemplateIds = ['main', 'webinar', 'session'];

const TEMPLATE_LABELS = {
  main: 'Main',
  webinar: 'Webinar',
  session: 'Session',
};

export default function Marketing() {
  const { displayName, slug } = useCounsellorProfile();
  const [posterConfigs, setPosterConfigs] = useState(() => {
    try {
      const raw = localStorage.getItem('guidexpert_poster_configs');
      if (raw) return { ...JSON.parse(raw) };
    } catch {}
    return {};
  });
  const [stats, setStatsState] = useState(getStats);
  const [downloadState, setDownloadState] = useState({ active: false, posterId: null, formatId: null });
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const downloadRef = useRef(null);

  const getConfig = (posterId) => ({
    ...initialPosterConfig(posterId),
    ...(posterConfigs[posterId] || {}),
  });

  const setConfig = (posterId, updates) => {
    setPosterConfigs((prev) => {
      const next = { ...prev, [posterId]: { ...(prev[posterId] || {}), ...updates } };
      try {
        localStorage.setItem('guidexpert_poster_configs', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const referralLink = `https://guidexpert.in/book/${slug}`;

  const getCaptionText = (captionId) => {
    const t = CAPTION_TEMPLATES.find((c) => c.id === (captionId || CAPTION_TEMPLATES[0].id)) || CAPTION_TEMPLATES[0];
    return t.template.replace(/\{\{name\}\}/g, displayName).replace(/\{\{link\}\}/g, referralLink);
  };

  const recordDownload = (posterId) => {
    const s = getStats();
    const downloads = { ...s.downloads, [posterId]: (s.downloads[posterId] || 0) + 1 };
    setStatsState(setStats({ downloads }));
  };

  const handleDownload = async (posterId, formatId) => {
    const format = FORMATS.find((f) => f.id === formatId) || FORMATS[0];
    setDownloadState({ active: true, posterId, formatId });
    await new Promise((r) => setTimeout(r, 100));
    if (!downloadRef.current) {
      setDownloadState({ active: false, posterId: null, formatId: null });
      return;
    }
    try {
      const canvas = await html2canvas(downloadRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `guidexpert-poster-${posterId}-${format.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      recordDownload(posterId);
    } catch (err) {
      console.error(err);
    }
    setDownloadState({ active: false, posterId: null, formatId: null });
  };

  const handleDownloadAll = async (posterId) => {
    setDownloadingAll(true);
    for (let i = 0; i < FORMATS.length; i++) {
      await handleDownload(posterId, FORMATS[i].id);
      if (i < FORMATS.length - 1) await new Promise((r) => setTimeout(r, 400));
    }
    setDownloadingAll(false);
  };

  const copyCaption = (e, posterId) => {
    e.preventDefault();
    const config = getConfig(posterId);
    const text = getCaptionText(config.captionId);
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    });
  };

  const copyLink = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      const s = getStats();
      setStatsState(setStats({ linkClicks: (s.linkClicks || 0) + 1 }));
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#003366] tracking-tight">All marketing posters</h2>
        <p className="text-sm text-slate-600 mt-0.5">
          Seasonal and official templates open in a dedicated page; customisable templates download here in multiple sizes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {AUTOMATED_POSTERS.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col"
          >
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 mb-3 w-fit">
              Seasonal / official
            </span>
            <div className="flex justify-center mb-4 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden min-h-[200px] max-h-[280px]">
              <img
                src={item.previewSrc}
                alt=""
                className="max-w-full max-h-[260px] w-auto object-contain object-center"
              />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">{item.title}</h3>
            <p className="text-sm text-slate-600 mb-4 flex-1">{item.description}</p>
            <Link
              to={item.to}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-[#003366] text-white text-sm font-medium rounded-lg hover:bg-[#004080] transition-colors text-center"
            >
              Open to customise &amp; download
            </Link>
          </div>
        ))}

        {posterTemplateIds.map((posterId, idx) => {
          const config = getConfig(posterId);
          const isRecommended = idx < 2;
          const totalDownloads = (stats.downloads && stats.downloads[posterId]) || 0;
          return (
            <div key={posterId} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-[#003366]/10 text-[#003366]">
                  Customisable template
                </span>
                {isRecommended && (
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800">
                    Recommended for you
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-800 mb-3">{TEMPLATE_LABELS[posterId] || posterId}</p>
              <div className="flex justify-center mb-4">
                <div className="scale-90 origin-center">
                  <MarketingPoster
                    displayName={displayName}
                    headline={config.headline}
                    ctaText={config.ctaText}
                    backgroundVariant={config.backgroundVariant}
                    width={320}
                    height={400}
                  />
                </div>
              </div>

              <div className="space-y-3 mb-4 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Headline</label>
                  <select
                    value={config.headline}
                    onChange={(e) => setConfig(posterId, { headline: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] outline-none"
                  >
                    {HEADLINE_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">CTA</label>
                  <select
                    value={config.ctaText}
                    onChange={(e) => setConfig(posterId, { ctaText: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] outline-none"
                  >
                    {CTA_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Background</label>
                  <select
                    value={config.backgroundVariant}
                    onChange={(e) => setConfig(posterId, { backgroundVariant: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] outline-none"
                  >
                    {BACKGROUND_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-2 items-center mb-2">
                  <button
                    type="button"
                    onClick={() => handleDownload(posterId, 'instagram-post')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#003366] text-white text-sm font-medium rounded-lg hover:bg-[#004080] transition-colors"
                  >
                    <FiDownload className="w-4 h-4" /> Download poster
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadAll(posterId)}
                    disabled={downloadingAll}
                    className="px-3 py-2 text-xs font-medium border border-slate-200 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    {downloadingAll ? 'Downloading…' : 'All sizes'}
                  </button>
                </div>
                <p className="text-xs font-medium text-slate-600 mb-1.5">More sizes</p>
                <div className="flex flex-wrap gap-2">
                  {FORMATS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleDownload(posterId, f.id)}
                      className="px-3 py-1.5 text-xs font-medium border border-slate-200 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      {f.ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-600 mb-1">Caption style</label>
                <select
                  value={config.captionId || CAPTION_TEMPLATES[0].id}
                  onChange={(e) => setConfig(posterId, { captionId: e.target.value })}
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] outline-none mb-2"
                >
                  {CAPTION_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={(e) => copyCaption(e, posterId)}
                  className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm bg-slate-50 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <FiCopy className="w-4 h-4 text-slate-500" />
                  {copiedCaption ? 'Copied!' : 'Copy caption'}
                </button>
              </div>

              <div className="mb-4">
                <p className="text-xs font-medium text-slate-600 mb-1">Your link</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={copyLink}
                    className="px-3 py-1.5 text-xs font-medium bg-[#003366] text-white rounded-lg hover:bg-[#004080] flex items-center gap-1 shrink-0"
                  >
                    <FiCopy className="w-3.5 h-3.5" /> {copiedLink ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                Downloads: <strong className="text-slate-700 font-medium">{totalDownloads}</strong>
                {' · '}Link clicks: <strong className="text-slate-700 font-medium">{stats.linkClicks || 0}</strong>
                {' · '}Leads: <strong className="text-slate-700 font-medium">{stats.leads || 0}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {downloadState.active && (
        <div style={{ position: 'fixed', left: -9999, top: 0, zIndex: -1 }}>
          <div
            ref={downloadRef}
            style={{
              width: FORMATS.find((f) => f.id === downloadState.formatId)?.width || 800,
              height: FORMATS.find((f) => f.id === downloadState.formatId)?.height || 800,
            }}
          >
            <MarketingPoster
              displayName={displayName}
              headline={getConfig(downloadState.posterId).headline}
              ctaText={getConfig(downloadState.posterId).ctaText}
              backgroundVariant={getConfig(downloadState.posterId).backgroundVariant}
              width={FORMATS.find((f) => f.id === downloadState.formatId)?.width || 800}
              height={FORMATS.find((f) => f.id === downloadState.formatId)?.height || 800}
            />
          </div>
        </div>
      )}
    </div>
  );
}
