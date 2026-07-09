"use client";

import { useActionState } from "react";
import type { RecordFormState } from "@/app/records/actions";
import type { Record as PlayRecord } from "@/lib/types";

const initialState: RecordFormState = { error: null };

type Action = (state: RecordFormState, formData: FormData) => Promise<RecordFormState>;

export function RecordForm({
  action,
  defaultValues,
  submitLabel = "登録する",
}: {
  action: Action;
  defaultValues?: Partial<PlayRecord>;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="flex flex-col gap-4 w-full max-w-md">
      <Field label="日付" htmlFor="play_date">
        <input
          id="play_date"
          name="play_date"
          type="date"
          required
          defaultValue={defaultValues?.play_date ?? today}
          max={today}
          className={inputClass}
        />
      </Field>

      <Field label="場所(店舗名)" htmlFor="location">
        <input
          id="location"
          name="location"
          type="text"
          required
          maxLength={50}
          placeholder="例: マルハン〇〇店"
          defaultValue={defaultValues?.location ?? ""}
          className={inputClass}
        />
      </Field>

      <Field label="機種" htmlFor="machine">
        <input
          id="machine"
          name="machine"
          type="text"
          required
          maxLength={50}
          placeholder="例: Pフィーバー myジャグラー"
          defaultValue={defaultValues?.machine ?? ""}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="投資額(円)" htmlFor="investment">
          <input
            id="investment"
            name="investment"
            type="number"
            inputMode="numeric"
            required
            min={0}
            step={1}
            placeholder="0"
            defaultValue={defaultValues?.investment ?? undefined}
            className={inputClass}
          />
        </Field>

        <Field label="回収額(円)" htmlFor="payout">
          <input
            id="payout"
            name="payout"
            type="number"
            inputMode="numeric"
            required
            min={0}
            step={1}
            placeholder="0"
            defaultValue={defaultValues?.payout ?? undefined}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="メモ(任意)" htmlFor="memo">
        <textarea
          id="memo"
          name="memo"
          rows={3}
          maxLength={300}
          placeholder="立ち回りメモなど"
          defaultValue={defaultValues?.memo ?? ""}
          className={inputClass}
        />
      </Field>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">公開設定</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-300">
            <input
              type="radio"
              name="is_public"
              value="public"
              defaultChecked={defaultValues?.is_public ?? true}
              className="h-4 w-4 border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500"
            />
            公開(みんなに見せる)
          </label>
          <label className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-300">
            <input
              type="radio"
              name="is_public"
              value="private"
              defaultChecked={defaultValues?.is_public === false}
              className="h-4 w-4 border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500"
            />
            非公開(自分のみ)
          </label>
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
      >
        {pending ? "保存中…" : submitLabel}
      </button>
    </form>
  );
}

const inputClass =
  "rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-indigo-500";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      {children}
    </div>
  );
}
