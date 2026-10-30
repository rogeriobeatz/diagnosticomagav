import type { ResultadoFator } from "@/lib/diagnostico";

const ROTULOS = ["Estrutura", "Tecnologia", "Procedimentos", "Equipe", "Moradores", "Entorno"];

export default function ResultadoRadar({ fatores }: { fatores: ResultadoFator[] }) {
  const ponto = (indice: number, raio: number) => {
    const angulo = -Math.PI / 2 + (indice * Math.PI * 2) / fatores.length;
    return { x: 200 + Math.cos(angulo) * raio, y: 170 + Math.sin(angulo) * raio };
  };
  const poligono = (raio: number) => fatores.map((_, i) => {
    const p = ponto(i, raio);
    return `${p.x},${p.y}`;
  }).join(" ");
  const valores = fatores.map((f, i) => {
    const p = ponto(i, 112 * f.ratio);
    return `${p.x},${p.y}`;
  }).join(" ");

  return (
    <figure className="w-full min-w-0">
      <svg viewBox="0 0 400 340" role="img" aria-label={`Pontuação por fator: ${fatores.map(f => `${f.nome}: ${f.pontos} de ${f.maximo}`).join(", ")}`} className="mx-auto w-full max-w-md">
        {[28, 56, 84, 112].map(raio => <polygon key={raio} points={poligono(raio)} className="fill-none stroke-border" />)}
        {fatores.map((f, i) => {
          const p = ponto(i, 112);
          return <line key={f.id} x1="200" y1="170" x2={p.x} y2={p.y} className="stroke-border" />;
        })}
        <polygon points={valores} className="fill-primary/20 stroke-primary" strokeWidth="2.5" />
        {[4, 8, 12, 16].map((valor, i) => <text key={valor} x="206" y={170 - (i + 1) * 28} className="fill-muted-foreground text-[9px]">{valor}</text>)}
        {fatores.map((f, i) => {
          const p = ponto(i, 112 * f.ratio);
          const label = ponto(i, 142);
          return <g key={f.id}>
            <circle cx={p.x} cy={p.y} r="4" className="fill-primary stroke-background" strokeWidth="2" />
            <text x={label.x} y={label.y} textAnchor="middle" className="fill-foreground text-[12px]">
              <tspan x={label.x}>{ROTULOS[i] ?? f.id}</tspan>
              <tspan x={label.x} dy="17" className="fill-brand-sage text-[11px]">{f.pontos}/{f.maximo}</tspan>
            </text>
          </g>;
        })}
      </svg>
      <figcaption className="text-center text-xs text-muted-foreground">Pontuação por fator · escala de 0 a 16</figcaption>
    </figure>
  );
}