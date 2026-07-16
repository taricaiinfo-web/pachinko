"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";

export type CommentFormState = {
  error: string | null;
};

export async function createComment(
  recordId: string,
  _prevState: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const content = String(formData.get("content") ?? "").trim();

  if (!content) {
    return { error: "コメントを入力してください。" };
  }
  if (content.length > 500) {
    return { error: "コメントは500文字以内で入力してください。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です。" };

  const { error } = await supabase.from("comments").insert({
    record_id: recordId,
    user_id: user.id,
    content,
  });

  if (error) {
    return { error: "コメントの投稿に失敗しました。" };
  }

  const { data: record } = await supabase
    .from("records")
    .select("user_id")
    .eq("id", recordId)
    .single();

  if (record) {
    await createNotification(supabase, {
      recipientId: record.user_id,
      actorId: user.id,
      type: "comment",
      recordId,
    });
  }

  revalidatePath(`/records/${recordId}`);
  return { error: null };
}

export async function deleteComment(recordId: string, commentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("comments").delete().eq("id", commentId).eq("user_id", user.id);

  revalidatePath(`/records/${recordId}`);
}
