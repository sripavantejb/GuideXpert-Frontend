import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const DROP_FILL = '#cbd5e1';
const DROP_STROKE = '#94a3b8';

function pct(part, total) {
  if (!total) return 0;
  return (part / total) * 100;
}

function FunnelTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  const total = row.cohortTotal;
  const s = row.success;
  const d = row.drop;
  const sp = pct(s, total);
  const dp = pct(d, total);
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs shadow-lg sm:text-sm">
      <p className="font-semibold text-gray-900">{row.stageTitle}</p>
      <p className="mt-1 text-gray-500">
        Cohort: <span className="font-medium text-gray-800 tabular-nums">{Number(total).toLocaleString()}</span>
      </p>
      <p className="mt-1.5 text-gray-700">
        <span className="text-primary-navy font-medium">{row.successLabel}:</span>{' '}
        <span className="tabular-nums">{Number(s).toLocaleString()}</span>
        <span className="text-gray-500"> ({sp.toFixed(1)}%)</span>
      </p>
      <p className="mt-0.5 text-gray-700">
        <span className="font-medium text-slate-600">{row.dropLabel}:</span>{' '}
        <span className="tabular-nums">{Number(d).toLocaleString()}</span>
        <span className="text-gray-500"> ({dp.toFixed(1)}%)</span>
      </p>
    </div>
  );
}

function SuccessSegmentLabel({ x, y, width, height, value }) {
  if (value == null || value === 0 || width < 32) return null;
  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[10px] sm:text-[11px] font-semibold"
    >
      {Number(value).toLocaleString()}
    </text>
  );
}

function DropSegmentLabel({ x, y, width, height, value }) {
  if (value == null || value === 0 || width < 32) return null;
  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill="#334155"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[10px] sm:text-[11px] font-semibold"
    >
      {Number(value).toLocaleString()}
    </text>
  );
}

export default function FunnelChart({ data, maxDomain }) {
  const domainMax = typeof maxDomain === 'number' && maxDomain > 0 ? maxDomain : 1;
  const dynamicHeight = Math.max(320, Math.min(560, data.length * 56));

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white p-5 lg:p-6 portal-card"
      role="region"
      aria-labelledby="funnel-viz-heading"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <h2
            id="funnel-viz-heading"
            className="text-sm font-semibold uppercase tracking-wider text-gray-700"
          >
            Funnel Visualization
          </h2>
          <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
            Advanced vs dropped at each step (bar width = cohort size)
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 pt-0.5 text-xs sm:pt-1">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary-navy" aria-hidden />
            <span className="text-gray-600">Advanced</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-sm border border-slate-400 bg-slate-200"
              aria-hidden
            />
            <span className="text-gray-600">Dropped</span>
          </span>
        </div>
      </div>
      <div className="w-full" style={{ height: dynamicHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 34, left: 12, bottom: 10 }}
            barCategoryGap="18%"
            barSize={28}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, domainMax]}
              padding={{ right: 12 }}
              tick={{ fontSize: 11 }}
              stroke="#94a3b8"
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="stageTitle"
              width={184}
              tick={{ fontSize: 11, fill: '#334155' }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <Tooltip content={<FunnelTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.06)' }} />
            <Bar
              dataKey="success"
              stackId="funnel"
              radius={[10, 0, 0, 10]}
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
            >
              {data.map((entry) => (
                <Cell key={`s-${entry.stageTitle}`} fill={entry.successColor} />
              ))}
              <LabelList dataKey="success" content={SuccessSegmentLabel} />
            </Bar>
            <Bar
              name="drop"
              dataKey="drop"
              stackId="funnel"
              fill={DROP_FILL}
              stroke={DROP_STROKE}
              strokeWidth={1}
              radius={[0, 10, 10, 0]}
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
            >
              <LabelList dataKey="drop" content={DropSegmentLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
