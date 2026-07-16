import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sumRecords, formatYen } from "@/lib/aggregate";
import { Avatar } from "@/components/Avatar";
import { BackButton } from "@/components/BackButton";
import { TrendSparkline } from "@/components/TrendSparkline";
import { toggleFollow } from "@/app/follows/actions";
import type { Record as PlayRecord } from "@/lib/types";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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

  const { count: followerCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("followee_id", id);

  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", id);

  const isOwnProfile = user.id === id;
  let isFollowing = false;
  if (!isOwnProfile) {
    const { data: followRow } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("followee_id", id)
      .maybeSingle();
    isFollowing = !!followRow;
  }

  const totals = sumRecords((records ?? []) as PlayRecord[]);

  const recentRecords = [...(records ?? [])].reverse().slice(-12);
  const trend = recentRecords.map((_, i) =>
    recentRecords.slice(0, i + 1).reduce((sum, r) => sum + r.payout - r.investment, 0),
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <BackButton />
        <span className="text-lg text-muted-3">···</span>
      </div>

      <div className="flex items-center gap-3">
        <Avatar url={profile.avatar_url} emoji={profile.avatar_emoji} size={56} className="text-2xl" />
        <div>
          <h1 className="text-[15px] font-bold text-foreground">{profile.username}</h1>
        </div>
      </div>

      {!isOwnProfile && (
        <form action={toggleFollow.bind(null, id)}>
          <button
            type="submit"
            className={
              isFollowing
                ? "w-full rounded-[9px] border border-brand py-2 text-[12px] font-bold text-brand"
                : "w-full rounded-[9px] bg-brand py-2 text-[12px] font-bold text-white"
            }
          >
            {isFollowing ? "フォロー中" : "フォローする"}
          </button>
        </form>
      )}

      {profile.bio && <p className="text-[11px] leading-relaxed text-foreground/90">{profile.bio}</p>}

      <div className="flex text-center">
        <StatCol label="投稿" value={records?.length ?? 0} unit="件" />
        <StatCol label="フォロー" value={followingCount ?? 0} unit="人" />
        <StatCol label="フォロワー" value={followerCount ?? 0} unit="人" />
      </div>

      <div>
        <h2 className="mb-1.5 text-[12px] font-bold text-foreground">収支サマリー</h2>
        <p className="text-[10px] text-muted">収支</p>
        <div className="flex items-end justify-between gap-3">
          <p className={`text-[22px] font-black ${totals.diff >= 0 ? "text-positive" : "text-negative"}`}>
            {formatYen(totals.diff)}
          </p>
          {trend.length > 0 && <TrendSparkline values={trend} width={70} height={30} />}
        </div>
      </div>

      <div>
        <h2 className="mb-1 text-[13px] font-bold text-foreground">最近の記録</h2>
        <div className="flex flex-col">
          {(records ?? []).slice(0, 10).map((r) => {
            const diff = r.payout - r.investment;
            return (
              <Link key={r.id} href={`/records/${r.id}`} className="flex items-center justify-between border-b border-border py-2.5 text-sm">
                <span className="text-muted">
                  {r.play_date} ・ {r.location} ・ {r.machine}
                </span>
                <span
                  className={`flex-none font-semibold ${
                    diff > 0 ? "text-positive" : diff < 0 ? "text-negative" : "text-muted-2"
                  }`}
                >
                  {formatYen(diff)}
                </span>
              </Link>
            );
          })}
          {(records ?? []).length === 0 && <p className="text-sm text-muted">まだ記録がありません。</p>}
        </div>
      </div>
    </div>
  );
}

function StatCol({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="flex-1">
      <p className="text-[9px] text-muted">{label}</p>
      <p className="text-[15px] font-black text-foreground">
        {value.toLocaleString()}
        <span className="text-[9px] font-normal text-muted"> {unit}</span>
      </p>
    </div>
  );
}
