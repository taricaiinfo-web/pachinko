import Link from "next/link";
import { redirect } from "next/navigation";
import { startOfWeek, startOfMonth, startOfYear, format } from "date-fns";
import { ja } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { sumRecords, formatYen } from "@/lib/aggregate";
import type { Record as PlayRecord } from "@/lib/types";

export const metadata = { title: "データ一覧 | パチログ" };

const RANGES = [
  { value: "all", label: "すべて" },
  { value: "week", label: "週" },
  { value: "month", label: "月" },
  { value: "year", label: "年" },
] as const;

type RangeValue = (typeof RANGES)[number]["value"];

export default async function MyRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rangeParam } = await searchParams;
  const range: RangeValue = RANGES.some((r) => r.value === rangeParam)
    ? (rangeParam as RangeValue)
    : "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("records")
    .select("*")
    .eq("user_id", user.id)
    .order("play_date", { ascending: false });

  if (range !== "all") {
    const now = new Date();
    const start =
      range === "week"
        ? startOfWeek(now, { weekStartsOn: 1 })
        : range === "month"
          ? startOfMonth(now)
          : startOfYear(now);
    query = query.gte("play_date", format(start, "yyyy-MM-dd"));
  }

  const { data: records } = await query;
  const totals = sumRecords((records ?? []) as PlayRecord[]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-3 px-4 py-4">
      <div className="flex items-center">
        <Link href="/profile" className="flex h-8 w-8 items-center justify-center" aria-label="戻る">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </Link>
        <h1 className="flex-1 -ml-8 text-center text-[16px] font-bold text-foreground">データ一覧</h1>
      </div>

      <div className="flex gap-1.5">
        {RANGES.map((r) => (
          <Link
            key={r.value}
            href={`/records/mine?range=${r.value}`}
            className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold ${
              range === r.value ? "bg-brand text-white" : "bg-input text-muted"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-[10px] bg-input px-3.5 py-2.5">
        <span className="text-[12px] font-bold text-foreground">合計収支</span>
        <span className={`text-[17px] font-black ${totals.diff >= 0 ? "text-positive" : "text-negative"}`}>
          {formatYen(totals.diff)}
        </span>
      </div>

      <div className="flex flex-col">
        {(records ?? []).map((r) => {
          const diff = r.payout - r.investment;
          return (
            <Link
              key={r.id}
              href={`/records/${r.id}`}
              className="border-b border-border py-2.5"
            >
              <p className="text-[10px] text-muted">
                {r.play_date} {format(new Date(`${r.play_date}T00:00:00`), "(E)", { locale: ja })}
              </p>
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[12px] font-bold text-foreground">{r.machine}</span>
                <span
                  className={`flex-none text-[13px] font-bold ${
                    diff > 0 ? "text-positive" : diff < 0 ? "text-negative" : "text-muted-2"
                  }`}
                >
                  {formatYen(diff)}
                </span>
              </div>
              <p className="mt-px text-[9px] text-muted-2">{r.location}</p>
              <p className="text-[9px] text-muted-3">
                投資 {r.investment.toLocaleString()}円　回収 {r.payout.toLocaleString()}円
              </p>
            </Link>
          );
        })}
        {(records ?? []).length === 0 && (
          <p className="py-16 text-center text-sm text-muted">まだ記録がありません。</p>
        )}
      </div>
    </div>
  );
}
