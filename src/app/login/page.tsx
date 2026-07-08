import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { continueAsGuest } from "@/app/auth/actions";

export const metadata = { title: "ログイン | パチログ" };

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
      <div className="flex flex-col items-center gap-2">
        <span className="text-4xl">🎰</span>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">パチログ</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          実働データを記録・共有しよう
        </p>
      </div>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>

      <div className="flex w-full max-w-sm items-center gap-3 text-xs text-zinc-400">
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        または
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <form action={continueAsGuest} className="w-full max-w-sm">
        <button
          type="submit"
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
        >
          ゲストとして閲覧する
        </button>
        <p className="mt-2 text-center text-xs text-zinc-400">
          ログインなしでみんなの記録を閲覧できます(データ登録・コメントはできません)
        </p>
      </form>
    </div>
  );
}
