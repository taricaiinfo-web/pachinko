import { createClient } from "@/lib/supabase/server";
import { RecordCard } from "@/components/RecordCard";
import type { RecordWithProfile } from "@/lib/types";

export const metadata = { title: "ホーム | パチログ" };

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const { scope: scopeParam } = await searchParams;
  const scope = scopeParam === "following" ? "following" : "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let records: RecordWithProfile[] = [];
  let error = false;
  let hasNoFollows = false;

  if (scope === "following" && user) {
    const { data: follows } = await supabase
      .from("follows")
      .select("followee_id")
      .eq("follower_id", user.id);

    const followeeIds = (follows ?? []).map((f) => f.followee_id);

    if (followeeIds.length === 0) {
      hasNoFollows = true;
    } else {
      const { data, error: queryError } = await supabase
        .from("records_with_profile")
        .select("*")
        .in("user_id", followeeIds)
        .order("created_at", { ascending: false })
        .limit(100);
      records = (data ?? []) as RecordWithProfile[];
      error = !!queryError;
    }
  } else {
    const { data, error: queryError } = await supabase
      .from("records_with_profile")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    records = (data ?? []) as RecordWithProfile[];
    error = !!queryError;
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-2">
      <h1 className="px-1 py-2 text-[17px] font-bold text-foreground">ホーム</h1>

      <div className="flex border-b border-border">
        <ScopeTab href="/records?scope=all" active={scope === "all"} label="おすすめ" />
        <ScopeTab href="/records?scope=following" active={scope === "following"} label="フォロー中" />
      </div>

      {error && <p className="py-4 text-sm text-negative">データの取得に失敗しました。</p>}

      {hasNoFollows ? (
        <p className="py-16 text-center text-sm text-muted">
          まだ誰もフォローしていません。気になるユーザーをフォローすると、ここに記録が表示されます。
        </p>
      ) : (
        <div className="flex flex-col">
          {records.map((r) => (
            <RecordCard key={r.id} record={r} />
          ))}
          {records.length === 0 && !error && (
            <p className="py-16 text-center text-sm text-muted">まだ記録がありません。</p>
          )}
        </div>
      )}
    </div>
  );
}

function ScopeTab({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <a
      href={href}
      className={`flex-1 border-b-2 py-2 text-center text-xs font-bold transition-colors ${
        active ? "border-brand text-brand" : "border-transparent text-muted-2"
      }`}
    >
      {label}
    </a>
  );
}
