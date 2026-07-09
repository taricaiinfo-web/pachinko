"use client";

import { useActionState, useRef, useState } from "react";
import { updateProfile, type ProfileFormState } from "@/app/profile/actions";
import { AVATAR_OPTIONS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/Avatar";
import type { Profile } from "@/lib/types";

const initialState: ProfileFormState = { error: null, success: false };
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);
  const [avatar, setAvatar] = useState(profile.avatar_emoji ?? "🎰");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("画像ファイルを選択してください。");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setUploadError("画像サイズは2MB以内にしてください。");
      return;
    }

    setUploadError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${profile.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (error) {
        setUploadError("画像のアップロードに失敗しました。");
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-5 w-full max-w-md">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          アバター
        </span>
        <input type="hidden" name="avatar_emoji" value={avatar} />
        <input type="hidden" name="avatar_url" value={avatarUrl} />

        <div className="flex items-center gap-3">
          <Avatar url={avatarUrl || null} emoji={avatar} size={56} className="text-2xl" />
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-60"
              >
                {uploading ? "アップロード中…" : "写真を選択"}
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl("")}
                  className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  写真を削除
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {uploadError && (
              <p className="text-xs text-red-600 dark:text-red-400">{uploadError}</p>
            )}
          </div>
        </div>

        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          写真を設定しない場合は、下から絵文字を選べます。
        </span>
        <div className="flex flex-wrap gap-2">
          {AVATAR_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                setAvatar(emoji);
                setAvatarUrl("");
              }}
              aria-pressed={!avatarUrl && avatar === emoji}
              className={`flex h-11 w-11 items-center justify-center rounded-full text-xl border-2 transition-colors ${
                !avatarUrl && avatar === emoji
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
