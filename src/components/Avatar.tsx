export function Avatar({
  url,
  emoji,
  size = 40,
  className = "",
}: {
  url?: string | null;
  emoji?: string | null;
  size?: number;
  className?: string;
}) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- 動的なユーザー画像のため next/image の remotePatterns 設定を避けている
      <img
        src={url}
        alt=""
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={`inline-flex flex-none items-center justify-center rounded-full bg-input ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.55 }}
    >
      {emoji ?? "🎰"}
    </span>
  );
}
