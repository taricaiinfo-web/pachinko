import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatYen } from "@/lib/aggregate";
import { CommentSection } from "@/components/CommentSection";
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
    .select("*, profiles(username, avatar_emoji)")
    .eq("record_id", id)
    .order("created_at", { ascending: true });

  const isOwner = user?.id === record.user_id;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <Link
          href={`/profile/${record.user_id}`}
          className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:underline"
        >
          <span className="text-xl">{record.avatar_emoji ?? "🎰"}</span>
          {record.username}
        </Link>
        {isOwner && (
          <div className="flex gap-2">
            <Link
              href={`/records/${id}/edit`}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              編集
            </Link>
            <form action={deleteRecord.bind(null, id)}>
              <button
                type="submit"
                className="rounded-lg border border-red-200 dark:border-red-900 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
              >
                削除
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{record.play_date}</p>
        <h1 className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-50">
          {record.location} ・ {record.machine}
        </h1>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">投資額</p>
            <p className="mt-0.5 font-semibold text-zinc-800 dark:text-zinc-100">
              {record.investment.toLocaleString()}円
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">回収額</p>
            <p className="mt-0.5 font-semibold text-zinc-800 dark:text-zinc-100">
              {record.payout.toLocaleString()}円
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">収支</p>
            <p
              className={`mt-0.5 font-bold ${
                record.diff > 0
                  ? "text-rose-600 dark:text-rose-400"
                  : record.diff < 0
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-zinc-500"
              }`}
            >
              {formatYen(record.diff)}
            </p>
          </div>
        </div>

        {record.memo && (
          <p className="mt-4 whitespace-pre-wrap rounded-lg bg-zinc-50 dark:bg-zinc-900 p-3 text-sm text-zinc-600 dark:text-zinc-300">
            {record.memo}
          </p>
        )}
      </div>

      <CommentSection
        recordId={id}
        comments={(comments ?? []) as unknown as CommentWithProfile[]}
        currentUserId={user?.id ?? null}
      />
    </div>
  );
}
