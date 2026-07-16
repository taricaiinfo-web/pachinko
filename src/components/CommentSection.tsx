"use client";

import { useActionState } from "react";
import { createComment, deleteComment, type CommentFormState } from "@/app/comments/actions";
import { Avatar } from "@/components/Avatar";
import type { CommentWithProfile } from "@/lib/types";

const initialState: CommentFormState = { error: null };

export function CommentSection({
  recordId,
  comments,
  currentUserId,
}: {
  recordId: string;
  comments: CommentWithProfile[];
  currentUserId: string | null;
}) {
  const boundCreate = createComment.bind(null, recordId);
  const [state, formAction, pending] = useActionState(boundCreate, initialState);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[13px] font-bold text-foreground">
        コメント ({comments.length})
      </h2>

      <ul className="flex flex-col gap-3">
        {comments.map((c) => (
          <li key={c.id} className="flex items-start gap-2">
            <Avatar url={c.profiles?.avatar_url} emoji={c.profiles?.avatar_emoji} size={26} />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-foreground">
                  {c.profiles?.username ?? "unknown"}
                </span>
                <div className="flex items-center gap-2">
                  <time className="text-[9px] text-muted-3">
                    {new Date(c.created_at).toLocaleString("ja-JP", {
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                  {currentUserId === c.user_id && (
                    <form action={deleteComment.bind(null, recordId, c.id)}>
                      <button type="submit" className="text-[11px] text-muted-3 hover:text-negative">
                        削除
                      </button>
                    </form>
                  )}
                </div>
              </div>
              <p className="mt-0.5 whitespace-pre-wrap break-words text-[10px] leading-relaxed text-foreground/90">
                {c.content}
              </p>
            </div>
          </li>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-muted">まだコメントはありません。</p>
        )}
      </ul>

      {currentUserId && (
        <form action={formAction} className="flex items-center gap-2">
          <textarea
            name="content"
            rows={1}
            maxLength={500}
            placeholder="コメントを入力..."
            className="flex-1 resize-none rounded-full bg-input px-4 py-2 text-[11px] text-foreground outline-none placeholder:text-muted-3"
          />
          <button
            type="submit"
            disabled={pending}
            className="flex-none rounded-full bg-brand px-4 py-2 text-[11px] font-bold text-white hover:bg-brand-hover disabled:opacity-60"
          >
            {pending ? "投稿中…" : "投稿"}
          </button>
        </form>
      )}
      {state.error && (
        <p className="text-sm text-negative" role="alert">
          {state.error}
        </p>
      )}
    </div>
  );
}
