import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/types";

/**
 * サーバーコンポーネント / Server Action / Route Handler から使う
 * Supabase クライアント。Cookie 経由でセッションを読み書きする。
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component から呼ばれた場合は Cookie を書き込めないが、
            // middleware でセッションを更新しているため無視してよい。
          }
        },
      },
    },
  );
}
