import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/ProfileForm";
import { logout } from "@/app/auth/actions";
import { sumRecords, formatYen } from "@/lib/aggregate";
import type { Record as PlayRecord } from "@/lib/types";

export const metadata = { title: "プロフィール | パチログ" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: records } = await supabase
    .from("records")
    .select("*")
    .eq("user_id", user.id);

  if (!profile) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-zinc-500">
        プロフィールの読み込みに失敗しました。時間をおいて再度お試しください。
      </div>
    );
  }

  const totals = sumRecords((records ?? []) as PlayRecord[]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-8">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          プロフィール設定
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{user.email}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="記録数" value={`${records?.length ?? 0}件`} />
        <StatTile label="投資合計" value={`${totals.investment.toLocaleString()}円`} />
        <StatTile
          label="収支合計"
          value={formatYen(totals.diff)}
          positive={totals.diff > 0}
          negative={totals.diff < 0}
        />
      </div>

      <ProfileForm profile={profile} />

      <form action={logout} className="mt-4">
        <button
          type="submit"
          className="w-full max-w-md rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
        >
          ログアウト
        </button>
      </form>
    </div>
  );
}

function StatTile({
  label,
  value,
  positive,
  negative,
}: {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <p
        className={`mt-1 text-base font-bold ${
          positive
            ? "text-rose-600 dark:text-rose-400"
            : negative
              ? "text-blue-600 dark:text-blue-400"
              : "text-zinc-900 dark:text-zinc-50"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
