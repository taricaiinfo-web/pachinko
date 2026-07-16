import Link from "next/link";
import { redirect } from "next/navigation";
import { startOfMonth, format } from "date-fns";
import { ja } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/Avatar";
import { TrendSparkline } from "@/components/TrendSparkline";
import { sumRecords, formatYen } from "@/lib/aggregate";
import type { Record as PlayRecord } from "@/lib/types";

export const metadata = { title: "マイページ | パチログ" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: records } = await supabase
    .from("records")
    .select("*")
    .eq("user_id", user.id)
    .order("play_date", { ascending: false });

  if (!profile) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-muted">
        プロフィールの読み込みに失敗しました。時間をおいて再度お試しください。
      </div>
    );
  }

  const now = new Date();
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const monthRecords = (records ?? []).filter((r) => r.play_date >= monthStart) as PlayRecord[];
  const totals = sumRecords(monthRecords);
  const wins = monthRecords.filter((r) => r.payout - r.investment > 0).length;
  const winRate = monthRecords.length > 0 ? Math.round((wins / monthRecords.length) * 100) : 0;
  const avgDiff = monthRecords.length > 0 ? Math.round(totals.diff / monthRecords.length) : 0;

  const orderedMonthRecords = [...monthRecords].reverse();
  const trend = orderedMonthRecords.map((_, i) =>
    orderedMonthRecords.slice(0, i + 1).reduce((sum, r) => sum + r.payout - r.investment, 0),
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-3.5 px-4 py-4">
      <h1 className="px-1 py-2 text-[17px] font-bold text-foreground">マイページ</h1>

      <div className="flex items-center gap-3">
        <Avatar url={profile.avatar_url} emoji={profile.avatar_emoji} size={48} />
        <div>
          <p className="text-[14px] font-bold text-foreground">{profile.username}</p>
          <Link href="/profile/edit" className="text-[10px] font-medium text-brand">
            プロフィールを編集 ›
          </Link>
        </div>
      </div>

      <div className="rounded-[11px] bg-input p-3.5">
        <p className="mb-1.5 text-[11px] font-bold text-foreground">
          収支サマリー({format(now, "yyyy年M月", { locale: ja })})
        </p>
        <div className="mb-2 flex items-end justify-between">
          <div>
            <p className="text-[9px] text-muted">収支</p>
            <p className={`text-[19px] font-black ${totals.diff >= 0 ? "text-positive" : "text-negative"}`}>
              {formatYen(totals.diff)}
            </p>
          </div>
          {trend.length > 0 && <TrendSparkline values={trend} width={70} height={30} />}
        </div>
        <div className="flex gap-2 text-[9px] text-muted">
          <span className="flex-1">
            投資額 <b className="text-[10px] text-foreground">{totals.investment.toLocaleString()}円</b>
          </span>
          <span className="flex-1">
            回収額 <b className="text-[10px] text-foreground">{totals.payout.toLocaleString()}円</b>
          </span>
        </div>
        <div className="mt-1 flex gap-2 text-[9px] text-muted">
          <span className="flex-1">
            勝率 <b className="text-[10px] text-foreground">{winRate}%</b>
          </span>
          <span className="flex-1">{monthRecords.length}回</span>
          <span className="flex-1">
            平均収支{" "}
            <b className={`text-[10px] ${avgDiff >= 0 ? "text-positive" : "text-negative"}`}>
              {formatYen(avgDiff)}
            </b>
          </span>
        </div>
      </div>

      <MenuRow href="/records/mine" title="データ一覧" subtitle="自分のデータを確認">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-foreground)" strokeWidth="1.7">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 9h18M8 4v16" />
        </svg>
      </MenuRow>
      <MenuRow href="/bookmarks" title="お気に入り" subtitle="保存した投稿を確認">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-foreground)" strokeWidth="1.7">
          <path d="M12 20s-7-4.3-7-9a4 4 0 017-2.5A4 4 0 0119 11c0 4.7-7 9-7 9z" />
        </svg>
      </MenuRow>
      <MenuRow href="/settings" title="設定" subtitle="アカウント・通知設定" last>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-foreground)" strokeWidth="1.7">
          <circle cx="12" cy="12" r="3" />
          <path d="M19 12a7 7 0 00-.1-1.3l2-1.5-2-3.4-2.3 1a7 7 0 00-2.3-1.3L15.7 3h-3.9l-.4 2.5a7 7 0 00-2.3 1.3l-2.3-1-2 3.4 2 1.5A7 7 0 004.7 12c0 .4 0 .9.1 1.3l-2 1.5 2 3.4 2.3-1a7 7 0 002.3 1.3l.4 2.5h3.9l.4-2.5a7 7 0 002.3-1.3l2.3 1 2-3.4-2-1.5c.1-.4.1-.9.1-1.3z" />
        </svg>
      </MenuRow>
    </div>
  );
}

function MenuRow({
  href,
  title,
  subtitle,
  children,
  last,
}: {
  href: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 py-3 ${last ? "" : "border-b border-border"}`}
    >
      {children}
      <div className="flex-1">
        <p className="text-[12px] font-bold text-foreground">{title}</p>
        <p className="text-[9px] text-muted">{subtitle}</p>
      </div>
      <span className="text-[14px] text-muted-3">›</span>
    </Link>
  );
}
