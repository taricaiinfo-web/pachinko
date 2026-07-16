import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-geist-sans",
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "パチログ | パチンコ実働データ管理",
  description: "パチンコ・パチスロの実働データを記録し、週・月・年単位の収支をグラフで管理できるアプリ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let unreadCount = 0;
  if (user) {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .eq("is_read", false);
    unreadCount = count ?? 0;
  }

  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar unreadCount={unreadCount} />
        <main className="flex flex-1 flex-col pb-16 sm:pb-0">{children}</main>
      </body>
    </html>
  );
}
