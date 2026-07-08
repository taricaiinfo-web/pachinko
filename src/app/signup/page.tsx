import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "新規登録 | パチログ" };

export default function SignupPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
      <div className="flex flex-col items-center gap-2">
        <span className="text-4xl">🎰</span>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">パチログ</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          まずはアカウントを作成しましょう
        </p>
      </div>
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
    </div>
  );
}
