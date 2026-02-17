import { useState, useRef, useEffect } from 'react';
import {
  FiTrendingUp, FiEye, FiMail, FiActivity, FiArrowUpRight, FiArrowDownRight,
  FiCopy, FiDownload, FiPlus, FiEdit2, FiTrash2, FiInfo,
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

const MARKETING_TIPS = [
  'Post between 7–9 PM for better reach.',
  'WhatsApp Status works best on weekends.',
  'Use a clear CTA in your first line.',
  'Share student success stories (with permission) to build trust.',
  'Consistency beats volume: post 2–3 times per week.',
];

const metrics = [
  { label: 'Profile Views', value: '2,847', change: '+12.5%', up: true, icon: FiEye },
  { label: 'Lead Generation', value: '164', change: '+8.3%', up: true, icon: FiTrendingUp },
  { label: 'Active Campaigns', value: '5', change: '+2', up: true, icon: FiActivity },
  { label: 'Student Inquiries', value: '47', change: '-3.1%', up: false, icon: FiMail },
];

const VIEWS_DATA_7D = [
  { label: 'Mon', views: 120 }, { label: 'Tue', views: 95 }, { label: 'Wed', views: 140 },
  { label: 'Thu', views: 110 }, { label: 'Fri', views: 165 }, { label: 'Sat', views: 130 }, { label: 'Sun', views: 98 },
];
const VIEWS_DATA_30D = [
  { label: 'W1', views: 320 }, { label: 'W2', views: 410 }, { label: 'W3', views: 380 },
  { label: 'W4', views: 520 },
];
const VIEWS_DATA_12W = [
  { week: 'W1', views: 320 }, { week: 'W2', views: 410 }, { week: 'W3', views: 380 }, { week: 'W4', views: 520 },
  { week: 'W5', views: 480 }, { week: 'W6', views: 610 }, { week: 'W7', views: 580 }, { week: 'W8', views: 540 },
  { week: 'W9', views: 620 }, { week: 'W10', views: 590 }, { week: 'W11', views: 650 }, { week: 'W12', views: 700 },
];
const CHART_RANGES = [
  { id: '7d', label: 'Last 7 days', data: VIEWS_DATA_7D, dataKey: 'views', xKey: 'label' },
  { id: '30d', label: 'Last 30 days', data: VIEWS_DATA_30D, dataKey: 'views', xKey: 'label' },
  { id: '12w', label: '12 weeks', data: VIEWS_DATA_12W, dataKey: 'views', xKey: 'week' },
];

const DEFAULT_CAMPAIGNS = [
  { id: '1', name: 'Engineering Admissions 2026', status: 'Active', leads: 42, impressions: '12.4K' },
  { id: '2', name: 'Medical Career Webinar', status: 'Active', leads: 28, impressions: '8.2K' },
  { id: '3', name: 'Free Assessment Offer', status: 'Active', leads: 35, impressions: '15.1K' },
  { id: '4', name: 'Parent Guidance Workshop', status: 'Paused', leads: 18, impressions: '5.6K' },
  { id: '5', name: 'Board Exam Counseling', status: 'Completed', leads: 56, impressions: '22.3K' },
];
const CAMPAIGNS_KEY = 'guidexpert_marketing_campaigns';

function getCampaigns() {
  try {
    const raw = localStorage.getItem(CAMPAIGNS_KEY);
    if (!raw) return DEFAULT_CAMPAIGNS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CAMPAIGNS;
  }
}

function setCampaigns(list) {
  localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(list));
}

const STATS_KEY = 'guidexpert_marketing_stats';
const DOWNLOADS_WEEK_KEY = 'guidexpert_marketing_downloads_week';

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

function getWeekKey() {
  const d = new Date();
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return start.toISOString().slice(0, 10);
}

function getDownloadsThisWeek() {
  try {
    const raw = localStorage.getItem(DOWNLOADS_WEEK_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    const week = getWeekKey();
    return data.week === week ? (data.count || 0) : 0;
  } catch {
    return 0;
  }
}

function incrementDownloadsThisWeek() {
  const week = getWeekKey();
  try {
    const raw = localStorage.getItem(DOWNLOADS_WEEK_KEY);
    const data = raw ? JSON.parse(raw) : { week: null, count: 0 };
    const count = data.week === week ? (data.count || 0) + 1 : 1;
    localStorage.setItem(DOWNLOADS_WEEK_KEY, JSON.stringify({ week, count }));
    return count;
  } catch {
    localStorage.setItem(DOWNLOADS_WEEK_KEY, JSON.stringify({ week, count: 1 }));
    return 1;
  }
}

const initialPosterConfig = (id) => ({
  headline: HEADLINE_OPTIONS[0],
  ctaText: CTA_OPTIONS[0],
  backgroundVariant: 'blue',
  captionId: CAPTION_TEMPLATES[0].id,
});

const posterTemplateIds = ['main', 'webinar', 'session'];

export default function Marketing() {
  const { displayName, slug } = useCounsellorProfile();
  const [posterConfigs, setPosterConfigs] = useState(() => {
    try {
      const raw = localStorage.getItem('guidexpert_poster_configs');
      if (raw) return { ...JSON.parse(raw) };
    } catch {}
    return {};
  });
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * MARKETING_TIPS.length));
  const [stats, setStatsState] = useState(getStats);
  const [downloadState, setDownloadState] = useState({ active: false, posterId: null, formatId: null });
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [campaigns, setCampaignsState] = useState(getCampaigns);
  const [chartRange, setChartRange] = useState('12w');
  const [campaignModal, setCampaignModal] = useState({ open: false, mode: 'create', campaign: null });
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
    incrementDownloadsThisWeek();
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

  const saveCampaign = (campaign) => {
    if (campaignModal.mode === 'edit' && campaignModal.campaign?.id) {
      setCampaignsState((prev) => {
        const next = prev.map((c) => (c.id === campaignModal.campaign.id ? { ...campaign, id: c.id } : c));
        setCampaigns(next);
        return next;
      });
    } else {
      setCampaignsState((prev) => {
        const next = [...prev, { ...campaign, id: String(Date.now()) }];
        setCampaigns(next);
        return next;
      });
    }
    setCampaignModal({ open: false, mode: 'create', campaign: null });
  };

  const deleteCampaign = (id) => {
    setCampaignsState((prev) => {
      const next = prev.filter((c) => c.id !== id);
      setCampaigns(next);
      return next;
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

  const downloadsThisWeek = getDownloadsThisWeek();
  const chartConfig = CHART_RANGES.find((r) => r.id === chartRange) || CHART_RANGES[2];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-[#003366] tracking-tight">Marketing Support</h2>
          <p className="text-sm text-slate-600 mt-0.5">Track visibility, leads, and campaigns</p>
        </div>
      </div>

      {/* Activity indicator */}
      <div className="mb-4 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 flex items-center gap-2">
        <FiInfo className="w-4 h-4 text-slate-500 shrink-0" />
        {downloadsThisWeek > 0 ? (
          <>You downloaded <strong className="text-slate-900">{downloadsThisWeek}</strong> poster{downloadsThisWeek !== 1 ? 's' : ''} this week. Post at least 1 poster weekly to get more leads.</>
        ) : (
          <>Post at least 1 poster weekly to get more leads. Download a poster below to get started.</>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#003366]/5 flex items-center justify-center">
                <m.icon className="w-4 h-4 text-[#003366]" />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${m.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {m.up ? <FiArrowUpRight className="w-3.5 h-3.5" /> : <FiArrowDownRight className="w-3.5 h-3.5" />}
                {m.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{m.value}</p>
            <p className="text-sm text-slate-600 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly tip */}
      <div className="mb-6 bg-white border border-slate-200 border-l-4 border-l-[#003366] rounded-r-xl shadow-sm p-4">
        <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Weekly tip</h4>
        <p className="text-sm text-slate-700">{MARKETING_TIPS[tipIndex]}</p>
        <button
          type="button"
          onClick={() => setTipIndex((i) => (i + 1) % MARKETING_TIPS.length)}
          className="mt-2 text-xs font-medium text-slate-600 hover:text-[#003366] transition-colors"
        >
          Next tip
        </button>
      </div>

      {/* Your marketing posters */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-900 tracking-tight mb-1">Your marketing posters</h3>
        <p className="text-sm text-slate-600 mb-6">Customise, download in your preferred size, and share.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posterTemplateIds.map((posterId, idx) => {
            const config = getConfig(posterId);
            const isRecommended = idx < 2;
            const totalDownloads = (stats.downloads && stats.downloads[posterId]) || 0;
            return (
              <div key={posterId} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                {isRecommended && (
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-[#003366]/10 text-[#003366] mb-3">
                    Recommended for you
                  </span>
                )}
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

                {/* Customisation */}
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

                {/* Download – primary */}
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

                {/* Caption template + Copy caption */}
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

                {/* Your link */}
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

                {/* Performance */}
                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                  Downloads: <strong className="text-slate-700 font-medium">{totalDownloads}</strong>
                  {' · '}Link clicks: <strong className="text-slate-700 font-medium">{stats.linkClicks || 0}</strong>
                  {' · '}Leads: <strong className="text-slate-700 font-medium">{stats.leads || 0}</strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hidden poster for download capture */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Views Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h4 className="text-sm font-semibold text-slate-800">Profile Views Trend</h4>
            <div className="flex gap-1">
              {CHART_RANGES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setChartRange(r.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    chartRange === r.id
                      ? 'bg-[#003366] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartConfig.data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey={chartConfig.xKey} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey={chartConfig.dataKey} stroke="#003366" strokeWidth={2} dot={{ r: 4, fill: '#003366' }} name="Views" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-800">Campaigns</h4>
            <button
              type="button"
              onClick={() => setCampaignModal({ open: true, mode: 'create', campaign: null })}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#003366] text-white text-xs font-medium rounded-lg hover:bg-[#004080] transition-colors"
            >
              <FiPlus className="w-4 h-4" /> Create campaign
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Campaign</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Leads</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Impressions</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wider w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-900">{c.name}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.status === 'Active' ? 'bg-emerald-50 text-emerald-700'
                        : c.status === 'Paused' ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                      }`}>{c.status}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{c.leads}</td>
                    <td className="px-5 py-3 text-slate-500">{c.impressions}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setCampaignModal({ open: true, mode: 'edit', campaign: c })}
                          className="p-1.5 text-slate-500 hover:text-[#003366] hover:bg-slate-100 rounded"
                          aria-label="Edit campaign"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCampaign(c.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                          aria-label="Delete campaign"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Campaign modal */}
      {campaignModal.open && (
        <CampaignModal
          key={campaignModal.campaign?.id ?? 'new'}
          mode={campaignModal.mode}
          campaign={campaignModal.campaign}
          onSave={saveCampaign}
          onClose={() => setCampaignModal({ open: false, mode: 'create', campaign: null })}
        />
      )}
    </div>
  );
}

function CampaignModal({ mode, campaign, onSave, onClose }) {
  const [name, setName] = useState(campaign?.name ?? '');
  const [status, setStatus] = useState(campaign?.status ?? 'Active');
  const [leads, setLeads] = useState(campaign?.leads ?? 0);
  const [impressions, setImpressions] = useState(campaign?.impressions ?? '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name: name.trim(), status, leads, impressions: impressions.trim() || '0' });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} aria-hidden />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{mode === 'edit' ? 'Edit campaign' : 'Create campaign'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] outline-none"
              placeholder="e.g. Engineering Admissions 2026"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] outline-none"
            >
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Leads</label>
              <input
                type="number"
                min={0}
                value={leads}
                onChange={(e) => setLeads(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Impressions</label>
              <input
                type="text"
                value={impressions}
                onChange={(e) => setImpressions(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] outline-none"
                placeholder="e.g. 12.4K"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#003366] rounded-lg hover:bg-[#004080]">
              {mode === 'edit' ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
