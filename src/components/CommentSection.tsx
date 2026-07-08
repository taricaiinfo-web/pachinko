"use client";

import { useActionState } from "react";
import { createComment, deleteComment, type CommentFormState } from "@/app/comments/actions";
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
      <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        コメント ({comments.length})
      </h2>

      <ul className="flex flex-col gap-3">
        {comments.map((c) => (
          <li key={c.id} className="flex items-start gap-2">
            <span className="text-lg leading-none">{c.profiles?.avatar_emoji ?? "🎰"}</span>
            <div className="flex-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  {c.profiles?.username ?? "unknown"}
                </span>
                <div className="flex items-center gap-2">
                  <time className="text-[11px] text-zinc-400">
                    {new Date(c.created_at).toLocaleString("ja-JP", {
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                  {currentUserId === c.user_id && (
                    <form action={deleteComment.bind(null, recordId, c.id)}>
                      <button
                        type="submit"
                        className="text-[11px] text-zinc-400 hover:text-red-500"
                      >
                        削除
                      </button>
                    </form>
                  )}
                </div>
              </div>
              <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-zinc-800 dark:text-zinc-100">
                {c.content}
              </p>
            </div>
          </li>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            まだコメントはありません。
          </p>
        )}
      </ul>

      {currentUserId && (
        <form action={formAction} className="flex flex-col gap-2">
          <textarea
            name="content"
            rows={2}
            maxLength={500}
            placeholder="コメントを入力…"
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {state.error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="self-end rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            {pending ? "投稿中…" : "コメントする"}
          </button>
        </form>
      )}
    </div>
  );
}
