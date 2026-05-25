// Animated SVG circuit track map with moving car dot and sector highlights

type TrackMapProps = {
  lapProgress: number; // 0–1
  sector: 1 | 2 | 3;
};

// F1-style generic circuit path points (closed loop, normalized 0-1 coord space on 200x120 canvas)
const TRACK_PATH = `
  M 100,10
  C 150,10 185,20 190,40
  C 195,60 185,70 170,75
  C 155,80 145,75 140,65
  C 135,55 138,45 130,40
  C 120,35 105,38 95,45
  C 80,55 75,70 65,75
  C 50,82 30,78 20,65
  C 10,52 12,35 25,25
  C 40,15 70,8 100,10
  Z
`;

// Approximate point on the path at progress t (0-1) using a simple parametric approach
// We'll use a list of key waypoints and interpolate between them
const WAYPOINTS: [number, number][] = [
  [100, 10],  // Start/Finish
  [140, 12],  // S1 start
  [178, 24],  // T1
  [190, 45],  // T2
  [175, 72],  // T3 - S2 start
  [148, 79],  // T4
  [135, 58],  // T5
  [115, 41],  // T6
  [90, 46],   // T7
  [72, 62],   // T8 - S3 start
  [55, 78],   // T9
  [24, 70],   // T10
  [12, 48],   // T11
  [18, 28],   // T12
  [42, 14],   // T13
  [100, 10],  // Back to start
];

// S1: 0-0.33, S2: 0.33-0.66, S3: 0.66-1.0
const S1_PATH = `M 100,10 C 150,10 185,20 190,40 C 193,55 188,63 175,72`;
const S2_PATH = `M 175,72 C 155,80 143,74 138,60 C 130,45 118,40 95,46 C 80,53 76,68 65,75`;
const S3_PATH = `M 65,75 C 50,82 28,78 18,64 C 8,50 12,34 26,24 C 42,13 70,8 100,10`;

function lerp2(a: [number, number], b: [number, number], t: number): [number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function getCarPos(progress: number): [number, number] {
  const total = WAYPOINTS.length - 1;
  const idx = Math.min(total - 1, Math.floor(progress * total));
  const frac = (progress * total) % 1;
  return lerp2(WAYPOINTS[idx], WAYPOINTS[idx + 1] ?? WAYPOINTS[0], frac);
}

export default function TrackMap({ lapProgress, sector }: TrackMapProps) {
  const [cx, cy] = getCarPos(lapProgress);

  return (
    <div className="relative w-full" style={{ aspectRatio: '200/120' }}>
      <svg
        viewBox="0 0 200 120"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Track background shadow */}
        <path d={TRACK_PATH} fill="none" stroke="#1e293b" strokeWidth="14" strokeLinejoin="round" />

        {/* Base track */}
        <path d={TRACK_PATH} fill="none" stroke="#334155" strokeWidth="10" strokeLinejoin="round" />

        {/* Sector highlights */}
        <path d={S1_PATH} fill="none"
          stroke={sector === 1 ? '#ef4444' : '#475569'}
          strokeWidth={sector === 1 ? 10 : 8}
          strokeLinecap="round" opacity={sector === 1 ? 1 : 0.4}
        />
        <path d={S2_PATH} fill="none"
          stroke={sector === 2 ? '#3b82f6' : '#475569'}
          strokeWidth={sector === 2 ? 10 : 8}
          strokeLinecap="round" opacity={sector === 2 ? 1 : 0.4}
        />
        <path d={S3_PATH} fill="none"
          stroke={sector === 3 ? '#10b981' : '#475569'}
          strokeWidth={sector === 3 ? 10 : 8}
          strokeLinecap="round" opacity={sector === 3 ? 1 : 0.4}
        />

        {/* Pit lane marker */}
        <rect x="87" y="6" width="26" height="5" rx="2" fill="#f59e0b" opacity="0.8" />
        <text x="100" y="5.5" textAnchor="middle" fontSize="3.5" fill="#fbbf24" fontFamily="monospace">PIT</text>

        {/* Sector labels */}
        <text x="168" y="38" fontSize="5" fill="#ef4444" fontFamily="monospace" opacity="0.9">S1</text>
        <text x="118" y="58" fontSize="5" fill="#3b82f6" fontFamily="monospace" opacity="0.9">S2</text>
        <text x="28" y="52" fontSize="5" fill="#10b981" fontFamily="monospace" opacity="0.9">S3</text>

        {/* Start/Finish line */}
        <line x1="100" y1="5" x2="100" y2="17" stroke="white" strokeWidth="1.5" opacity="0.8" />
        <text x="110" y="9" fontSize="4" fill="#94a3b8" fontFamily="monospace">S/F</text>

        {/* Car dot glow */}
        <circle cx={cx} cy={cy} r="7" fill="#ef4444" opacity="0.15" />
        <circle cx={cx} cy={cy} r="4.5" fill="#ef4444" opacity="0.3" />
        {/* Car dot */}
        <circle cx={cx} cy={cy} r="3" fill="#ef4444" />
        <circle cx={cx} cy={cy} r="1.5" fill="#fff" />
      </svg>
    </div>
  );
}
