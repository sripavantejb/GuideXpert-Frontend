import { formatLeadProfileSummary } from './leadIntelligenceUtils';

export default function LeadProfileSummary({ row }) {
  const tags = formatLeadProfileSummary(row);

  if (!tags.length) {
    return <span className="text-slate-400">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200/80"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
