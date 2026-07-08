import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatYen } from "@/lib/aggregate";

export const metadata = { title: "データ一覧 | パチログ" };

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const { scope: scopeParam } = await searchParams;
  const scope = scopeParam === "mine" ? "mine" : "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("records_with_profile")
    .select("*")
    .order("play_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);

  if (scope === "mine" && user) {
    query = query.eq("user_id", user.id);
  }

  const { data: records, error } = await query;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">データ一覧</h1>
        <Link
          href="/records/new"
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          + 新規登録
        </Link>
      </div>

      <div className="flex gap-2">
        <ScopeTab href="/records?scope=all" active={scope === "all"} label="みんなの記録" />
        <ScopeTab href="/records?scope=mine" active={scope === "mine"} label="自分の記録" />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          データの取得に失敗しました。
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {(records ?? []).map((r) => (
          <li key={r.id}>
            <Link
              href={`/records/${r.id}`}
              className="flex flex-col gap-1 rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <span>{r.avatar_emoji ?? "🎰"}</span>
                  <span>{r.username}</span>
                </span>
                <span
                  className={
                    r.diff > 0
                      ? "text-base font-bold text-rose-600 dark:text-rose-400"
                      : r.diff < 0
                        ? "text-base font-bold text-blue-600 dark:text-blue-400"
                        : "text-base font-bold text-zinc-500"
                  }
                >
                  {formatYen(r.diff)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <span>
                  {r.play_date} ・ {r.location}
                </span>
                <span className="truncate max-w-[45%]">{r.machine}</span>
              </div>
            </Link>
          </li>
        ))}
        {(records ?? []).length === 0 && !error && (
          <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {scope === "mine"
              ? "まだ記録がありません。「+ 新規登録」から記録してみましょう。"
              : "まだ記録がありません。"}
          </p>
        )}
      </ul>
    </div>
  );
}

function ScopeTab({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-indigo-600 text-white"
          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
      }`}
    >
      {label}
    </Link>
  );
}
