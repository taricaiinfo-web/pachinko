import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { BrandLogo } from "@/components/BrandLogo";

export const metadata = { title: "新規登録 | パチログ" };

export default function SignupPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
      <div className="flex flex-col items-center gap-2">
        <BrandLogo />
        <h1 className="text-2xl font-black text-foreground">パチログ</h1>
        <p className="text-sm text-muted">
          まずはアカウントを作成しましょう
        </p>
      </div>
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
    </div>
  );
}
