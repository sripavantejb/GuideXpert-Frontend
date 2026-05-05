import { createElement, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  FiBarChart2,
  FiCalendar,
  FiDownload,
  FiAlertOctagon,
  FiRadio,
  FiMessageSquare,
  FiRefreshCw,
  FiSettings,
  FiKey,
} from 'react-icons/fi';
import { getWhatsappOpsMeta } from '../../../utils/whatsappOpsAdminApi';
import WhatsappOpsApiHostBanner from './WhatsappOpsApiHostBanner';
import { WhatsappOpsHostProvider, useWhatsappOpsHost } from './whatsappOpsHostContext';

const primaryTabs = [
  { to: 'overview', label: 'Overview', icon: FiBarChart2 },
  { to: 'cron', label: 'Cron jobs', icon: FiCalendar },
  { to: 'messages', label: 'Messages', icon: FiMessageSquare },
  { to: 'retries', label: 'Retries', icon: FiRefreshCw },
  { to: 'webhooks', label: 'Webhooks', icon: FiRadio },
  { to: 'failures', label: 'Failures', icon: FiAlertOctagon },
  { to: 'logs', label: 'Logs / export', icon: FiDownload },
  { to: 'settings', label: 'Settings', icon: FiSettings },
];

function tabClass({ isActive }) {
  const base =
    'inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/30 focus-visible:ring-offset-2';
  if (isActive) {
    return `${base} bg-white text-primary-navy shadow-sm ring-1 ring-slate-200/90`;
  }
  return `${base} text-slate-600 hover:bg-white/70 hover:text-slate-900`;
}

function WhatsAppOpsLayoutChrome() {
  const location = useLocation();
  const [envHints, setEnvHints] = useState(null);
  const { notifyWhatsappOpsApi404, clearWhatsappOpsApi404, showMissingApisBanner } = useWhatsappOpsHost();

  useEffect(() => {
    let cancelled = false;
    getWhatsappOpsMeta().then((res) => {
      if (cancelled) return;
      if (res.success) {
        clearWhatsappOpsApi404();
        const raw = res.data?.data ?? res.data;
        const hints = raw?.envHints;
        setEnvHints(Array.isArray(hints) ? hints : null);
        return;
      }
      setEnvHints(null);
      if (res.status === 404) {
        notifyWhatsappOpsApi404();
      }
    });
    return () => {
      cancelled = true;
    };
  }, [notifyWhatsappOpsApi404, clearWhatsappOpsApi404]);

  return (
    <div className="min-h-[calc(100vh-6rem)] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_32px_-8px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/[0.04]">
      <div
        className="h-1 w-full bg-gradient-to-r from-primary-navy via-violet-600 to-sky-500"
        aria-hidden
      />

      <div className="relative border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/40 px-5 pb-0 pt-7 sm:px-10 sm:pt-9">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-slate-200/90 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                Operations console
              </span>
              <span
                className={`inline-flex h-1.5 w-1.5 rounded-full shadow-[0_0_0_3px_rgba(16,185,129,0.25)] ${
                  showMissingApisBanner ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                title={showMissingApisBanner ? 'API host issue' : 'Live section'}
                aria-hidden
              />
            </div>
            <h1 className="mt-4 text-[1.65rem] font-bold tracking-tight text-slate-900 sm:text-4xl sm:leading-[1.1]">
              WhatsApp messaging
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]">
              {
                'Monitor delivery telemetry, cron health, inbound webhooks, and exports — built for reliability and quick incident response.'
              }
            </p>
          </div>
        </div>

        <nav
          className="mt-8 flex flex-wrap gap-1 overflow-x-auto scrollbar-hide rounded-xl border border-slate-200/70 bg-slate-100/80 p-2 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]"
          aria-label="WhatsApp operations sections"
        >
          {primaryTabs.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} className={tabClass}>
              {createElement(icon, {
                className: 'h-4 w-4 shrink-0 opacity-90 sm:h-[17px] sm:w-[17px]',
                'aria-hidden': true,
              })}
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {showMissingApisBanner && (
        <div className="mx-5 mt-5 sm:mx-10">
          <WhatsappOpsApiHostBanner />
        </div>
      )}

      {envHints && envHints.length > 0 && !showMissingApisBanner && (
        <div className="mx-5 mt-5 sm:mx-10">
          <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/[0.03]">
            <div className="flex flex-col gap-4 border-l-[3px] border-primary-navy p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-navy/12 to-violet-500/10 text-primary-navy shadow-sm ring-1 ring-primary-navy/10">
                <FiKey className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Configuration reference</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Related environment keys (names only). Values are never shown in the browser.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {envHints.map((key) => (
                    <code
                      key={key}
                      className="rounded-lg border border-slate-200/90 bg-slate-50 px-2.5 py-1.5 text-[0.6875rem] font-mono font-medium text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-colors hover:border-slate-300 hover:bg-white"
                      title={key}
                    >
                      {key}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative min-h-[min(60vh,720px)] bg-gradient-to-b from-slate-50/90 via-slate-50 to-slate-100/60 px-5 py-7 sm:px-10 sm:py-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.22) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
          aria-hidden
        />
        <div className="relative">
          <div key={location.pathname} className="whatsapp-ops-outlet-fade">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WhatsAppOpsLayout() {
  return (
    <WhatsappOpsHostProvider>
      <WhatsAppOpsLayoutChrome />
    </WhatsappOpsHostProvider>
  );
}
