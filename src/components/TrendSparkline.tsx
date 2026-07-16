export function TrendSparkline({
  values,
  width = 100,
  height = 40,
}: {
  values: number[];
  width?: number;
  height?: number;
}) {
  const series = values.length >= 2 ? values : [0, ...values];
  const min = Math.min(...series, 0);
  const max = Math.max(...series, 0);
  const range = max - min || 1;
  const step = width / (series.length - 1);
  const padding = 2;
  const points = series
    .map((v, i) => {
      const x = i * step;
      const y = padding + (1 - (v - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");
  const positive = series[series.length - 1] >= 0;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={positive ? "spark-pos" : "spark-neg"}
      />
    </svg>
  );
}
