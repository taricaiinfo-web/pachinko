import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/Avatar";
import { markAllNotificationsRead } from "@/app/notifications/actions";
import type { NotificationWithActor } from "@/lib/types";

export const metadata = { title: "通知 | パチログ" };

const TYPE_ICON: Record<NotificationWithActor["type"], string> = {
  like: "❤️",
  comment: "💬",
  follow: "👤",
};

const TYPE_TEXT: Record<NotificationWithActor["type"], string> = {
  like: "さんがあなたの記録にいいねしました",
  comment: "さんがあなたの記録にコメントしました",
  follow: "さんにフォローされました",
};

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: tabParam } = await searchParams;
  const tab = tabParam === "follow" ? "follow" : "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("notifications")
    .select("*, actor:profiles!notifications_actor_id_fkey(username, avatar_emoji, avatar_url)")
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (tab === "follow") {
    query = query.eq("type", "follow");
  }

  const { data } = await query;
  const notifications = (data ?? []) as unknown as NotificationWithActor[];

  await markAllNotificationsRead();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-4">
      <h1 className="px-1 py-2 text-[17px] font-bold text-foreground">通知</h1>

      <div className="flex border-b border-border">
        <TabLink href="/notifications?tab=all" active={tab === "all"} label="すべて" />
        <TabLink href="/notifications?tab=follow" active={tab === "follow"} label="フォロー" />
      </div>

      <div className="flex flex-col">
        {notifications.map((n) => {
          const href = n.type === "follow" ? `/profile/${n.actor_id}` : `/records/${n.record_id}`;
          return (
            <Link
              key={n.id}
              href={href}
              className="flex items-center gap-2.5 border-b border-border py-2.5"
            >
              <Avatar url={n.actor?.avatar_url} emoji={n.actor?.avatar_emoji} size={32} />
              <span className="flex-1 text-[11px] leading-relaxed text-foreground/90">
                <b className="font-bold">{n.actor?.username ?? "unknown"}</b>
                {TYPE_TEXT[n.type]}
              </span>
              <span className="text-[13px]">{TYPE_ICON[n.type]}</span>
            </Link>
          );
        })}
        {notifications.length === 0 && (
          <p className="py-16 text-center text-sm text-muted">通知はまだありません。</p>
        )}
      </div>
    </div>
  );
}

function TabLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`flex-1 border-b-2 py-2 text-center text-xs font-bold transition-colors ${
        active ? "border-brand text-brand" : "border-transparent text-muted-2"
      }`}
    >
      {label}
    </Link>
  );
}
