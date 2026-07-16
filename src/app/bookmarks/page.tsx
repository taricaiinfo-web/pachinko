import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/Avatar";
import { RecordSparkline } from "@/components/RecordSparkline";
import { formatYen } from "@/lib/aggregate";
import type { RecordWithProfile } from "@/lib/types";

export const metadata = { title: "お気に入り | パチログ" };

export default async function BookmarksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bookmarks } = await supabase
    .from("record_bookmarks")
    .select("record_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const recordIds = (bookmarks ?? []).map((b) => b.record_id);

  let records: RecordWithProfile[] = [];
  if (recordIds.length > 0) {
    const { data } = await supabase
      .from("records_with_profile")
      .select("*")
      .in("id", recordIds);

    const byId = new Map((data ?? []).map((r) => [r.id, r as RecordWithProfile]));
    records = recordIds.map((id) => byId.get(id)).filter((r): r is RecordWithProfile => !!r);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-4">
      <h1 className="px-1 py-2 text-[17px] font-bold text-foreground">お気に入り</h1>

      <div className="flex flex-col">
        {records.map((r) => (
          <Link key={r.id} href={`/records/${r.id}`} className="flex items-start gap-2.5 border-b border-border py-3">
            <Avatar url={r.avatar_url} emoji={r.avatar_emoji} size={36} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[12px] font-bold text-foreground">{r.username}</span>
                <span className="flex-none text-[9px] text-muted-3">
                  {formatDistanceToNow(new Date(r.created_at), { locale: ja, addSuffix: true })}
                </span>
              </div>
              <p className="my-0.5 truncate text-[11px] text-foreground/90">
                {r.memo || `${r.location} ・ ${r.machine}`}
              </p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-muted">
                  収支{" "}
                  <b className={r.diff >= 0 ? "text-positive" : "text-negative"}>{formatYen(r.diff)}</b>
                </span>
                <span className="w-14 flex-none">
                  <RecordSparkline diff={r.diff} />
                </span>
              </div>
            </div>
          </Link>
        ))}
        {records.length === 0 && (
          <p className="py-16 text-center text-sm text-muted">まだブックマークした記録がありません。</p>
        )}
      </div>
    </div>
  );
}
