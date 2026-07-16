import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackButton } from "@/components/BackButton";
import { logout } from "@/app/auth/actions";

export const metadata = { title: "設定 | パチログ" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-4">
      <div className="flex items-center">
        <BackButton />
        <h1 className="flex-1 -ml-8 text-center text-[16px] font-bold text-foreground">設定</h1>
      </div>

      <section>
        <p className="mb-1 text-[11px] font-bold text-muted">アカウント</p>
        <MenuRow href="/profile/edit" label="プロフィール編集" />
        <MenuRow href="/settings/password" label="パスワード変更" />
        <MenuRow href="/settings/email" label="メールアドレス変更" last />
      </section>

      <section>
        <p className="mb-1 text-[11px] font-bold text-muted">アプリ設定</p>
        <PlaceholderRow label="通知設定" />
        <PlaceholderRow label="プライバシー設定" last />
      </section>

      <section>
        <p className="mb-1 text-[11px] font-bold text-muted">その他</p>
        <PlaceholderRow label="ヘルプ" last />
      </section>

      <form action={logout}>
        <button type="submit" className="py-3 text-[12px] font-bold text-brand">
          ログアウト
        </button>
      </form>
    </div>
  );
}

function MenuRow({ href, label, last }: { href: string; label: string; last?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center py-3 ${last ? "" : "border-b border-border"}`}
    >
      <span className="flex-1 text-[12px] text-foreground">{label}</span>
      <span className="text-[14px] text-muted-3">›</span>
    </Link>
  );
}

function PlaceholderRow({ label, last }: { label: string; last?: boolean }) {
  return (
    <div className={`flex items-center py-3 ${last ? "" : "border-b border-border"}`}>
      <span className="flex-1 text-[12px] text-muted-2">{label}</span>
      <span className="rounded-full bg-input px-2 py-0.5 text-[9px] text-muted">準備中</span>
    </div>
  );
}
