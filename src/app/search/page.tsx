import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/Avatar";
import { RecordCard } from "@/components/RecordCard";
import { RecordSparkline } from "@/components/RecordSparkline";
import { formatYen } from "@/lib/aggregate";
import { toggleFollow } from "@/app/follows/actions";
import type { Profile, RecordWithProfile } from "@/lib/types";

export const metadata = { title: "検索 | パチログ" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: qParam } = await searchParams;
  const q = (qParam ?? "").trim().slice(0, 50);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profiles: Profile[] = [];
  let records: RecordWithProfile[] = [];

  let suggestedUsers: Profile[] = [];
  let followingIds = new Set<string>();
  let popularRecords: RecordWithProfile[] = [];

  if (q) {
    const { data: profileResults } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", `%${q}%`)
      .limit(20);
    profiles = profileResults ?? [];

    const [{ data: byLocation }, { data: byMachine }] = await Promise.all([
      supabase
        .from("records_with_profile")
        .select("*")
        .ilike("location", `%${q}%`)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("records_with_profile")
        .select("*")
        .ilike("machine", `%${q}%`)
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

    const merged = new Map<string, RecordWithProfile>();
    for (const r of [...(byLocation ?? []), ...(byMachine ?? [])] as RecordWithProfile[]) {
      merged.set(r.id, r);
    }
    records = Array.from(merged.values())
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 30);
  } else {
    const { data: profileResults } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8);
    suggestedUsers = (profileResults ?? []).filter((p) => p.id !== user?.id).slice(0, 4);

    if (user) {
      const { data: follows } = await supabase
        .from("follows")
        .select("followee_id")
        .eq("follower_id", user.id);
      followingIds = new Set((follows ?? []).map((f) => f.followee_id));
    }

    const { data: popular } = await supabase
      .from("records_with_profile")
      .select("*")
      .order("like_count", { ascending: false })
      .limit(3);
    popularRecords = (popular ?? []) as RecordWithProfile[];
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-4">
      <h1 className="px-1 text-[17px] font-bold text-foreground">検索</h1>

      <form action="/search" method="get" className="flex items-center gap-2 rounded-lg bg-input px-3 py-2.5">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted-3)" strokeWidth="2">
          <circle cx="10.5" cy="10.5" r="6" />
          <path d="M15 15l4.5 4.5" />
        </svg>
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="ユーザー・店舗・機種を検索"
          className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-3"
        />
      </form>

      {!q && (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="text-[13px] font-bold text-foreground">おすすめユーザー</h2>
            {suggestedUsers.length === 0 ? (
              <p className="text-sm text-muted">おすすめのユーザーはまだいません。</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {suggestedUsers.map((p) => (
                  <li key={p.id} className="flex items-center gap-2">
                    <Link href={`/profile/${p.id}`} className="flex flex-1 items-center gap-2 min-w-0">
                      <Avatar url={p.avatar_url} emoji={p.avatar_emoji} size={30} />
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-bold text-foreground">
                          {p.username}
                        </span>
                      </span>
                    </Link>
                    {user && user.id !== p.id && (
                      <form action={toggleFollow.bind(null, p.id)}>
                        <button
                          type="submit"
                          className={
                            followingIds.has(p.id)
                              ? "rounded-full border border-border-strong px-3 py-1 text-[11px] font-bold text-muted"
                              : "rounded-full border border-brand px-3 py-1 text-[11px] font-bold text-brand"
                          }
                        >
                          {followingIds.has(p.id) ? "フォロー中" : "フォロー"}
                        </button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[13px] font-bold text-foreground">人気の投稿</h2>
            {popularRecords.length === 0 ? (
              <p className="text-sm text-muted">まだ投稿がありません。</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {popularRecords.map((r) => (
                  <li key={r.id}>
                    <Link href={`/records/${r.id}`} className="flex items-center gap-2">
                      <Avatar url={r.avatar_url} emoji={r.avatar_emoji} size={30} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11px] font-bold text-foreground">
                          {r.username}
                        </span>
                        <span className="block truncate text-[11px] text-muted">
                          {r.memo || `${r.location} ・ ${r.machine}`}
                        </span>
                        <span className="block text-[11px] text-muted">
                          収支{" "}
                          <b className={r.diff >= 0 ? "text-positive" : "text-negative"}>
                            {formatYen(r.diff)}
                          </b>
                        </span>
                      </span>
                      <span className="w-12 flex-none">
                        <RecordSparkline diff={r.diff} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {q && (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="text-[13px] font-bold text-foreground">ユーザー ({profiles.length})</h2>
            {profiles.length === 0 ? (
              <p className="text-sm text-muted">該当するユーザーが見つかりませんでした。</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {profiles.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/profile/${p.id}`}
                      className="flex items-center gap-3 border-b border-border py-2.5 hover:opacity-80"
                    >
                      <Avatar url={p.avatar_url} emoji={p.avatar_emoji} size={32} />
                      <span className="text-sm font-medium text-foreground">{p.username}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-[13px] font-bold text-foreground">記録 ({records.length})</h2>
            {records.length === 0 ? (
              <p className="text-sm text-muted">該当する記録が見つかりませんでした。</p>
            ) : (
              <div className="flex flex-col">
                {records.map((r) => (
                  <RecordCard key={r.id} record={r} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
