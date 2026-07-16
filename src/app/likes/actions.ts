"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";

export async function toggleLike(recordId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("record_likes")
    .select("record_id")
    .eq("record_id", recordId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("record_likes")
      .delete()
      .eq("record_id", recordId)
      .eq("user_id", user.id);
  } else {
    const { error } = await supabase
      .from("record_likes")
      .insert({ record_id: recordId, user_id: user.id });

    if (!error) {
      const { data: record } = await supabase
        .from("records")
        .select("user_id")
        .eq("id", recordId)
        .single();

      if (record) {
        await createNotification(supabase, {
          recipientId: record.user_id,
          actorId: user.id,
          type: "like",
          recordId,
        });
      }
    }
  }

  revalidatePath("/records");
  revalidatePath(`/records/${recordId}`);
  revalidatePath("/search");
  revalidatePath("/bookmarks");
}
