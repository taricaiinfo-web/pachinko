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

  const yTickFormatter = (v: number) => `${Math.round(v / 1000)}k`;

  return (
    <div className="flex flex-col gap-6">
      {/* 期間タブ */}
      <div className="flex gap-2">
        {(["week", "month", "year"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            aria-pressed={period === p}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              period === p
                ? "bg-indigo-600 text-white"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {PERIOD_LABEL[p]}別
          </button>
        ))}
      </div>

      {/* サマリー stat tile */}
      <div className="grid grid-cols-3 gap-3">
        <StatTile label="総投資額" value={`${totals.investment.toLocaleString()}円`} />
        <StatTile label="総回収額" value={`${totals.payout.toLocaleString()}円`} />
        <StatTile
          label="収支"
          value={formatYen(totals.diff)}
          tone={totals.diff > 0 ? "pos" : totals.diff < 0 ? "neg" : "flat"}
        />
      </div>

      {/* 収支の推移(diverging bar chart) */}
      <section
        className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4"
        aria-label={`${PERIOD_LABEL[period]}別収支グラフ`}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {PERIOD_LABEL[period]}別 収支
          </h2>
          {/* legend: 色は勝ち負けの符号を表す */}
          <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
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
      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {PERIOD_LABEL[period]}別 投資額・回収額
          </h2>
          <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
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

      {/* アクセシビリティ: テーブル表示 */}
      <div>
        <button
          onClick={() => setShowTable((v) => !v)}
          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {showTable ? "テーブル表示を隠す" : "テーブルで表示する"}
        </button>
        {showTable && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left text-zinc-500 dark:text-zinc-400">
                  <th className="py-2 pr-2 font-medium">期間</th>
                  <th className="py-2 pr-2 font-medium text-right">投資額</th>
                  <th className="py-2 pr-2 font-medium text-right">回収額</th>
                  <th className="py-2 pr-2 font-medium text-right">収支</th>
                  <th className="py-2 font-medium text-right">回数</th>
                </tr>
              </thead>
              <tbody>
                {points.map((p) => (
                  <tr key={p.key} className="border-b border-zinc-100 dark:border-zinc-900">
                    <td className="py-2 pr-2 text-zinc-700 dark:text-zinc-300">{p.label}</td>
                    <td className="py-2 pr-2 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                      {p.investment.toLocaleString()}円
                    </td>
                    <td className="py-2 pr-2 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                      {p.payout.toLocaleString()}円
                    </td>
                    <td
                      className={`py-2 pr-2 text-right tabular-nums font-semibold ${
                        p.diff > 0
                          ? "text-rose-600 dark:text-rose-400"
                          : p.diff < 0
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-zinc-500"
                      }`}
                    >
                      {formatYen(p.diff)}
                    </td>
                    <td className="py-2 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                      {p.count}
                    </td>
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
    <p className="flex h-[200px] items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
      表示できるデータがありません。
    </p>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "pos" | "neg" | "flat";
}) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <p
        className={`mt-1 text-base font-bold ${
          tone === "pos"
            ? "text-rose-600 dark:text-rose-400"
            : tone === "neg"
              ? "text-blue-600 dark:text-blue-400"
              : "text-zinc-900 dark:text-zinc-50"
        }`}
      >
        {value}
      </p>
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
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-zinc-500 dark:text-zinc-400">{p.label}</p>
      <p
        className={`mt-0.5 text-sm font-bold ${
          p.diff > 0
            ? "text-rose-600 dark:text-rose-400"
            : p.diff < 0
              ? "text-blue-600 dark:text-blue-400"
              : "text-zinc-500"
        }`}
      >
        {formatYen(p.diff)}
      </p>
      <p className="text-zinc-400">{p.count}回</p>
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
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-zinc-500 dark:text-zinc-400">{p.label}</p>
      <p className="mt-0.5 text-zinc-700 dark:text-zinc-200">
        投資額: <span className="font-semibold">{p.investment.toLocaleString()}円</span>
      </p>
      <p className="text-zinc-700 dark:text-zinc-200">
        回収額: <span className="font-semibold">{p.payout.toLocaleString()}円</span>
      </p>
    </div>
  );
}
