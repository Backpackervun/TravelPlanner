"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  CATEGORY_OPTIONS,
  CATEGORY_STYLES,
  formatIDR,
  formatLocal,
  transportColor,
} from "@/lib/utils";
import SectionHeading from "./SectionHeading";

// ============================================
// Aggregations
// ============================================

/**
 * Count transport modes across all rows. We count any non-empty
 * transport string (not constrained to a fixed list) so the chart
 * adapts as the user works in different regions.
 */
function aggregateTransport(rows) {
  const counts = new Map();
  for (const r of rows) {
    if (!r.transport) continue;
    counts.set(r.transport, (counts.get(r.transport) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, value]) => ({ name, value, fill: transportColor(name) }))
    .sort((a, b) => b.value - a.value);
}

function aggregateCategoryBudget(rows, rate) {
  const totals = Object.fromEntries(CATEGORY_OPTIONS.map((c) => [c, 0]));
  for (const r of rows) {
    if (r.category && totals[r.category] !== undefined) {
      totals[r.category] += Number(r.budgetLocal) || 0;
    }
  }
  return CATEGORY_OPTIONS.map((name) => ({
    name,
    local: totals[name],
    idr: totals[name] * (Number(rate) || 0),
    fill: CATEGORY_STYLES[name].bar,
  }));
}

// ============================================
// Component
// ============================================

export default function ChartsPanel({ rows, rate, totalLocal, totalIDR }) {
  const transportData = aggregateTransport(rows);
  const categoryData = aggregateCategoryBudget(rows, rate);
  const transportLegs = transportData.reduce((s, d) => s + d.value, 0);

  return (
    <aside className="charts-panel no-print space-y-4 lg:sticky lg:top-[120px]">
      <div className="no-print">
        <SectionHeading eyebrow="03 — Travel Overview" title="Budget at a glance" />
      </div>

      {/* Total budget card */}
      <div className="relative overflow-hidden rounded-2xl border border-navy-100/60 bg-gradient-to-br from-navy-50 to-white p-5 shadow-soft">
        <div
          aria-hidden="true"
          className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-navy-500/10"
        />
        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-navy-500">
            Total budget
          </p>
          <p className="mt-2 text-4xl font-semibold leading-none tracking-tight text-ink">
            {formatIDR(totalIDR)}
          </p>
          <p className="mt-1 font-mono text-xs tabular-nums text-ink-muted">
            ≈ {formatLocal(totalLocal)} (local) · rate 1 = {rate} IDR
          </p>
        </div>
      </div>

      {/* Pie: transport usage */}
      <ChartCard
        title="Transport usage"
        subtitle={`${transportLegs} ${transportLegs === 1 ? "leg" : "legs"} across your trip`}
      >
        {transportData.length === 0 ? (
          <Empty message="Pick a transport for any row to see this chart." />
        ) : (
          <div className="grid grid-cols-[1fr_auto] items-center gap-4">
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={transportData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={70}
                    paddingAngle={2}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  >
                    {transportData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => [`${value} legs`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-1.5 text-xs">
              {transportData.map((d) => (
                <li key={d.name} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: d.fill }}
                  />
                  <span className="text-ink-soft">{d.name}</span>
                  <span className="ml-auto font-mono tabular-nums text-ink-muted">
                    {d.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </ChartCard>

      {/* Bar: category budget */}
      <ChartCard
        title="Budget per category"
        subtitle="In your local trip currency"
      >
        {totalLocal === 0 ? (
          <Empty message="Add budget amounts to see this chart." />
        ) : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
              >
                <CartesianGrid stroke="#EEF2F7" vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
                  }
                />
                <Tooltip
                  cursor={{ fill: "rgba(11, 60, 93, 0.06)" }}
                  contentStyle={tooltipStyle}
                  formatter={(_v, _n, entry) => {
                    const p = entry?.payload;
                    if (!p) return ["", ""];
                    return [
                      `${formatLocal(p.local)} · ${formatIDR(p.idr)}`,
                      p.name,
                    ];
                  }}
                />
                <Bar dataKey="local" radius={[6, 6, 0, 0]} maxBarSize={42}>
                  {categoryData.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      {/* Tiny tip */}
      <p className="px-1 text-[11px] leading-relaxed text-ink-muted">
        💡 Tip: your data is saved in this browser only. Use the same browser to
        come back to your trip.
      </p>
    </aside>
  );
}

// ============================================
// Helpers
// ============================================

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-paper-line bg-white p-4 shadow-soft">
      <div className="mb-3">
        <h3 className="text-lg font-semibold leading-none text-ink">{title}</h3>
        {subtitle && <p className="mt-1 text-[11px] text-ink-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Empty({ message }) {
  return (
    <div className="grid h-[140px] place-items-center rounded-lg border border-dashed border-paper-line text-center text-xs text-ink-muted">
      {message}
    </div>
  );
}

const tooltipStyle = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 12,
  color: "#111827",
  boxShadow: "0 4px 12px rgba(11, 60, 93, 0.08)",
};
