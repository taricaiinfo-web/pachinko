import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatYen } from "@/lib/aggregate";
import { CommentSection } from "@/components/CommentSection";
import { Avatar } from "@/components/Avatar";
import { BackButton } from "@/components/BackButton";
import { RecordSparkline } from "@/components/RecordSparkline";
import { toggleLike } from "@/app/likes/actions";
import { toggleBookmark } from "@/app/bookmarks/actions";
import { deleteRecord } from "@/app/records/actions";
import type { CommentWithProfile } from "@/lib/types";

export default async function RecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: record } = await supabase
    .from("records_with_profile")
    .select("*")
    .eq("id", id)
    .single();

  if (!record) notFound();

  const { data: comments } = await supabase
    .from("comments")
    .select("*, profiles(username, avatar_emoji, avatar_url)")
    .eq("record_id", id)
    .order("created_at", { ascending: true });

  const isOwner = user?.id === record.user_id;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-3 px-4 py-4">
      <div className="flex items-center">
        <BackButton />
        <h1 className="flex-1 -ml-8 text-center text-[16px] font-bold text-foreground">投稿詳細</h1>
      </div>

      {isOwner && (
        <div className="flex gap-2 self-end">
          <Link
            href={`/records/${id}/edit`}
            className="rounded-lg border border-border-strong px-3 py-1.5 text-xs font-medium text-muted hover:bg-input"
          >
            編集
          </Link>
          <form action={deleteRecord.bind(null, id)}>
            <button
              type="submit"
              className="rounded-lg border border-negative/30 px-3 py-1.5 text-xs font-medium text-negative hover:bg-negative/5"
            >
              削除
            </button>
          </form>
        </div>
      )}

      <Link href={`/profile/${record.user_id}`} className="flex items-center gap-2">
        <Avatar url={record.avatar_url} emoji={record.avatar_emoji} size={32} />
        <span className="flex-1 text-[13px] font-bold text-foreground">
          {record.username}
          {!record.is_public && (
            <span className="ml-1.5 rounded-full bg-input px-2 py-0.5 text-[11px] font-medium text-muted">
              非公開
            </span>
          )}
        </span>
      </Link>

      {record.memo && (
        <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/90">
          {record.memo}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted">
        <span>📅 {record.play_date}</span>
        <span>🏢 {record.location}</span>
        <span>🎰 {record.machine}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-[10px] text-muted">投資</p>
          <p className="text-[13px] font-bold text-foreground">
            {record.investment.toLocaleString()}
            <span className="text-[9px] font-normal">円</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted">回収</p>
          <p className="text-[13px] font-bold text-foreground">
            {record.payout.toLocaleString()}
            <span className="text-[9px] font-normal">円</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted">収支</p>
          <p
            className={`text-[13px] font-bold ${
              record.diff > 0 ? "text-positive" : record.diff < 0 ? "text-negative" : "text-muted-2"
            }`}
          >
            {formatYen(record.diff)}
          </p>
        </div>
      </div>

      <RecordSparkline diff={record.diff} />

      <div className="flex items-center gap-5 border-b border-border pb-3 text-[13px] text-muted">
        <span className="flex items-center gap-1.5">💬 {record.comment_count}</span>

        <form action={toggleLike.bind(null, record.id)}>
          <button
            type="submit"
            className={`flex items-center gap-1.5 ${
              record.liked_by_me ? "font-semibold text-brand" : "hover:text-brand"
            }`}
          >
            {record.liked_by_me ? "❤️" : "🤍"} {record.like_count}
          </button>
        </form>

        <form action={toggleBookmark.bind(null, record.id)} className="ml-auto">
          <button
            type="submit"
            className={record.bookmarked_by_me ? "font-semibold text-brand" : "hover:text-brand"}
          >
            {record.bookmarked_by_me ? "🔖" : "📑"}
          </button>
        </form>
      </div>

      <div id="comments">
        <CommentSection
          recordId={id}
          comments={(comments ?? []) as unknown as CommentWithProfile[]}
          currentUserId={user?.id ?? null}
        />
      </div>
    </div>
  );
}
