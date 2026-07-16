import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Avatar } from "@/components/Avatar";
import { RecordSparkline } from "@/components/RecordSparkline";
import { formatYen } from "@/lib/aggregate";
import { toggleLike } from "@/app/likes/actions";
import { toggleBookmark } from "@/app/bookmarks/actions";
import type { RecordWithProfile } from "@/lib/types";

export function RecordCard({ record: r }: { record: RecordWithProfile }) {
  return (
    <article className="flex flex-col gap-2 border-b border-border px-1 py-3.5">
      <Link
        href={`/profile/${r.user_id}`}
        className="flex items-center gap-2 text-sm font-bold text-foreground"
      >
        <Avatar url={r.avatar_url} emoji={r.avatar_emoji} size={34} />
        <span className="flex-1 leading-tight">
          <span className="flex items-center gap-1.5">
            {r.username}
            {!r.is_public && (
              <span className="rounded-full bg-input px-2 py-0.5 text-[11px] font-medium text-muted">
                非公開
              </span>
            )}
          </span>
        </span>
        <span className="text-[10px] font-normal text-muted-3">
          {formatDistanceToNow(new Date(r.created_at), { locale: ja, addSuffix: true })}
        </span>
      </Link>

      {r.memo && (
        <p className="line-clamp-3 whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/90">
          {r.memo}
        </p>
      )}

      <Link href={`/records/${r.id}`} className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted">
          <span>📅 {r.play_date}</span>
          <span>🏠 {r.location}</span>
          <span>🎰 {r.machine}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-[10px] text-muted">投資</p>
            <p className="text-[13px] font-bold text-foreground">
              {r.investment.toLocaleString()}
              <span className="text-[9px] font-normal">円</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted">回収</p>
            <p className="text-[13px] font-bold text-foreground">
              {r.payout.toLocaleString()}
              <span className="text-[9px] font-normal">円</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted">収支</p>
            <p
              className={`text-[13px] font-bold ${
                r.diff > 0 ? "text-positive" : r.diff < 0 ? "text-negative" : "text-muted-2"
              }`}
            >
              {formatYen(r.diff)}
            </p>
          </div>
        </div>

        <RecordSparkline diff={r.diff} />
      </Link>

      <div className="flex items-center gap-5 pt-0.5 text-[13px] text-muted">
        <Link
          href={`/records/${r.id}#comments`}
          className="flex items-center gap-1.5 hover:text-foreground"
        >
          💬 {r.comment_count}
        </Link>

        <form action={toggleLike.bind(null, r.id)}>
          <button
            type="submit"
            className={`flex items-center gap-1.5 ${
              r.liked_by_me ? "font-semibold text-brand" : "hover:text-brand"
            }`}
          >
            {r.liked_by_me ? "❤️" : "🤍"} {r.like_count}
          </button>
        </form>

        <form action={toggleBookmark.bind(null, r.id)} className="ml-auto">
          <button
            type="submit"
            className={r.bookmarked_by_me ? "font-semibold text-brand" : "hover:text-brand"}
          >
            {r.bookmarked_by_me ? "🔖" : "📑"}
          </button>
        </form>
      </div>
    </article>
  );
}
