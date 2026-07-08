import {
  startOfWeek,
  startOfMonth,
  startOfYear,
  format,
} from "date-fns";
import { ja } from "date-fns/locale";
import type { Record as PlayRecord } from "@/lib/types";

export type Period = "week" | "month" | "year";

export type AggregatedPoint = {
  key: string; // ソート・グルーピング用キー
  label: string; // 表示用ラベル
  investment: number;
  payout: number;
  diff: number;
  count: number;
};

/**
 * レコード配列を週/月/年単位で集計し、時系列順に並べて返す。
 */
export function aggregateRecords(
  records: PlayRecord[],
  period: Period,
): AggregatedPoint[] {
  const map = new Map<string, AggregatedPoint>();

  for (const r of records) {
    const date = new Date(`${r.play_date}T00:00:00`);
    const { key, label } = getBucket(date, period);

    const existing = map.get(key);
    if (existing) {
      existing.investment += r.investment;
      existing.payout += r.payout;
      existing.diff += r.payout - r.investment;
      existing.count += 1;
    } else {
      map.set(key, {
        key,
        label,
        investment: r.investment,
        payout: r.payout,
        diff: r.payout - r.investment,
        count: 1,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
}

function getBucket(date: Date, period: Period): { key: string; label: string } {
  switch (period) {
    case "week": {
      const start = startOfWeek(date, { weekStartsOn: 1 }); // 月曜始まり
      return {
        key: format(start, "yyyy-MM-dd"),
        label: format(start, "M/d", { locale: ja }) + "週",
      };
    }
    case "month": {
      const start = startOfMonth(date);
      return {
        key: format(start, "yyyy-MM"),
        label: format(start, "yyyy年M月", { locale: ja }),
      };
    }
    case "year": {
      const start = startOfYear(date);
      return {
        key: format(start, "yyyy"),
        label: format(start, "yyyy年", { locale: ja }),
      };
    }
  }
}

export function sumRecords(records: PlayRecord[]) {
  return records.reduce(
    (acc, r) => {
      acc.investment += r.investment;
      acc.payout += r.payout;
      acc.diff += r.payout - r.investment;
      return acc;
    },
    { investment: 0, payout: 0, diff: 0 },
  );
}

export function formatYen(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("ja-JP")}円`;
}
