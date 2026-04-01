import ToolNavBar from './ToolNavBar';

function HelpList({ title, items }) {
  return (
    <div className="rounded-[14px] border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000]">
      <h3 className="mb-3 text-base font-black text-[#0F172A]">{title}</h3>
      <ul className="space-y-2 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item} className="rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ToolWorkspaceLayout({
  title,
  subtitle,
  howItWorks,
  preview,
  children,
  results,
  insights,
  whatThisToolDoes,
  inputGuide,
}) {
  return (
    <div className="min-h-screen bg-[#0F172A] px-4 py-8 sm:px-6 lg:px-8">
      <div
        className="fixed inset-0 -z-10 opacity-90"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="mx-auto max-w-7xl space-y-7">
        <ToolNavBar />

        <section className="rounded-[14px] border-2 border-black bg-[#0B1327] p-6 text-white shadow-[6px_6px_0px_#000] lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-md border border-slate-600 bg-[#1E293B] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                <span className="h-2 w-2 rounded-full bg-[#C7F36B]" />
                Student Tool Workspace
              </p>
              <h1 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">{title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">{subtitle}</p>
            </div>
            <div className="rounded-[14px] border-2 border-black bg-white p-4 text-[#0F172A] shadow-[4px_4px_0px_#C7F36B]">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Live Analytics Preview</p>
              <div className="mt-3">{preview}</div>
            </div>
          </div>
        </section>

        <section className="rounded-[14px] border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000]">
          <h2 className="text-2xl font-black text-[#0F172A]">How This Tool Works</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Simple explanation of how this recommendation is generated.</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
            {howItWorks?.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <HelpList title="What this tool does" items={whatThisToolDoes} />
            <HelpList title="What each input means" items={inputGuide} />
          </div>
        </section>

        <section className="rounded-[14px] border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000]">{children}</section>

        {results}

        {insights}
      </div>
    </div>
  );
}
