"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";

const HIDDEN_PREFIXES = ["/login", "/signup", "/auth"];

const NAV_ITEMS = [
  { href: "/records", label: "ホーム", icon: "home" },
  { href: "/search", label: "検索", icon: "search" },
  { href: "/records/new", label: "登録", icon: "register" },
  { href: "/stats", label: "データ", icon: "data" },
  { href: "/profile", label: "マイページ", icon: "mypage" },
] as const;

type IconKey = (typeof NAV_ITEMS)[number]["icon"];

export function Navbar({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();

  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }

  return (
    <>
      {/* デスクトップ用ヘッダー */}
      <header className="hidden sm:flex items-center justify-between border-b border-border px-6 py-3">
        <Link href="/records" className="flex items-center gap-2 font-bold text-foreground">
          <BrandLogo size={22} />
          パチログ
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
          <NotificationBell unreadCount={unreadCount} pathname={pathname} />
        </nav>
      </header>

      {/* モバイル用トップバー(ベル通知) */}
      <header className="flex sm:hidden items-center justify-between px-4 py-3">
        <Link href="/records" className="flex items-center gap-2 font-bold text-foreground">
          <BrandLogo size={22} />
          パチログ
        </Link>
        <NotificationBell unreadCount={unreadCount} pathname={pathname} />
      </header>

      {/* モバイル用ボトムナビ */}
      <nav
        className="fixed inset-x-0 bottom-0 z-20 flex items-end justify-around border-t border-border bg-surface/95 backdrop-blur px-1 pb-2.5 pt-2 sm:hidden"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 10px)" }}
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);

          if (item.icon === "register") {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex w-12 flex-col items-center gap-0.5 text-[9px] text-muted-2"
              >
                <span className="-mt-6 flex h-10 w-10 items-center justify-center rounded-full bg-brand shadow-[0_3px_8px_rgba(232,56,44,0.35)]">
                  <TabIcon icon="register" color="#fff" size={22} strokeWidth={2.4} />
                </span>
                登録
              </Link>
            );
          }

          const color = active ? "var(--color-brand)" : "var(--color-muted-2)";
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex w-11 flex-col items-center gap-0.5 text-[9px]"
              style={{ color }}
              aria-current={active ? "page" : undefined}
            >
              <TabIcon icon={item.icon} color={color} size={21} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function TabIcon({
  icon,
  color,
  size,
  strokeWidth,
}: {
  icon: IconKey;
  color: string;
  size: number;
  strokeWidth?: number;
}) {
  switch (icon) {
    case "home":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth ?? 1.8} strokeLinejoin="round" strokeLinecap="round">
          <path d="M4 10.5L12 4l8 6.5" />
          <path d="M6 9.5V19h4v-5h4v5h4V9.5" />
        </svg>
      );
    case "search":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth ?? 1.8} strokeLinecap="round">
          <circle cx="10.5" cy="10.5" r="6" />
          <path d="M15 15l4.5 4.5" />
        </svg>
      );
    case "register":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth ?? 2.4} strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "data":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth ?? 1.9} strokeLinecap="round">
          <path d="M5 19v-6M10 19V6M15 19v-9M20 19v-4" />
        </svg>
      );
    case "mypage":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth ?? 1.8} strokeLinecap="round">
          <circle cx="12" cy="8" r="3.6" />
          <path d="M5.5 19.5c0-3.6 2.9-6.2 6.5-6.2s6.5 2.6 6.5 6.2" />
        </svg>
      );
  }
}

function NavLink({
  item,
  pathname,
}: {
  item: { href: string; label: string; icon: IconKey };
  pathname: string;
}) {
  const active = isActive(pathname, item.href);
  const color = active ? "var(--color-brand)" : "var(--color-muted)";
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-brand/10" : "hover:bg-black/5 dark:hover:bg-white/5"
      }`}
      style={{ color }}
    >
      <TabIcon icon={item.icon} color={color} size={16} />
      {item.label}
    </Link>
  );
}

function NotificationBell({ unreadCount, pathname }: { unreadCount: number; pathname: string }) {
  const active = isActive(pathname, "/notifications");
  return (
    <Link
      href="/notifications"
      aria-current={active ? "page" : undefined}
      className={`relative flex h-9 w-9 items-center justify-center rounded-full ${
        active ? "bg-brand/10" : "hover:bg-black/5 dark:hover:bg-white/5"
      }`}
    >
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--color-brand)" : "#333"} strokeWidth="1.8">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 01-3.4 0" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/records") return pathname === "/records";
  return pathname === href || pathname.startsWith(`${href}/`);
}
