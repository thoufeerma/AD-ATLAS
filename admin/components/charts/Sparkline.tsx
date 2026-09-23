/**
 * A stat-tile adornment, not a standalone chart: it shows shape only. The value
 * itself is the hero number beside it, so nothing here is reachable by hover
 * alone. 2px stroke, no axes, no grid.
 *
 * It fills whatever width the tile gives it — the drawing is a viewBox scaled
 * by CSS, never a fixed pixel size, so it can't spill past the card's edge on
 * a narrow column. The stroke stays 2px through that scaling.
 */
export default function Sparkline({
  data,
  color,
  label,
  height = 44,
}: {
  data: number[];
  color: string;
  label: string;
  /** Rendered height in pixels; the width follows the container. */
  height?: number;
}) {
  // The drawing's own coordinates. Width is arbitrary: CSS stretches it.
  const width = 260;
  const pad = 3;
  const points = data.length > 1 ? data : [data[0] ?? 0, data[0] ?? 0];

  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min;

  // Ends sit a stroke's width inside the box, so the round caps aren't clipped.
  const x = (i: number) => 1 + (i / (points.length - 1)) * (width - 2);
  // Nothing to compare (a new store's zeroes, or one flat week) draws down the
  // middle rather than along the bottom, where it would read as an underline.
  const y = (v: number) => (span === 0 ? height / 2 : pad + (1 - (v - min) / span) * (height - pad * 2));

  const line = points.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(v)}`).join(" ");
  const fill = `${line} L ${x(points.length - 1)} ${height} L ${x(0)} ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      height={height}
      role="img"
      aria-label={label}
      className="block w-full"
      style={{ height }}
    >
      <title>{label}</title>
      <path d={fill} fill={color} fillOpacity="0.12" vectorEffect="non-scaling-stroke" />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
