import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const LeadSchema = z.object({
  nome_condominio: z.string().trim().min(2).max(120),
  nome_sindico: z.string().trim().min(2).max(120),
  email_contato: z.string().trim().email().max(160),
  telefone_contato: z.string().trim().max(40).optional().default(""),
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
  .inputValidator((input: unknown) => LeadSchema.parse(input))
  .handler(async ({ data }) => {
    const webhook = process.env["LEAD_WEBHOOK_URL"];
    if (!webhook) {
      console.warn("LEAD_WEBHOOK_URL não configurada — lead não enviado.");
      return { enviado: false as const, motivo: "webhook_nao_configurado" as const };
    }

    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origem: "diagnostico-magav", enviado_em: new Date().toISOString(), ...data }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`Webhook falhou [${res.status}]: ${body}`);
      throw new Error(`Não foi possível registrar o diagnóstico (${res.status}).`);
    }

    return { enviado: true as const };
  });
