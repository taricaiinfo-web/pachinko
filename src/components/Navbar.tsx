"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const HIDDEN_PREFIXES = ["/login", "/signup", "/auth"];

const NAV_ITEMS = [
  { href: "/records", label: "一覧", icon: "📋" },
  { href: "/stats", label: "グラフ", icon: "📊" },
  { href: "/records/new", label: "登録", icon: "➕" },
  { href: "/profile", label: "プロフィール", icon: "👤" },
];

export function Navbar() {
  const pathname = usePathname();

  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }

  return (
    <>
      {/* デスクトップ用ヘッダー */}
      <header className="hidden sm:flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-3">
        <Link href="/records" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-50">
          <span className="text-xl">🎰</span>
          パチログ
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>
      </header>

      {/* モバイル用ボトムナビ */}
      <nav
        className="fixed inset-x-0 bottom-0 z-20 flex border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur sm:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {NAV_ITEMS.map((item) => {
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
