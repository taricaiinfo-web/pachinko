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
    <form action={formAction} className="flex flex-col gap-3.5 w-full max-w-md">
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

      <Field label="店舗" htmlFor="location">
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
          placeholder="例: P北斗の拳 無双"
          defaultValue={defaultValues?.machine ?? ""}
          className={inputClass}
        />
      </Field>

      <Field label="投資額" htmlFor="investment">
        <div className={`${inputClass} flex items-center justify-end gap-1`}>
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
            className="w-full bg-transparent text-right font-bold outline-none"
          />
          <span className="text-muted">円</span>
        </div>
      </Field>

      <Field label="回収額" htmlFor="payout">
        <div className={`${inputClass} flex items-center justify-end gap-1`}>
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
            className="w-full bg-transparent text-right font-bold outline-none"
          />
          <span className="text-muted">円</span>
        </div>
      </Field>

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

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold text-foreground">公開設定</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 text-sm text-muted">
            <input
              type="radio"
              name="is_public"
              value="public"
              defaultChecked={defaultValues?.is_public ?? true}
              className="h-4 w-4 border-border-strong text-brand focus:ring-brand"
            />
            公開(みんなに見せる)
          </label>
          <label className="flex items-center gap-1.5 text-sm text-muted">
            <input
              type="radio"
              name="is_public"
              value="private"
              defaultChecked={defaultValues?.is_public === false}
              className="h-4 w-4 border-border-strong text-brand focus:ring-brand"
            />
            非公開(自分のみ)
          </label>
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-negative" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-lg bg-brand px-4 py-3 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
      >
        {pending ? "保存中…" : submitLabel}
      </button>
    </form>
  );
}

const inputClass =
  "rounded-[9px] border border-border-strong bg-surface px-3 py-2.5 text-[13px] text-foreground outline-none focus-within:ring-2 focus-within:ring-brand focus:ring-2 focus:ring-brand";

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
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[11px] font-bold text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
