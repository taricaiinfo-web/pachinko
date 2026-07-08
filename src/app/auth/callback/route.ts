import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// メール確認リンク・マジックリンクのコールバック。
// Supabase Auth の "Confirm email" / "Magic Link" 設定でこの URL を使う。
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/records";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
