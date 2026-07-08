import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GUEST_COOKIE_NAME } from "@/lib/constants";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/records");

  const cookieStore = await cookies();
  if (cookieStore.get(GUEST_COOKIE_NAME)?.value === "1") redirect("/records");

  redirect("/login");
}
