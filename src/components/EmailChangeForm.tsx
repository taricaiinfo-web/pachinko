"use client";

import { useActionState } from "react";
import { changeEmail, type SettingsFormState } from "@/app/settings/actions";

const initialState: SettingsFormState = { error: null, success: false };

export function EmailChangeForm({ currentEmail }: { currentEmail: string | null }) {
  const [state, formAction, pending] = useActionState(changeEmail, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {currentEmail && (
        <p className="text-sm text-muted">
          現在のメールアドレス: <span className="text-foreground">{currentEmail}</span>
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="newEmail" className="text-sm font-medium text-foreground">
          新しいメールアドレス
        </label>
        <input
          id="newEmail"
          name="newEmail"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
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
          確認メールを送信しました。新旧いずれかのメール内のリンクから変更を確定してください。
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-brand px-4 py-2.5 text-base font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
      >
        {pending ? "送信中…" : "メールアドレスを変更する"}
      </button>
    </form>
  );
}
