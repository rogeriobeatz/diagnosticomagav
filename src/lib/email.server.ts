const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

export const EMAIL_REMETENTE = "Grupo MAGAV <diagnostico@magav.com.br>";
export const EMAIL_EQUIPE = "atila@magav.com.br";

export async function enviarEmail(input: {
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const resendKey = process.env["RESEND_API_KEY"];
  if (!lovableKey || !resendKey) {
    throw new Error("Credenciais de e-mail não configuradas (LOVABLE_API_KEY / RESEND_API_KEY).");
  }

  const response = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": resendKey,
    },
    body: JSON.stringify({
      from: EMAIL_REMETENTE,
      to: input.to,
      subject: input.subject,
      html: input.html,
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Resend falhou [${response.status}]: ${errorBody}`);
    throw new Error(`Envio de e-mail falhou [${response.status}]: ${errorBody}`);
  }

  return (await response.json()) as { id?: string };
}

const escapar = (valor: string) =>
  valor.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

type Fator = { id: string; nome: string; pontos: number; maximo: number };

type Dados = {
  nome_condominio: string;
  nome_sindico: string;
  email_contato: string;
  telefone_contato?: string;
  data_diagnostico: string;
  pontuacao_por_fator: Fator[];
  pontuacao_total: number;
  percentual: number;
  fator_mais_fraco: string;
  nivel: string;
};

function tabelaFatores(fatores: Fator[]) {
  return fatores
    .map((f) => {
      const ratio = f.maximo ? f.pontos / f.maximo : 0;
      const cor = ratio >= 0.75 ? "#2f9e6f" : ratio >= 0.45 ? "#c9a227" : "#d4483b";
      return `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eeeeee;font-size:14px;color:#1c2b2b;">${escapar(f.nome)}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eeeeee;font-size:14px;font-weight:700;text-align:right;color:${cor};">${f.pontos}/${f.maximo}</td>
      </tr>`;
    })
    .join("");
}

const wrapper = (conteudo: string) => `<!doctype html>
<html lang="pt-BR"><body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#1c2b2b;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <p style="margin:0 0 24px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#6d7c78;">Grupo MAGAV · Diagnóstico de Segurança Condominial</p>
    ${conteudo}
    <p style="margin:32px 0 0;font-size:12px;color:#8a9793;">Grupo MAGAV · Segurança condominial</p>
  </div>
</body></html>`;

export function emailSindico(d: Dados) {
  return wrapper(`
    <h1 style="margin:0 0 12px;font-size:24px;color:#12312c;">Seu diagnóstico está pronto, ${escapar(d.nome_sindico)}</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#41514d;">
      Resultado do condomínio <strong>${escapar(d.nome_condominio)}</strong>, respondido em ${escapar(d.data_diagnostico)}.
    </p>
    <div style="background:#f4f7f5;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0;font-size:36px;font-weight:700;color:#12312c;">${d.pontuacao_total}<span style="font-size:18px;color:#6d7c78;">/96</span></p>
      <p style="margin:4px 0 0;font-size:14px;color:#41514d;">${d.percentual}% · ${escapar(d.nivel)}</p>
    </div>
    <h2 style="margin:0 0 8px;font-size:16px;color:#12312c;">Pontuação por zona</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">${tabelaFatores(d.pontuacao_por_fator)}</table>
    <div style="border:1px solid #f0c9c4;background:#fdf5f4;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#d4483b;">Ponto crítico</p>
      <p style="margin:0;font-size:18px;font-weight:700;color:#12312c;">${escapar(d.fator_mais_fraco)}</p>
    </div>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#41514d;">
      Um especialista do Grupo MAGAV vai entrar em contato para apresentar o relatório completo, com as 48 respostas cruzadas e o plano de ação por fator. Se preferir, responda este e-mail com o melhor horário.
    </p>
  `);
}

export function emailEquipe(d: Dados) {
  return wrapper(`
    <h1 style="margin:0 0 12px;font-size:22px;color:#12312c;">Novo lead: ${escapar(d.nome_condominio)}</h1>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr><td style="padding:6px 0;font-size:14px;color:#6d7c78;">Síndico/gestor</td><td style="padding:6px 0;font-size:14px;text-align:right;">${escapar(d.nome_sindico)}</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#6d7c78;">E-mail</td><td style="padding:6px 0;font-size:14px;text-align:right;">${escapar(d.email_contato)}</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#6d7c78;">Telefone</td><td style="padding:6px 0;font-size:14px;text-align:right;">${escapar(d.telefone_contato || "—")}</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#6d7c78;">Data</td><td style="padding:6px 0;font-size:14px;text-align:right;">${escapar(d.data_diagnostico)}</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#6d7c78;">Pontuação</td><td style="padding:6px 0;font-size:14px;text-align:right;"><strong>${d.pontuacao_total}/96</strong> · ${d.percentual}% · ${escapar(d.nivel)}</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#6d7c78;">Ponto crítico</td><td style="padding:6px 0;font-size:14px;text-align:right;color:#d4483b;">${escapar(d.fator_mais_fraco)}</td></tr>
    </table>
    <h2 style="margin:0 0 8px;font-size:16px;color:#12312c;">Pontuação por zona</h2>
    <table style="width:100%;border-collapse:collapse;">${tabelaFatores(d.pontuacao_por_fator)}</table>
  `);
}
