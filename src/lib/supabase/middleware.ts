import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { GUEST_COOKIE_NAME } from "@/lib/constants";

// "/" は page.tsx 側でログイン状態に応じたリダイレクトを行うため、常に通過させる。
const PUBLIC_PATHS = ["/", "/login", "/signup", "/auth/callback"];

// ゲスト(未ログイン)でも閲覧だけは許可するパス。
// - "/records" 一覧, "/records/<id>" 詳細(ただし "/records/new" は除く)
// - "/stats" グラフ
// - "/profile/<id>" 他ユーザーのプロフィール閲覧(自分の "/profile" 編集画面は除く)
const RECORD_DETAIL_RE = /^\/records\/(?!new$)[^/]+$/;
const OTHER_PROFILE_RE = /^\/profile\/[^/]+$/;

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/public")
  );
}

function isGuestAllowedPath(pathname: string) {
  return (
    pathname === "/records" ||
    pathname === "/stats" ||
    RECORD_DETAIL_RE.test(pathname) ||
    OTHER_PROFILE_RE.test(pathname)
  );
}

/**
 * middleware.ts から呼び出す。Supabase セッションの Cookie をリフレッシュしつつ、
 * 未ログインユーザーを /login へリダイレクトする。
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isGuest = request.cookies.get(GUEST_COOKIE_NAME)?.value === "1";

  if (!user && !isPublicPath(pathname)) {
    if (isGuest && isGuestAllowedPath(pathname)) {
      return supabaseResponse;
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/records";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
