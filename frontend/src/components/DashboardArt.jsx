// Line illustration for the dashboard banner (no image files needed)
export default function DashboardArt() {
  const days = [];
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      days.push([248 + col * 22, 128 + row * 22, row === 1 && col === 2]);
    }
  }

  return (
    <svg
      className="dash-art"
      viewBox="0 0 440 320"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="rgba(255,255,255,0.14)" strokeWidth="1">
        <circle cx="300" cy="160" r="140" />
        <circle cx="300" cy="160" r="104" />
        <circle cx="300" cy="160" r="68" />
      </g>

      {/* Calendar card */}
      <g>
        <rect
          x="226"
          y="70"
          width="150"
          height="170"
          rx="14"
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.4"
        />
        <path d="M226 106h150" stroke="rgba(255,255,255,0.35)" />
        <path
          d="M262 58v24M340 58v24"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <text
          x="244"
          y="96"
          fill="rgba(255,255,255,0.85)"
          fontSize="12"
          fontFamily="Inter, sans-serif"
          letterSpacing="1.5"
        >
          THIS WEEK
        </text>
        {days.map(([x, y, active]) => (
          <circle
            key={`${x}-${y}`}
            cx={x + 4}
            cy={y + 4}
            r={active ? 9 : 3}
            fill={active ? '#fff' : 'rgba(255,255,255,0.4)'}
          />
        ))}
        <path
          d="m309 188 5 5 9-10"
          stroke="#111"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Plus badge */}
      <g>
        <circle cx="120" cy="92" r="34" fill="#fff" />
        <path
          d="M120 76v32M104 92h32"
          stroke="#111"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>

      {/* Heartbeat line */}
      <path
        className="dash-pulse"
        pathLength="1"
        d="M0 262h132l16-44 22 84 20-70 12 30h238"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
