import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackButton } from "@/components/BackButton";
import { PasswordChangeForm } from "@/components/PasswordChangeForm";

export const metadata = { title: "パスワード変更 | パチログ" };

export default async function PasswordSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-4">
      <div className="flex items-center">
        <BackButton />
        <h1 className="flex-1 -ml-8 text-center text-[16px] font-bold text-foreground">
          パスワード変更
        </h1>
      </div>
      <PasswordChangeForm />
    </div>
  );
}
