import { describeOpsFailure, opsFailureTooltip } from './whatsappOpsFailureCopy';

/** Operator-facing failure block (Recovery + Audit). */
export default function OpsFailureCell({ row, compact = false }) {
  const failure =
    row?.errorHeadline != null
      ? {
          headline: row.errorHeadline,
          detail: row.errorDetail,
          technicalCode: row.errorCode,
          technicalSourceLabel:
            row.errorSource === 'dlr'
              ? 'DLR'
              : row.errorSource === 'send'
                ? 'Send API'
                : row.errorSource === 'parsed'
                  ? 'Parsed'
                  : ''
        }
      : describeOpsFailure(row);
  const tooltip = opsFailureTooltip(row, failure);

  return (
    <div className={`min-w-0 ${compact ? 'space-y-0.5' : 'space-y-1'}`} title={tooltip}>
      <p className={`font-semibold leading-snug text-slate-900 ${compact ? 'text-xs' : 'text-sm'}`}>
        {failure.headline}
      </p>
      {failure.detail && failure.detail !== failure.headline ? (
        <p className={`line-clamp-3 leading-relaxed text-slate-600 ${compact ? 'text-[11px]' : 'text-xs'}`}>
          {failure.detail}
        </p>
      ) : null}
      {failure.technicalCode ? (
        <p className="text-[10px] font-medium text-slate-400">
          Code {failure.technicalCode}
          {failure.technicalSourceLabel ? ` · ${failure.technicalSourceLabel}` : ''}
        </p>
      ) : null}
    </div>
  );
}
