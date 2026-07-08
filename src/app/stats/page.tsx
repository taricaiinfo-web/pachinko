import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatsChart } from "@/components/StatsChart";
import type { Record as PlayRecord } from "@/lib/types";

export const metadata = { title: "グラフ | パチログ" };

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const { scope: scopeParam } = await searchParams;
  const scope = scopeParam === "all" ? "all" : "mine";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase.from("records").select("*").order("play_date", { ascending: true });
  if (scope === "mine") {
    query = query.eq("user_id", user.id);
  }
  const { data: records } = await query;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">収支グラフ</h1>
      </div>

      <div className="flex gap-2">
        <ScopeTab href="/stats?scope=mine" active={scope === "mine"} label="自分の収支" />
        <ScopeTab href="/stats?scope=all" active={scope === "all"} label="みんなの収支" />
      </div>

      {(records ?? []).length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            まだデータがありません。まずは実働データを登録しましょう。
          </p>
          <Link
            href="/records/new"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            + 新規登録
          </Link>
        </div>
      ) : (
        <StatsChart records={(records ?? []) as PlayRecord[]} />
      )}
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
