"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AVATAR_OPTIONS } from "@/lib/constants";

export type ProfileFormState = {
  error: string | null;
  success: boolean;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const username = getString(formData, "username");
  const bio = getString(formData, "bio");
  const avatarEmoji = getString(formData, "avatar_emoji") || "🎰";

  if (username.length < 2 || username.length > 20) {
    return { error: "ユーザー名は2〜20文字で入力してください。", success: false };
  }
  if (!/^[a-zA-Z0-9_\-ぁ-んァ-ヶ一-龠ー]+$/.test(username)) {
    return { error: "ユーザー名に使用できない文字が含まれています。", success: false };
  }
  if (!AVATAR_OPTIONS.includes(avatarEmoji)) {
    return { error: "不正なアバターです。", success: false };
  }
  if (bio.length > 200) {
    return { error: "自己紹介は200文字以内で入力してください。", success: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です。", success: false };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      bio: bio || null,
      avatar_emoji: avatarEmoji,
    } satisfies Partial<import("@/lib/types").Profile>)
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { error: "そのユーザー名は既に使われています。", success: false };
    }
    return { error: "更新に失敗しました。", success: false };
  }

  revalidatePath("/profile");
  revalidatePath("/records");
  return { error: null, success: true };
}
