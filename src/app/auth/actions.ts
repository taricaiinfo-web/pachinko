"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { GUEST_COOKIE_NAME } from "@/lib/constants";

export type AuthFormState = {
  error: string | null;
  info: string | null;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const redirectTo = getString(formData, "redirectTo") || "/records";

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください。", info: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      error: "ログインに失敗しました。メールアドレスかパスワードが正しくありません。",
      info: null,
    };
  }

  (await cookies()).delete(GUEST_COOKIE_NAME);
  redirect(redirectTo);
}

export async function signup(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const passwordConfirm = getString(formData, "passwordConfirm");

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください。", info: null };
  }
  if (password.length < 6) {
    return { error: "パスワードは6文字以上にしてください。", info: null };
  }
  if (password !== passwordConfirm) {
    return { error: "パスワードが一致しません。", info: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    // サーバーのログに詳細を出力(ブラウザには出さない)。
    // 実際の原因を特定する際は `npm run dev` のターミナル、または
    // Vercel の Functions ログ / Supabase の Auth Logs を確認してください。
    console.error("[signup] Supabase auth error:", {
      code: error.code,
      status: error.status,
      message: error.message,
    });

    if (error.name === "AuthRetryableFetchError" || /fetch failed/i.test(error.message)) {
      return {
        error:
          "Supabase に接続できませんでした。.env.local の NEXT_PUBLIC_SUPABASE_URL / " +
          "NEXT_PUBLIC_SUPABASE_ANON_KEY が正しく設定されているか確認してください。",
        info: null,
      };
    }

    switch (error.code) {
      case "user_already_exists":
        return { error: "このメールアドレスは既に登録されています。", info: null };
      case "weak_password":
        return {
          error: "パスワードが弱すぎます。英数字を組み合わせて8文字以上を推奨します。",
          info: null,
        };
      case "over_email_send_rate_limit":
        return {
          error:
            "確認メールの送信回数が上限に達しました。しばらく時間をおいて再度お試しください。",
          info: null,
        };
      case "email_address_invalid":
        return { error: "そのメールアドレスは使用できません。", info: null };
      case "signup_disabled":
        return { error: "現在、新規登録を受け付けていません。管理者にお問い合わせください。", info: null };
    }

    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "このメールアドレスは既に登録されています。", info: null };
    }
    if (error.message.toLowerCase().includes("confirmation email")) {
      return {
        error:
          "確認メールの送信に失敗しました。Supabase の SMTP 設定(または送信レート制限)をご確認ください。",
        info: null,
      };
    }
    return { error: "登録に失敗しました。時間をおいて再度お試しください。", info: null };
  }

  // メール確認が有効な場合はセッションが発行されない
  if (!data.session) {
    return {
      error: null,
      info: "確認メールを送信しました。メール内のリンクからログインを完了してください。",
    };
  }

  (await cookies()).delete(GUEST_COOKIE_NAME);
  redirect("/profile?welcome=1");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  (await cookies()).delete(GUEST_COOKIE_NAME);
  redirect("/login");
}

/**
 * ログインをスキップし、ゲスト(閲覧専用)として続行する。
 * Supabase セッションは発行せず、Cookie フラグのみで閲覧専用ページへのアクセスを許可する。
 */
export async function continueAsGuest() {
  (await cookies()).set(GUEST_COOKIE_NAME, "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30日
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/records");
}
