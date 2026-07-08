"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileFormState } from "@/app/profile/actions";
import { AVATAR_OPTIONS } from "@/lib/constants";
import type { Profile } from "@/lib/types";
import { useState } from "react";

const initialState: ProfileFormState = { error: null, success: false };

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);
  const [avatar, setAvatar] = useState(profile.avatar_emoji ?? "🎰");

  return (
    <form action={formAction} className="flex flex-col gap-5 w-full max-w-md">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          アバター
        </span>
        <input type="hidden" name="avatar_emoji" value={avatar} />
        <div className="flex flex-wrap gap-2">
          {AVATAR_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setAvatar(emoji)}
              aria-pressed={avatar === emoji}
              className={`flex h-11 w-11 items-center justify-center rounded-full text-xl border-2 transition-colors ${
                avatar === emoji
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
                  : "border-transparent bg-zinc-100 dark:bg-zinc-800"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="username" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          ユーザー名
        </label>
        <input
          id="username"
          name="username"
          defaultValue={profile.username}
          required
          minLength={2}
          maxLength={20}
          className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="bio" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          自己紹介
        </label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={profile.bio ?? ""}
          maxLength={200}
          rows={3}
          placeholder="よろしくお願いします！"
          className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400" role="status">
          プロフィールを更新しました。
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
      >
        {pending ? "保存中…" : "保存する"}
      </button>
    </form>
  );
}
