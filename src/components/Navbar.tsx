"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const HIDDEN_PREFIXES = ["/login", "/signup", "/auth"];

const NAV_ITEMS_USER = [
  { href: "/records", label: "一覧", icon: "📋" },
  { href: "/stats", label: "グラフ", icon: "📊" },
  { href: "/records/new", label: "登録", icon: "➕" },
  { href: "/profile", label: "プロフィール", icon: "👤" },
];

// ゲスト(未ログイン)は閲覧系のページのみ。書き込み系タブの代わりにログイン導線を出す。
const NAV_ITEMS_GUEST = [
  { href: "/records", label: "一覧", icon: "📋" },
  { href: "/stats", label: "グラフ", icon: "📊" },
  { href: "/login", label: "ログイン", icon: "🔑" },
];

export function Navbar({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();

  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }

  const items = isLoggedIn ? NAV_ITEMS_USER : NAV_ITEMS_GUEST;

  return (
    <>
      {/* デスクトップ用ヘッダー */}
      <header className="hidden sm:flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-3">
        <Link href="/records" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-50">
          <span className="text-xl">🎰</span>
          パチログ
        </Link>
        <div className="flex items-center gap-3">
          {!isLoggedIn && (
            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              ゲスト閲覧中
            </span>
          )}
          <nav className="flex items-center gap-1">
            {items.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} />
            ))}
          </nav>
        </div>
      </header>

      {/* モバイル用ボトムナビ */}
      <nav
        className="fixed inset-x-0 bottom-0 z-20 flex border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur sm:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${
                active
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function NavLink({
  item,
  pathname,
}: {
  item: { href: string; label: string; icon: string };
  pathname: string;
}) {
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
          : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      }`}
    >
      {item.label}
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/records") return pathname === "/records";
  return pathname === href || pathname.startsWith(`${href}/`);
}
