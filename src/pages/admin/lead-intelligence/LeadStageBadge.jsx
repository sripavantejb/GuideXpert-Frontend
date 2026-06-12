import { memo } from 'react';
import { getStageTone } from './leadIntelligenceUtils';

function LeadStageBadge({ stage }) {
  const label = String(stage || 'unknown');
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize tracking-wide ${getStageTone(stage)}`}
    >
      {label}
    </span>
  );
}

export default memo(LeadStageBadge);
