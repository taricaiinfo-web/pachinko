import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/ProfileForm";
import { BackButton } from "@/components/BackButton";

export const metadata = { title: "プロフィール編集 | パチログ" };

export default async function EditProfilePage() {
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

  if (!profile) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-muted">
        プロフィールの読み込みに失敗しました。時間をおいて再度お試しください。
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-4">
      <div className="flex items-center">
        <BackButton />
        <h1 className="flex-1 -ml-8 text-center text-[16px] font-bold text-foreground">
          プロフィール編集
        </h1>
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}
