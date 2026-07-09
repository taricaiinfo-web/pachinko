"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type RecordFormState = {
  error: string | null;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseAmount(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 100_000_000) return null;
  return n;
}

export async function createRecord(
  _prevState: RecordFormState,
  formData: FormData,
): Promise<RecordFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です。" };

  const playDate = getString(formData, "play_date");
  const location = getString(formData, "location");
  const machine = getString(formData, "machine");
  const investmentRaw = getString(formData, "investment");
  const payoutRaw = getString(formData, "payout");
  const memo = getString(formData, "memo");
  const isPublic = getString(formData, "is_public") !== "private";

  if (!playDate || !location || !machine || !investmentRaw || !payoutRaw) {
    return { error: "必須項目をすべて入力してください。" };
  }

  const investment = parseAmount(investmentRaw);
  const payout = parseAmount(payoutRaw);
  if (investment === null || payout === null) {
    return { error: "投資額・回収額は0以上の整数で入力してください。" };
  }
  if (location.length > 50 || machine.length > 50) {
    return { error: "場所・機種は50文字以内で入力してください。" };
  }
  if (memo.length > 300) {
    return { error: "メモは300文字以内で入力してください。" };
  }

  const { error, data } = await supabase
    .from("records")
    .insert({
      user_id: user.id,
      play_date: playDate,
      location,
      machine,
      investment,
      payout,
      memo: memo || null,
      is_public: isPublic,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "登録に失敗しました。時間をおいて再度お試しください。" };
  }

  revalidatePath("/records");
  revalidatePath("/stats");
  revalidatePath("/profile");
  redirect(`/records/${data.id}`);
}

export async function updateRecord(
  recordId: string,
  _prevState: RecordFormState,
  formData: FormData,
): Promise<RecordFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です。" };

  const playDate = getString(formData, "play_date");
  const location = getString(formData, "location");
  const machine = getString(formData, "machine");
  const investmentRaw = getString(formData, "investment");
  const payoutRaw = getString(formData, "payout");
  const memo = getString(formData, "memo");
  const isPublic = getString(formData, "is_public") !== "private";

  if (!playDate || !location || !machine || !investmentRaw || !payoutRaw) {
    return { error: "必須項目をすべて入力してください。" };
  }

  const investment = parseAmount(investmentRaw);
  const payout = parseAmount(payoutRaw);
  if (investment === null || payout === null) {
    return { error: "投資額・回収額は0以上の整数で入力してください。" };
  }

  const { error } = await supabase
    .from("records")
    .update({
      play_date: playDate,
      location,
      machine,
      investment,
      payout,
      memo: memo || null,
      is_public: isPublic,
    })
    .eq("id", recordId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "更新に失敗しました。" };
  }

  revalidatePath("/records");
  revalidatePath("/stats");
  revalidatePath(`/records/${recordId}`);
  redirect(`/records/${recordId}`);
}

export async function deleteRecord(recordId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("records").delete().eq("id", recordId).eq("user_id", user.id);

  revalidatePath("/records");
  revalidatePath("/stats");
  redirect("/records");
}
