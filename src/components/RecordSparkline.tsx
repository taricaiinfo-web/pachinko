const WIDTH = 100;
const HEIGHT = 32;
const PADDING = 3;

export function RecordSparkline({ diff }: { diff: number }) {
  const top = PADDING;
  const bottom = HEIGHT - PADDING;

  let points: string;
  let className: string;

  if (diff > 0) {
    points = `0,${bottom} ${WIDTH},${top}`;
    className = "spark-pos";
  } else if (diff < 0) {
    points = `0,${top} ${WIDTH},${bottom}`;
    className = "spark-neg";
  } else {
    const mid = HEIGHT / 2;
    points = `0,${mid} ${WIDTH},${mid}`;
    className = "spark-flat";
  }

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      className="h-8 w-full"
      aria-hidden="true"
    >
      <polyline
        points={points}
        className={className}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
