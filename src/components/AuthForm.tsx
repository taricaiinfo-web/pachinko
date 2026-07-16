"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login, signup, type AuthFormState } from "@/app/auth/actions";

const initialState: AuthFormState = { error: null, info: null };

const inputClass =
  "rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-base text-foreground outline-none focus:ring-2 focus:ring-brand";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "login" ? login : signup;
  const [state, formAction, pending] = useActionState(action, initialState);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/records";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-4 w-full max-w-sm">
      {mode === "login" && (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder="6文字以上"
          className={inputClass}
        />
      </div>

      {mode === "signup" && (
        <div className="flex flex-col gap-1">
          <label htmlFor="passwordConfirm" className="text-sm font-medium text-foreground">
            パスワード(確認)
          </label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            autoComplete="new-password"
            className={inputClass}
          />
        </div>
      )}

      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={showPassword}
          onChange={(e) => setShowPassword(e.target.checked)}
          className="h-4 w-4 rounded border-border-strong text-brand focus:ring-brand"
        />
        パスワードを表示する
      </label>

      {state.error && (
        <p className="text-sm text-negative" role="alert">
          {state.error}
        </p>
      )}
      {state.info && (
        <p className="text-sm text-positive" role="status">
          {state.info}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-brand px-4 py-2.5 text-base font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
      >
        {pending ? "処理中…" : mode === "login" ? "ログイン" : "アカウント作成"}
      </button>

      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            アカウントをお持ちでない方は{" "}
            <Link href="/signup" className="font-medium text-brand">
              新規登録
            </Link>
          </>
        ) : (
          <>
            すでにアカウントをお持ちの方は{" "}
            <Link href="/login" className="font-medium text-brand">
              ログイン
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
