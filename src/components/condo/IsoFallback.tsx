import type { ZoneMap } from "./CondoScene";

function tone(ratio: number, answered: number) {
  if (answered === 0) return "#3a4a46";
  if (ratio >= 0.7) return "#2f9e8a";
  if (ratio >= 0.4) return "#d3a06a";
  return "#c96a52";
}

export default function IsoFallback({ zones, active }: { zones: ZoneMap; active: string }) {
  const z = (id: string) => zones[id] ?? { ratio: 0, answered: 0, total: 8, active: false };
  const glow = (id: string) => (active === id ? 1 : 0.55);

  return (
    <svg viewBox="0 0 400 320" className="h-full w-full" role="img" aria-label="Maquete do condomínio">
      <rect width="400" height="320" fill="#0b1614" />
      <ellipse cx="200" cy="200" rx="170" ry="90" fill="#13221f" />

      {/* entorno */}
      {[40, 90, 310, 360].map((x, i) => (
        <g key={i} opacity={glow("F6")}>
          <rect x={x - 14} y={150 + (i % 2) * 24} width="28" height="34" fill="#1a2a27" />
          <circle cx={x} cy={144 + (i % 2) * 24} r="5" fill={tone(z("F6").ratio, z("F6").answered)} />
        </g>
      ))}

      {/* muro */}
      <g opacity={glow("F1")}>
        <polygon
          points="200,110 330,180 200,250 70,180"
          fill="none"
          stroke={tone(z("F1").ratio, z("F1").answered)}
          strokeWidth={3 + z("F1").ratio * 4}
        />
      </g>

      {/* torres */}
      <g>
        <polygon points="170,120 210,143 210,185 170,162" fill="#22403a" />
        <polygon points="210,143 250,120 250,162 210,185" fill="#1b332e" />
        <polygon points="170,120 210,97 250,120 210,143" fill="#2a4d45" />
      </g>

      {/* portaria */}
      <g opacity={glow("F3")}>
        <rect x="188" y="228" width="26" height="16" fill="#1f3a34" />
        <rect x="190" y="231" width="22" height="6" fill={tone(z("F3").ratio, z("F3").answered)} />
      </g>

      {/* câmeras */}
      {[
        [70, 180],
        [330, 180],
        [200, 110],
        [200, 250],
      ].map(([x, y], i) => (
        <g key={i} opacity={glow("F2")}>
          <line x1={x} y1={y} x2={x} y2={(y as number) - 22} stroke="#4d5f5a" strokeWidth="3" />
          <circle cx={x} cy={(y as number) - 24} r="5" fill={tone(z("F2").ratio, z("F2").answered)} />
        </g>
      ))}

      {/* equipe */}
      {Array.from({ length: Math.max(1, Math.round(z("F4").ratio * 4)) }).map((_, i) => (
        <circle key={i} cx={226 + i * 12} cy={238} r="4.5" fill={tone(z("F4").ratio, z("F4").answered)} opacity={glow("F4")} />
      ))}

      {/* moradores */}
      {Array.from({ length: Math.max(2, Math.round(z("F5").ratio * 6)) }).map((_, i) => (
        <circle
          key={i}
          cx={150 + i * 16}
          cy={205 + (i % 2) * 10}
          r="4"
          fill={tone(z("F5").ratio, z("F5").answered)}
          opacity={glow("F5")}
        />
      ))}
    </svg>
  );
}
