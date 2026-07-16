"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";

export async function toggleFollow(followeeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id === followeeId) return;

  const { data: existing } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("followee_id", followeeId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("followee_id", followeeId);
  } else {
    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: user.id, followee_id: followeeId });

    if (!error) {
      await createNotification(supabase, {
        recipientId: followeeId,
        actorId: user.id,
        type: "follow",
      });
    }
  }

  revalidatePath(`/profile/${followeeId}`);
  revalidatePath("/records");
  revalidatePath("/search");
}
