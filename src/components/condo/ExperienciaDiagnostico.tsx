import { ClientOnly } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  MessageCircle,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";

import logo from "@/assets/magav-logo.webp.asset.json";
import { ESCALA, FATORES, TOTAL_PERGUNTAS, type Escala } from "@/data/diagnostico";
import { corDoRatio, pontuacaoFator, resultadoCompleto, type Respostas } from "@/lib/diagnostico";
import { enviarLead } from "@/lib/lead.functions";
import type { ZoneMap } from "./CondoScene";
import IsoFallback from "./IsoFallback";

const CondoScene = lazy(() => import("./CondoScene"));

const STORAGE_KEY = "magav-diagnostico-v1";
const WHATSAPP = "5511999999999";
const EMAIL = "contato@grupomagav.com.br";

type Etapa = "intro" | "quiz" | "lead" | "resultado";

const LeadForm = z.object({
  nome_condominio: z.string().trim().min(2, "Informe o nome do condomínio").max(120),
  nome_sindico: z.string().trim().min(2, "Informe o nome do síndico ou gestor").max(120),
  email_contato: z.string().trim().email("E-mail inválido").max(160),
  telefone_contato: z.string().trim().max(40).optional(),
});

function useWebGL() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      setOk(Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl")));
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

export default function ExperienciaDiagnostico() {
  const [etapa, setEtapa] = useState<Etapa>("intro");
  const [respostas, setRespostas] = useState<Respostas>({});
  const [fatorIdx, setFatorIdx] = useState(0);
  const [perguntaIdx, setPerguntaIdx] = useState(0);
  const [badge, setBadge] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [lead, setLead] = useState({ nome_condominio: "", nome_sindico: "", email_contato: "", telefone_contato: "" });
  const webgl = useWebGL();
  const enviar = useServerFn(enviarLead);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { respostas?: Respostas; fatorIdx?: number; perguntaIdx?: number };
      if (saved.respostas && Object.keys(saved.respostas).length > 0) {
        setRespostas(saved.respostas);
        setFatorIdx(saved.fatorIdx ?? 0);
        setPerguntaIdx(saved.perguntaIdx ?? 0);
      }
    } catch {
      /* ignora progresso corrompido */
    }
  }, []);

  useEffect(() => {
    if (Object.keys(respostas).length === 0) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ respostas, fatorIdx, perguntaIdx }));
  }, [respostas, fatorIdx, perguntaIdx]);

  const fator = FATORES[fatorIdx]!;
  const pergunta = fator.perguntas[perguntaIdx]!;
  const respondidas = Object.keys(respostas).length;
  const resultado = useMemo(() => resultadoCompleto(respostas), [respostas]);

  const zones: ZoneMap = useMemo(() => {
    const map: ZoneMap = {};
    for (const f of FATORES) {
      const r = pontuacaoFator(respostas, f.id);
      map[f.id] = {
        ratio: r.respondidas ? r.pontos / (r.respondidas * 2) : 0,
        answered: r.respondidas,
        total: r.total,
        active: etapa === "quiz" && f.id === fator.id,
      };
    }
    return map;
  }, [respostas, fator.id, etapa]);

  const indiceExposicao = Math.max(
    0,
    100 - Math.round((resultado.total / Math.max(1, respondidas * 2)) * 100 || 0),
  );

  const responder = useCallback(
    (valor: Escala) => {
      setRespostas((prev) => ({ ...prev, [pergunta.id]: valor }));
      const ultimaDoFator = perguntaIdx === fator.perguntas.length - 1;
      const ultimoFator = fatorIdx === FATORES.length - 1;

      if (!ultimaDoFator) {
        setPerguntaIdx((i) => i + 1);
        return;
      }
      setBadge(fator.badge);
      window.setTimeout(() => setBadge(null), 2200);
      if (ultimoFator) {
        setEtapa("lead");
      } else {
        setFatorIdx((i) => i + 1);
        setPerguntaIdx(0);
      }
    },
    [pergunta.id, perguntaIdx, fator, fatorIdx],
  );

  const voltar = () => {
    if (perguntaIdx > 0) {
      setPerguntaIdx((i) => i - 1);
    } else if (fatorIdx > 0) {
      setFatorIdx((i) => i - 1);
      setPerguntaIdx(FATORES[fatorIdx - 1]!.perguntas.length - 1);
    }
  };

  async function submeterLead(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    const parsed = LeadForm.safeParse(lead);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) map[String(issue.path[0])] = issue.message;
      setErros(map);
      return;
    }
    setErros({});
    setEnviando(true);
    try {
      await enviar({
        data: {
          ...parsed.data,
          telefone_contato: parsed.data.telefone_contato ?? "",
          data_diagnostico: new Date().toISOString().slice(0, 10),
          respostas,
          pontuacao_por_fator: resultado.fatores.map((f) => ({
            id: f.id,
            nome: f.nome,
            pontos: f.pontos,
            maximo: f.maximo,
          })),
          pontuacao_total: resultado.total,
          percentual: resultado.percentual,
          fator_mais_fraco: resultado.maisFraco.nome,
          nivel: resultado.nivel.label,
        },
      });
      setEtapa("resultado");
    } catch (err) {
      console.error(err);
      setErro("Não conseguimos registrar seu diagnóstico agora. Tente novamente em instantes.");
    } finally {
      setEnviando(false);
    }
  }

  const mensagemWhats = encodeURIComponent(
    `Olá! Concluí o Diagnóstico de Segurança Condominial do Grupo MAGAV. Condomínio: ${lead.nome_condominio || "—"}. Pontuação: ${resultado.total}/96. Gostaria de agendar a apresentação do relatório.`,
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Cena */}
      <div className="pointer-events-none absolute inset-0">
        {webgl === null ? null : webgl ? (
          <ClientOnly fallback={<IsoFallback zones={zones} active={fator.id} />}>
            <Suspense fallback={<IsoFallback zones={zones} active={fator.id} />}>
              <CondoScene zones={zones} active={etapa === "quiz" ? fator.id : "intro"} />
            </Suspense>
          </ClientOnly>
        ) : (
          <IsoFallback zones={zones} active={fator.id} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/10 to-background" />
      </div>

      {/* HUD */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-5 md:px-8">
        <header className="flex items-center justify-between gap-4">
          <img src={logo.url} alt="Grupo MAGAV" className="h-9 w-auto md:h-11" />
          {etapa === "quiz" && (
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Índice de exposição</p>
              <p
                className="text-xl font-semibold tabular-nums md:text-2xl"
                style={{ color: corDoRatio(1 - indiceExposicao / 100) }}
              >
                {indiceExposicao}%
              </p>
            </div>
          )}
        </header>

        {etapa === "intro" && (
          <section className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-brand-sage backdrop-blur">
              <Sparkles className="size-3.5" /> Diagnóstico interativo
            </p>
            <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight md:text-6xl">
              Monte o raio-x de segurança do seu condomínio
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-muted-foreground md:text-lg">
              48 perguntas, 6 zonas de risco. A cada resposta a maquete do seu condomínio reage — e você enxerga onde
              está a brecha antes que ela seja usada.
            </p>
            <button
              onClick={() => setEtapa("quiz")}
              className="mt-9 rounded-full bg-primary px-9 py-4 text-base font-semibold text-primary-foreground shadow-lg transition hover:brightness-110"
            >
              {respondidas > 0 ? "Retomar diagnóstico" : "Começar diagnóstico"}
            </button>
            {respondidas > 0 && (
              <button
                onClick={() => {
                  localStorage.removeItem(STORAGE_KEY);
                  setRespostas({});
                  setFatorIdx(0);
                  setPerguntaIdx(0);
                }}
                className="mt-3 text-xs text-muted-foreground underline underline-offset-4"
              >
                Recomeçar do zero ({respondidas} de {TOTAL_PERGUNTAS} respondidas)
              </button>
            )}
            <p className="mt-8 text-xs text-muted-foreground">Leva cerca de 6 minutos · Uso profissional para síndicos e gestores</p>
          </section>
        )}

        {etapa === "quiz" && (
          <section className="flex flex-1 flex-col justify-between gap-6 pt-6">
            {/* Zonas */}
            <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
              {FATORES.map((f, i) => {
                const r = pontuacaoFator(respostas, f.id);
                const ativo = i === fatorIdx;
                return (
                  <button
                    key={f.id}
                    disabled={r.respondidas === 0 && i > fatorIdx}
                    onClick={() => {
                      setFatorIdx(i);
                      setPerguntaIdx(0);
                    }}
                    className={`rounded-xl border p-2.5 text-left backdrop-blur transition disabled:opacity-40 ${
                      ativo ? "border-primary bg-card/90" : "border-border bg-card/50 hover:bg-card/70"
                    }`}
                  >
                    <p className="truncate text-[11px] font-medium">{f.zona}</p>
                    <div className="mt-2 h-1.5 rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(r.pontos / r.maximo) * 100}%`,
                          backgroundColor: corDoRatio(r.respondidas ? r.pontos / (r.respondidas * 2) : 0),
                        }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] tabular-nums text-muted-foreground">
                      {r.pontos}/{r.maximo}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Pergunta */}
            <div className="rounded-2xl border border-border bg-card/85 p-5 shadow-2xl backdrop-blur-md md:p-7">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-brand-sage">
                  {fator.zona} · {pergunta.curto}
                </p>
                <p className="text-[11px] tabular-nums text-muted-foreground">
                  {respondidas} / {TOTAL_PERGUNTAS}
                </p>
              </div>
              <h2 className="mt-3 text-pretty text-lg font-medium leading-snug md:text-2xl">{pergunta.texto}</h2>

              <div className="mt-6 grid gap-2.5 md:grid-cols-3">
                {ESCALA.map((op) => {
                  const selecionada = respostas[pergunta.id] === op.valor;
                  const cor = op.valor === 2 ? "var(--brand-emerald)" : op.valor === 1 ? "var(--brand-sand)" : "var(--brand-alert)";
                  return (
                    <button
                      key={op.valor}
                      onClick={() => responder(op.valor)}
                      className={`group rounded-xl border p-4 text-left transition hover:-translate-y-0.5 ${
                        selecionada ? "border-transparent" : "border-border bg-secondary/40 hover:bg-secondary/70"
                      }`}
                      style={selecionada ? { backgroundColor: cor, color: "var(--brand-deep)" } : undefined}
                    >
                      <span className="block text-sm font-semibold" style={!selecionada ? { color: cor } : undefined}>
                        {op.curto}
                      </span>
                      <span className="mt-1 block text-xs opacity-80">{op.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={voltar}
                  disabled={fatorIdx === 0 && perguntaIdx === 0}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground disabled:opacity-30"
                >
                  <ArrowLeft className="size-3.5" /> Voltar
                </button>
                <div className="h-1 w-40 rounded-full bg-secondary md:w-72">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${(respondidas / TOTAL_PERGUNTAS) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {etapa === "lead" && (
          <section className="flex flex-1 items-center justify-center py-8">
            <form
              onSubmit={submeterLead}
              className="w-full max-w-lg rounded-2xl border border-border bg-card/90 p-6 shadow-2xl backdrop-blur-md md:p-8"
            >
              <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-brand-sage">
                <ShieldCheck className="size-4" /> Diagnóstico concluído
              </p>
              <h2 className="mt-2 text-2xl font-semibold md:text-3xl">Desbloqueie o seu resultado</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Precisamos apenas identificar o condomínio para liberar o placar e preparar o relatório completo.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  { id: "nome_condominio", label: "Nome do condomínio", type: "text" },
                  { id: "nome_sindico", label: "Nome do síndico / gestor", type: "text" },
                  { id: "email_contato", label: "E-mail para contato", type: "email" },
                  { id: "telefone_contato", label: "Telefone (opcional)", type: "tel" },
                ].map((campo) => (
                  <div key={campo.id}>
                    <label htmlFor={campo.id} className="mb-1 block text-xs text-muted-foreground">
                      {campo.label}
                    </label>
                    <input
                      id={campo.id}
                      type={campo.type}
                      maxLength={160}
                      value={lead[campo.id as keyof typeof lead]}
                      onChange={(e) => setLead((p) => ({ ...p, [campo.id]: e.target.value }))}
                      className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2.5 text-sm outline-none transition focus:border-primary"
                    />
                    {erros[campo.id] && <p className="mt-1 text-xs text-destructive">{erros[campo.id]}</p>}
                  </div>
                ))}
              </div>

              {erro && <p className="mt-4 text-sm text-destructive">{erro}</p>}

              <button
                type="submit"
                disabled={enviando}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
              >
                {enviando && <Loader2 className="size-4 animate-spin" />}
                Ver meu resultado
              </button>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                Seus dados são usados apenas para a apresentação do relatório pelo Grupo MAGAV.
              </p>
            </form>
          </section>
        )}

        {etapa === "resultado" && (
          <section className="flex flex-1 flex-col items-center justify-center py-8 text-center">
            <p className="text-[11px] uppercase tracking-[0.18em] text-brand-sage">Placar do condomínio</p>
            <p className="mt-2 text-6xl font-semibold tabular-nums md:text-7xl">
              {resultado.total}
              <span className="text-2xl text-muted-foreground md:text-3xl">/96</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {resultado.percentual}% · {resultado.nivel.label}
            </p>

            <div className="mt-8 grid w-full max-w-3xl grid-cols-2 gap-2 md:grid-cols-6">
              {resultado.fatores.map((f) => (
                <div key={f.id} className="rounded-xl border border-border bg-card/70 p-3 text-left backdrop-blur">
                  <p className="truncate text-[11px] text-muted-foreground">{f.zona}</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums" style={{ color: corDoRatio(f.ratio) }}>
                    {f.pontos}
                    <span className="text-xs text-muted-foreground">/16</span>
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 w-full max-w-2xl rounded-2xl border border-destructive/40 bg-card/85 p-6 text-left backdrop-blur-md">
              <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-destructive">
                <ShieldAlert className="size-4" /> Ponto crítico
              </p>
              <h2 className="mt-2 text-2xl font-semibold">{resultado.maisFraco.nome}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{resultado.diagnosticoMaisFraco}</p>
              <p className="mt-4 text-sm">
                O relatório completo — com as 48 respostas cruzadas, prioridades e plano de ação por fator — é
                apresentado por um especialista do Grupo MAGAV.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`https://wa.me/${WHATSAPP}?text=${mensagemWhats}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition hover:brightness-110"
                >
                  <MessageCircle className="size-4" /> Falar no WhatsApp
                </a>
                <a
                  href={`mailto:${EMAIL}?subject=${encodeURIComponent("Relatório do Diagnóstico de Segurança Condominial")}`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border px-6 py-3.5 font-semibold transition hover:bg-secondary/60"
                >
                  <Mail className="size-4" /> Enviar e-mail
                </a>
              </div>
            </div>
          </section>
        )}

        <footer className="pt-6 text-center text-[11px] text-muted-foreground">
          Grupo MAGAV · Diagnóstico de Segurança Condominial
        </footer>
      </div>

      {/* Badge de conclusão de fator */}
      {badge && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-20 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-card/95 px-5 py-2.5 text-sm font-medium shadow-xl backdrop-blur">
            <CheckCircle2 className="size-4 text-primary" /> {badge}
          </div>
        </div>
      )}
    </div>
  );
}
