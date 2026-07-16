"use server";

import { createClient } from "@/lib/supabase/server";

export type SettingsFormState = {
  error: string | null;
  success: boolean;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function changePassword(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const newPassword = getString(formData, "newPassword");
  const confirmPassword = getString(formData, "confirmPassword");

  if (newPassword.length < 6) {
    return { error: "パスワードは6文字以上にしてください。", success: false };
  }
  if (newPassword !== confirmPassword) {
    return { error: "パスワードが一致しません。", success: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "ログインが必要です。", success: false };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return { error: "パスワードの変更に失敗しました。時間をおいて再度お試しください。", success: false };
  }

  return { error: null, success: true };
}

export async function changeEmail(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const newEmail = getString(formData, "newEmail");

  if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    return { error: "有効なメールアドレスを入力してください。", success: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "ログインが必要です。", success: false };
  }

  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "このメールアドレスは既に使用されています。", success: false };
    }
    return { error: "メールアドレスの変更に失敗しました。時間をおいて再度お試しください。", success: false };
  }

  return { error: null, success: true };
}
