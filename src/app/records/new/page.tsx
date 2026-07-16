import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RecordForm } from "@/components/RecordForm";
import { createRecord } from "@/app/records/actions";

export const metadata = { title: "データ登録 | パチログ" };

export default async function NewRecordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-4">
      <div className="flex items-center">
        <Link href="/records" className="flex h-8 w-8 items-center justify-center" aria-label="戻る">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </Link>
        <h1 className="flex-1 -ml-8 text-center text-[16px] font-bold text-foreground">データ登録</h1>
      </div>
      <RecordForm action={createRecord} submitLabel="登録する" />
    </div>
  );
}
