import { PANEL_CLASS } from './copilotUtils';

export default function CopilotInboxWorkspace({ queue, chat, context, audit, notes }) {
  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-4">
      <div className="h-full min-h-0 overflow-hidden lg:col-span-3">{queue}</div>
      <div className="h-full min-h-0 overflow-hidden lg:col-span-5">{chat}</div>

      <aside
        className={`${PANEL_CLASS} flex h-full min-h-0 flex-col overflow-hidden lg:col-span-4`}
        aria-label="Lead details"
      >
        <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto overscroll-contain">
          {context}
          {audit}
          {notes}
        </div>
      </aside>
    </div>
  );
}
