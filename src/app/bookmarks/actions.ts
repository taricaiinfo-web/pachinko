"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleBookmark(recordId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("record_bookmarks")
    .select("record_id")
    .eq("record_id", recordId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("record_bookmarks")
      .delete()
      .eq("record_id", recordId)
      .eq("user_id", user.id);
  } else {
    await supabase.from("record_bookmarks").insert({ record_id: recordId, user_id: user.id });
  }

  revalidatePath("/records");
  revalidatePath(`/records/${recordId}`);
  revalidatePath("/search");
  revalidatePath("/bookmarks");
}
