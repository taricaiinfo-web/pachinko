import { notFound, redirect } from "next/navigation";
import Link from "next/link";
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
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-4">
      <div className="flex items-center">
        <Link href={`/records/${id}`} className="flex h-8 w-8 items-center justify-center" aria-label="戻る">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </Link>
        <h1 className="flex-1 -ml-8 text-center text-[16px] font-bold text-foreground">データ編集</h1>
      </div>
      <RecordForm action={boundUpdate} defaultValues={record} submitLabel="更新する" />
    </div>
  );
}
