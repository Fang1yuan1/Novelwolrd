export default function LaurelIcon({
  flip = false,
  className = "h-9 w-7",
}: {
  flip?: boolean;
  className?: string;
}) {
  // فروع غار مركّبة من أوراق بيضاوية متدرّجة الحجم على منحنى — SVG متجه (بدون صورة)
  const leaves = [
    { x: 15, y: 3, r: -70, s: 0.5 },
    { x: 11, y: 9, r: -55, s: 0.62 },
    { x: 7, y: 16, r: -38, s: 0.74 },
    { x: 4, y: 24, r: -20, s: 0.86 },
    { x: 2, y: 32, r: 0, s: 1 },
  ];

  return (
    <svg
      viewBox="0 0 24 40"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden
    >
      <defs>
        <linearGradient id="laurelGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbf1d8" />
          <stop offset="55%" stopColor="#dcbb7c" />
          <stop offset="100%" stopColor="#b8934f" />
        </linearGradient>
      </defs>
      <path
        d="M16 2 C8 10 3 20 2 34"
        fill="none"
        stroke="url(#laurelGold)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {leaves.map((l, i) => (
        <ellipse
          key={i}
          cx={l.x}
          cy={l.y}
          rx={5.4 * l.s}
          ry={2.4 * l.s}
          transform={`rotate(${l.r} ${l.x} ${l.y})`}
          fill="url(#laurelGold)"
        />
      ))}
    </svg>
  );
}
