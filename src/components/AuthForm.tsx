"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login, signup, type AuthFormState } from "@/app/auth/actions";

const initialState: AuthFormState = { error: null, info: null };

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "login" ? login : signup;
  const [state, formAction, pending] = useActionState(action, initialState);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/records";

  return (
    <form action={formAction} className="flex flex-col gap-4 w-full max-w-sm">
      {mode === "login" && (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder="6文字以上"
          className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {mode === "signup" && (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="passwordConfirm"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            パスワード(確認)
          </label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      )}
      {state.info && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400" role="status">
          {state.info}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
      >
        {pending ? "処理中…" : mode === "login" ? "ログイン" : "アカウント作成"}
      </button>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        {mode === "login" ? (
          <>
            アカウントをお持ちでない方は{" "}
            <Link href="/signup" className="font-medium text-indigo-600 dark:text-indigo-400">
              新規登録
            </Link>
          </>
        ) : (
          <>
            すでにアカウントをお持ちの方は{" "}
            <Link href="/login" className="font-medium text-indigo-600 dark:text-indigo-400">
              ログイン
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
