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

    return { enviado: true as const };
  });
