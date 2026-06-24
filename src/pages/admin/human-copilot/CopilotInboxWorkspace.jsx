import { useState } from 'react';
import { MOBILE_INBOX_TABS, PANEL_CLASS } from './copilotUtils';

export { MOBILE_INBOX_TABS };

export default function CopilotInboxWorkspace({
  queue,
  chat,
  context,
  audit,
  notes,
  mobileTab = 'chat',
  onMobileTabChange,
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2 lg:gap-4">
      <div
        className="flex shrink-0 rounded-lg border border-slate-200 bg-slate-100 p-0.5 lg:hidden"
        role="tablist"
        aria-label="Inbox sections"
      >
        {MOBILE_INBOX_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={mobileTab === tab.id}
            onClick={() => onMobileTabChange?.(tab.id)}
            className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
              mobileTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid h-full min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-4">
        <div
          className={`h-full min-h-0 overflow-hidden lg:col-span-3 ${
            mobileTab === 'queue' ? 'block' : 'hidden lg:block'
          }`}
        >
          {queue}
        </div>
        <div
          className={`h-full min-h-0 overflow-hidden lg:col-span-5 ${
            mobileTab === 'chat' ? 'block' : 'hidden lg:block'
          }`}
        >
          {chat}
        </div>

        <aside
          className={`${PANEL_CLASS} flex h-full min-h-0 flex-col overflow-hidden lg:col-span-4 ${
            mobileTab === 'context' ? 'flex' : 'hidden lg:flex'
          }`}
          aria-label="Lead details"
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto overscroll-contain">
              {context}
              {audit}
            </div>
            <div className="shrink-0 border-t border-slate-100 bg-white">{notes}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
