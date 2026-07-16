import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { BrandLogo } from "@/components/BrandLogo";

export const metadata = { title: "ログイン | パチログ" };

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
      <div className="flex flex-col items-center gap-2">
        <BrandLogo />
        <h1 className="text-2xl font-black text-foreground">パチログ</h1>
        <p className="text-sm text-muted">
          収支を記録・分析・共有しよう！
        </p>
      </div>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
