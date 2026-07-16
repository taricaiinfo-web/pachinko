export function BrandLogo({ size = 72 }: { size?: number }) {
  const height = (size * 60) / 72;
  return (
    <svg width={size} height={height} viewBox="0 0 72 60" fill="none">
      <rect x="6" y="34" width="12" height="20" rx="2" fill="var(--color-brand)" />
      <rect x="24" y="24" width="12" height="30" rx="2" fill="var(--color-brand)" />
      <rect x="42" y="14" width="12" height="40" rx="2" fill="var(--color-brand)" />
      <path
        d="M10 30L26 20L40 26L64 6"
        stroke="var(--color-brand)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M55 6h9v9" stroke="var(--color-brand)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
