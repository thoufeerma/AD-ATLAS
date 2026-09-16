/**
 * A stat-tile adornment, not a standalone chart: it shows shape only. The value
 * itself is the hero number beside it, so nothing here is reachable by hover
 * alone. 2px stroke, no axes, no grid.
 */
export default function Sparkline({
  data,
  color,
  label,
  width = 150,
  height = 40,
}: {
  data: number[];
  color: string;
  label: string;
  width?: number;
  height?: number;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const pad = 3;

  const x = (i: number) => (i / (data.length - 1)) * width;
  const y = (v: number) => pad + (1 - (v - min) / span) * (height - pad * 2);

  const line = data.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(v)}`).join(" ");
  const fill = `${line} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={label}
      className="overflow-visible"
    >
      <title>{label}</title>
      <path d={fill} fill={color} fillOpacity="0.12" />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
