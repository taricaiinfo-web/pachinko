import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sumRecords, formatYen } from "@/lib/aggregate";
import type { Record as PlayRecord } from "@/lib/types";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const { data: records } = await supabase
    .from("records")
    .select("*")
    .eq("user_id", id)
    .order("play_date", { ascending: false });

  const totals = sumRecords((records ?? []) as PlayRecord[]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-3xl">
          {profile.avatar_emoji ?? "🎰"}
        </span>
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {profile.username}
          </h1>
          {profile.bio && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{profile.bio}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="記録数" value={`${records?.length ?? 0}件`} />
        <StatTile label="投資合計" value={`${totals.investment.toLocaleString()}円`} />
        <StatTile
          label="収支合計"
          value={formatYen(totals.diff)}
          positive={totals.diff > 0}
          negative={totals.diff < 0}
        />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          最近の記録
        </h2>
        <ul className="flex flex-col gap-2">
          {(records ?? []).slice(0, 10).map((r) => (
            <li key={r.id}>
              <Link
                href={`/records/${r.id}`}
                className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-2.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <span className="text-zinc-600 dark:text-zinc-400">
                  {r.play_date} ・ {r.location} ・ {r.machine}
                </span>
                <span
                  className={
                    r.payout - r.investment > 0
                      ? "font-semibold text-rose-600 dark:text-rose-400"
                      : r.payout - r.investment < 0
                        ? "font-semibold text-blue-600 dark:text-blue-400"
                        : "font-semibold text-zinc-500"
                  }
                >
                  {formatYen(r.payout - r.investment)}
                </span>
              </Link>
            </li>
          ))}
          {(records ?? []).length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">まだ記録がありません。</p>
          )}
        </ul>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  positive,
  negative,
}: {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <p
        className={`mt-1 text-base font-bold ${
          positive
            ? "text-rose-600 dark:text-rose-400"
            : negative
              ? "text-blue-600 dark:text-blue-400"
              : "text-zinc-900 dark:text-zinc-50"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
