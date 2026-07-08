import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RecordForm } from "@/components/RecordForm";
import { updateRecord } from "@/app/records/actions";

export const metadata = { title: "データ編集 | パチログ" };

export default async function EditRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: record } = await supabase
    .from("records")
    .select("*")
    .eq("id", id)
    .single();

  if (!record) notFound();
  if (record.user_id !== user.id) redirect(`/records/${id}`);

  const boundUpdate = updateRecord.bind(null, id);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">データ編集</h1>
      </div>
      <RecordForm action={boundUpdate} defaultValues={record} submitLabel="更新する" />
    </div>
  );
}
