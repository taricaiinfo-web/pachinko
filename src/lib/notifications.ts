import type { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/lib/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * いいね・コメント・フォロー発生時に通知を作成する。
 * 自分自身への操作(自分の投稿に自分でいいね等)は通知しない。
 */
export async function createNotification(
  supabase: SupabaseServerClient,
  params: {
    recipientId: string;
    actorId: string;
    type: Notification["type"];
    recordId?: string | null;
  },
) {
  if (params.recipientId === params.actorId) return;

  await supabase.from("notifications").insert({
    recipient_id: params.recipientId,
    actor_id: params.actorId,
    type: params.type,
    record_id: params.recordId ?? null,
  });
}
