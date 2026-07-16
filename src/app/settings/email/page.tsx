import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackButton } from "@/components/BackButton";
import { EmailChangeForm } from "@/components/EmailChangeForm";

export const metadata = { title: "メールアドレス変更 | パチログ" };

export default async function EmailSettingsPage() {
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
          メールアドレス変更
        </h1>
      </div>
      <EmailChangeForm currentEmail={user.email ?? null} />
    </div>
  );
}
