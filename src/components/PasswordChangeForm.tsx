"use client";

import { useActionState } from "react";
import { changePassword, type SettingsFormState } from "@/app/settings/actions";

const initialState: SettingsFormState = { error: null, success: false };

export function PasswordChangeForm() {
  const [state, formAction, pending] = useActionState(changePassword, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="newPassword" className="text-sm font-medium text-foreground">
          新しいパスワード
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="6文字以上"
          className="rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-base text-foreground outline-none focus:ring-2 focus:ring-brand"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
          新しいパスワード(確認)
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-base text-foreground outline-none focus:ring-2 focus:ring-brand"
        />
      </div>

      {state.error && (
        <p className="text-sm text-negative" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-positive" role="status">
          パスワードを変更しました。
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-brand px-4 py-2.5 text-base font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
      >
        {pending ? "変更中…" : "パスワードを変更する"}
      </button>
    </form>
  );
}
