"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { aggregateRecords, formatYen, sumRecords } from "@/lib/aggregate";
import type { Period } from "@/lib/constants";
import type { Record as PlayRecord } from "@/lib/types";

const PERIOD_LABEL: Record<Period, string> = {
  week: "週",
  month: "月",
  year: "年",
};

export function StatsChart({ records }: { records: PlayRecord[] }) {
  const [period, setPeriod] = useState<Period>("month");
  const [showTable, setShowTable] = useState(false);

  const points = useMemo(() => aggregateRecords(records, period), [records, period]);
  const totals = useMemo(() => sumRecords(records), [records]);
  const wins = records.filter((r) => r.payout - r.investment > 0).length;
  const winRate = records.length > 0 ? Math.round((wins / records.length) * 100) : 0;
  const avgDiff = records.length > 0 ? Math.round(totals.diff / records.length) : 0;

  const yTickFormatter = (v: number) => `${Math.round(v / 1000)}k`;

  return (
    <div className="flex flex-col gap-6">
      {/* 期間タブ */}
      <div className="flex rounded-[9px] bg-input p-[3px]">
        {(["week", "month", "year"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            aria-pressed={period === p}
            className={`flex-1 rounded-[7px] py-1.5 text-[11px] font-bold transition-colors ${
              period === p ? "bg-surface text-brand shadow-sm" : "text-muted"
            }`}
          >
            {PERIOD_LABEL[p]}
          </button>
        ))}
      </div>

      {/* 収支サマリー */}
      <div className="text-center">
        <p className="text-[11px] text-muted">収支</p>
        <p className={`text-2xl font-black ${totals.diff >= 0 ? "text-positive" : "text-negative"}`}>
          {formatYen(totals.diff)}
        </p>
      </div>

      {/* 収支の推移(diverging bar chart) */}
      <section aria-label={`${PERIOD_LABEL[period]}別収支グラフ`}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13px] font-bold text-foreground">{PERIOD_LABEL[period]}別 収支</h2>
          <div className="flex items-center gap-3 text-xs text-muted">
            <LegendSwatch className="bar-pos" label="プラス" />
            <LegendSwatch className="bar-neg" label="マイナス" />
          </div>
        </div>

        {points.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid
                  vertical={false}
                  stroke="var(--chart-grid)"
                  strokeDasharray="0"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
                  axisLine={{ stroke: "var(--chart-grid)" }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={yTickFormatter}
                  width={40}
                />
                <Tooltip content={<DiffTooltip />} cursor={{ fill: "var(--chart-grid)" }} />
                <Bar
                  dataKey="diff"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                  shape={(props: unknown) => {
                    const p = props as {
                      payload: { diff: number };
                    } & React.ComponentProps<typeof Rectangle>;
                    return <Rectangle {...p} className={p.payload.diff >= 0 ? "bar-pos" : "bar-neg"} />;
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* 投資額 vs 回収額 */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13px] font-bold text-foreground">
            {PERIOD_LABEL[period]}別 投資額・回収額
          </h2>
          <div className="flex items-center gap-3 text-xs text-muted">
            <LegendSwatch className="bar-series-1" label="投資額" />
            <LegendSwatch className="bar-series-2" label="回収額" />
          </div>
        </div>

        {points.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
                  axisLine={{ stroke: "var(--chart-grid)" }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={yTickFormatter}
                  width={40}
                />
                <Tooltip content={<AmountTooltip />} cursor={{ fill: "var(--chart-grid)" }} />
                <Bar dataKey="investment" className="bar-series-1" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="payout" className="bar-series-2" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* 詳細データ */}
      <section className="flex flex-col">
        <h2 className="mb-1 text-[13px] font-bold text-foreground">詳細データ</h2>
        <DetailRow label="投資額" value={`${totals.investment.toLocaleString()}円`} />
        <DetailRow label="回収額" value={`${totals.payout.toLocaleString()}円`} />
        <DetailRow label="勝率" value={`${winRate}%`} />
        <DetailRow label="回数" value={`${records.length}回`} />
        <DetailRow
          label="平均収支"
          value={formatYen(avgDiff)}
          tone={avgDiff > 0 ? "pos" : avgDiff < 0 ? "neg" : "flat"}
          last
        />
      </section>

      {/* アクセシビリティ: テーブル表示 */}
      <div>
        <button
          onClick={() => setShowTable((v) => !v)}
          className="text-sm font-medium text-brand hover:underline"
        >
          {showTable ? "テーブル表示を隠す" : "テーブルで表示する"}
        </button>
        {showTable && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th className="py-2 pr-2 font-medium">期間</th>
                  <th className="py-2 pr-2 font-medium text-right">投資額</th>
                  <th className="py-2 pr-2 font-medium text-right">回収額</th>
                  <th className="py-2 pr-2 font-medium text-right">収支</th>
                  <th className="py-2 font-medium text-right">回数</th>
                </tr>
              </thead>
              <tbody>
                {points.map((p) => (
                  <tr key={p.key} className="border-b border-border">
                    <td className="py-2 pr-2 text-foreground">{p.label}</td>
                    <td className="py-2 pr-2 text-right tabular-nums text-foreground">
                      {p.investment.toLocaleString()}円
                    </td>
                    <td className="py-2 pr-2 text-right tabular-nums text-foreground">
                      {p.payout.toLocaleString()}円
                    </td>
                    <td
                      className={`py-2 pr-2 text-right tabular-nums font-semibold ${
                        p.diff > 0 ? "text-positive" : p.diff < 0 ? "text-negative" : "text-muted-2"
                      }`}
                    >
                      {formatYen(p.diff)}
                    </td>
                    <td className="py-2 text-right tabular-nums text-foreground">{p.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function LegendSwatch({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${className}`} />
      {label}
    </span>
  );
}

function EmptyState() {
  return (
    <p className="flex h-[200px] items-center justify-center text-sm text-muted">
      表示できるデータがありません。
    </p>
  );
}

function DetailRow({
  label,
  value,
  tone,
  last,
}: {
  label: string;
  value: string;
  tone?: "pos" | "neg" | "flat";
  last?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-1.5 text-[11px] ${last ? "" : "border-b border-border"}`}>
      <span className="text-muted">{label}</span>
      <span
        className={`font-bold ${
          tone === "pos" ? "text-positive" : tone === "neg" ? "text-negative" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function DiffTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { label: string; diff: number; investment: number; payout: number; count: number } }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-muted">{p.label}</p>
      <p
        className={`mt-0.5 text-sm font-bold ${
          p.diff > 0 ? "text-positive" : p.diff < 0 ? "text-negative" : "text-muted-2"
        }`}
      >
        {formatYen(p.diff)}
      </p>
      <p className="text-muted-3">{p.count}回</p>
    </div>
  );
}

function AmountTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { label: string; investment: number; payout: number } }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-muted">{p.label}</p>
      <p className="mt-0.5 text-foreground">
        投資額: <span className="font-semibold">{p.investment.toLocaleString()}円</span>
      </p>
      <p className="text-foreground">
        回収額: <span className="font-semibold">{p.payout.toLocaleString()}円</span>
      </p>
    </div>
  );
}
