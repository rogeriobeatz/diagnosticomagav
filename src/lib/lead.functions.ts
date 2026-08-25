import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const LeadSchema = z.object({
  nome_condominio: z.string().trim().min(2).max(120),
  nome_sindico: z.string().trim().min(2).max(120),
  email_contato: z.string().trim().email().max(160),
  telefone_contato: z.string().trim().max(40).optional().default(""),
  consentimento_lgpd: z.literal(true),
  data_diagnostico: z.string().trim().min(4).max(30),
  respostas: z.record(z.string().max(10), z.number().int().min(0).max(2)),
  pontuacao_por_fator: z.array(
    z.object({ id: z.string().max(10), nome: z.string().max(80), pontos: z.number(), maximo: z.number() }),
  ),
  pontuacao_total: z.number().int().min(0).max(96),
  percentual: z.number().int().min(0).max(100),
  fator_mais_fraco: z.string().max(80),
  nivel: z.string().max(60),
});

export type LeadPayload = z.infer<typeof LeadSchema>;

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>'"]/g,
    (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character,
  );
}

function relatorioHtml(data: LeadPayload): string {
  const fatores = data.pontuacao_por_fator
    .map(
      (fator) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #dce7e2">${escapeHtml(fator.nome)}</td><td style="padding:8px;border-bottom:1px solid #dce7e2;text-align:right">${fator.pontos}/${fator.maximo}</td></tr>`,
    )
    .join("");
  return `
    <div style="font-family:Arial,sans-serif;color:#17352f;max-width:640px;margin:auto">
      <h1 style="color:#167c68">Diagnóstico de Segurança Condominial</h1>
      <p>Olá, ${escapeHtml(data.nome_sindico)}. Este é o resultado do diagnóstico do condomínio <strong>${escapeHtml(data.nome_condominio)}</strong>.</p>
      <div style="background:#edf5f1;padding:20px;border-radius:8px;margin:20px 0">
        <p style="font-size:28px;margin:0"><strong>${data.pontuacao_total}/${data.pontuacao_por_fator.reduce((total, fator) => total + fator.maximo, 0)}</strong></p>
        <p style="margin:6px 0 0">${data.percentual}% · ${escapeHtml(data.nivel)}</p>
      </div>
      <h2>Fator que merece atenção</h2>
      <p><strong>${escapeHtml(data.fator_mais_fraco)}</strong></p>
      <h2>Pontuação por fator</h2>
      <table style="width:100%;border-collapse:collapse">${fatores}</table>
      <p style="margin-top:24px;color:#526761">O relatório completo e o plano de ação serão apresentados por um especialista do Grupo MAGAV.</p>
    </div>`;
}

async function enviarRelatorioPorEmail(data: LeadPayload): Promise<boolean> {
  const apiKey = process.env["RESEND_API_KEY"];
  const remetente = process.env["EMAIL_FROM"];
  const emailMagav = process.env["MAGAV_EMAIL"];
  if (!apiKey || !remetente || !emailMagav) {
    console.warn("E-mail do relatório não configurado; lead salvo no Supabase.");
    return false;
  }

  const html = relatorioHtml(data);
  const enviar = (destinatario: string) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: remetente,
        to: [destinatario],
        subject: `Diagnóstico de segurança: ${data.nome_condominio}`,
        html,
      }),
    });

  const resultados = await Promise.allSettled([enviar(data.email_contato), enviar(emailMagav)]);
  const falhas = resultados.filter((resultado) => resultado.status === "rejected");
  const respostasInvalidas = resultados.filter(
    (resultado) => resultado.status === "fulfilled" && !resultado.value.ok,
  );
  if (falhas.length > 0 || respostasInvalidas.length > 0) {
    console.error("Falha ao enviar relatório por e-mail", { falhas: falhas.length, respostasInvalidas: respostasInvalidas.length });
    return false;
  }
  return true;
}

export const enviarLead = createServerFn({ method: "POST" })
  .validator((input: unknown) => LeadSchema.parse(input))
  .handler(async ({ data }) => {
    const supabaseUrl = process.env["SUPABASE_URL"];
    const supabaseServiceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Supabase não configurado no ambiente do servidor.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const consentimentoEm = new Date().toISOString();
    const { error: databaseError } = await supabase.from("leads").insert({
      ...data,
      consentimento_em: consentimentoEm,
      origem: "diagnostico-magav",
    });
    if (databaseError) {
      console.error("Supabase falhou ao salvar lead:", databaseError);
      throw new Error("Não foi possível registrar o diagnóstico.");
    }

    const webhook = process.env["LEAD_WEBHOOK_URL"];
    if (webhook) {
      try {
        const res = await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ origem: "diagnostico-magav", enviado_em: consentimentoEm, ...data }),
        });
        if (!res.ok) console.error(`Webhook falhou [${res.status}] após salvar no Supabase.`);
      } catch (error) {
        console.error("Webhook indisponível após salvar no Supabase:", error);
      }
    }

    const emailEnviado = await enviarRelatorioPorEmail(data);

    return { enviado: true as const, emailEnviado };
  });
