import {
  DIAGNOSTICO_POR_FATOR,
  FATORES,
  PONTUACAO_MAXIMA_FATOR,
  PONTUACAO_MAXIMA_TOTAL,
  type Escala,
} from "@/data/diagnostico";

export type Respostas = Record<string, Escala>;

export type ResultadoFator = {
  id: string;
  nome: string;
  zona: string;
  pontos: number;
  maximo: number;
  ratio: number;
  respondidas: number;
  total: number;
};

export function pontuacaoFator(respostas: Respostas, fatorId: string): ResultadoFator {
  const fator = FATORES.find((f) => f.id === fatorId)!;
  let pontos = 0;
  let respondidas = 0;
  for (const p of fator.perguntas) {
    const v = respostas[p.id];
    if (v !== undefined) {
      pontos += v;
      respondidas += 1;
    }
  }
  return {
    id: fator.id,
    nome: fator.nome,
    zona: fator.zona,
    pontos,
    maximo: PONTUACAO_MAXIMA_FATOR,
    ratio: pontos / PONTUACAO_MAXIMA_FATOR,
    respondidas,
    total: fator.perguntas.length,
  };
}

export function resultadoCompleto(respostas: Respostas) {
  const fatores = FATORES.map((f) => pontuacaoFator(respostas, f.id));
  const total = fatores.reduce((acc, f) => acc + f.pontos, 0);
  const maisFraco = [...fatores].sort((a, b) => a.pontos - b.pontos)[0]!;
  return {
    fatores,
    total,
    maximo: PONTUACAO_MAXIMA_TOTAL,
    percentual: Math.round((total / PONTUACAO_MAXIMA_TOTAL) * 100),
    maisFraco,
    diagnosticoMaisFraco: DIAGNOSTICO_POR_FATOR[maisFraco.id] ?? "",
    nivel: nivelDeMaturidade(total),
  };
}

export function nivelDeMaturidade(total: number) {
  const pct = (total / PONTUACAO_MAXIMA_TOTAL) * 100;
  if (pct >= 85) return { label: "Maturidade avançada", tom: "alto" as const };
  if (pct >= 65) return { label: "Maturidade intermediária", tom: "medio" as const };
  if (pct >= 40) return { label: "Exposição relevante", tom: "baixo" as const };
  return { label: "Exposição crítica", tom: "critico" as const };
}

export function corDoRatio(ratio: number) {
  if (ratio >= 0.75) return "var(--brand-emerald)";
  if (ratio >= 0.45) return "var(--brand-sand)";
  return "var(--brand-alert)";
}
