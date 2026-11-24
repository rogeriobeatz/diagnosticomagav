import {
  DIAGNOSTICO_POR_FATOR,
  FATORES,
  PONTUACAO_MAXIMA_FATOR,
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
  let naoSei = 0;
  for (const p of fator.perguntas) {
    const v = respostas[p.id];
    if (v !== undefined) {
      if (v < 0) naoSei += 1;
      else pontos += v;
      respondidas += 1;
    }
  }
  return {
    id: fator.id,
    nome: fator.nome,
    zona: fator.zona,
    pontos,
    // "Não sei / Não se aplica" sai da conta: cada uma reduz o máximo em 2.
    maximo: PONTUACAO_MAXIMA_FATOR - naoSei * 2,
    ratio: PONTUACAO_MAXIMA_FATOR - naoSei * 2 > 0 ? pontos / (PONTUACAO_MAXIMA_FATOR - naoSei * 2) : 0,
    respondidas,
    total: fator.perguntas.length,
  };
}

export function resultadoCompleto(respostas: Respostas) {
  const fatores = FATORES.map((f) => pontuacaoFator(respostas, f.id));
  const total = fatores.reduce((acc, f) => acc + f.pontos, 0);
  const maximo = fatores.reduce((acc, f) => acc + f.maximo, 0);
  const avaliados = fatores.filter((f) => f.maximo > 0);
  const maisFraco = [...(avaliados.length ? avaliados : fatores)].sort((a, b) => a.ratio - b.ratio)[0]!;
  const percentual = maximo > 0 ? Math.round((total / maximo) * 100) : 0;
  return {
    fatores,
    total,
    maximo,
    percentual,
    maisFraco,
    diagnosticoMaisFraco: DIAGNOSTICO_POR_FATOR[maisFraco.id] ?? "",
    nivel: nivelDeMaturidade(percentual),
  };
}

export function nivelDeMaturidade(pct: number) {
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
