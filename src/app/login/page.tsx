import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

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
    </div>
  );
}
