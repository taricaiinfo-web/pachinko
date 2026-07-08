import { redirect } from "next/navigation";
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
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">データ登録</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          今日の実働結果を記録しましょう。
        </p>
      </div>
      <RecordForm action={createRecord} submitLabel="登録する" />
    </div>
  );
}
