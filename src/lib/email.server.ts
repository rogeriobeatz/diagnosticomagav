import { FATORES } from "@/data/diagnostico";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

export const remetente = () =>
  process.env["EMAIL_REMETENTE"] ?? "Grupo MAGAV <noreply@noreply.magav.com.br>";
export const equipe = () => process.env["EMAIL_EQUIPE"] ?? "atila@magav.com.br";




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
      from: remetente(),
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
  respostas?: Record<string, number>;
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

const ROTULO: Record<number, { txt: string; cor: string; bg: string }> = {
  2: { txt: "Sim", cor: "#1f7a54", bg: "#e6f4ec" },
  1: { txt: "Parcial", cor: "#8a6d0b", bg: "#fbf3d9" },
  0: { txt: "Não", cor: "#b2362b", bg: "#fbe7e5" },
};

function corRatio(r: number) {
  return r >= 0.75 ? "#2f9e6f" : r >= 0.45 ? "#c9a227" : "#d4483b";
}

const ROTULO_CURTO: Record<string, string> = {};

export function radarUrl(fatores: Fator[]) {
  const labels = fatores.map((f) => {
    const n = ROTULO_CURTO[f.id] ?? f.nome.split(/\s*[&·—-]\s*/)[0] ?? f.nome;
    return [...n.split(" "), `${f.pontos}/${f.maximo}`];
  });
  const config = {
    type: "radar",
    data: {
      labels,
      datasets: [
        {
          label: "Pontuação",
          data: fatores.map((f) => f.pontos),
          backgroundColor: "rgba(30,75,65,0.28)",
          borderColor: "#12312c",
          borderWidth: 3,
          pointBackgroundColor: fatores.map((f) => corRatio(f.maximo ? f.pontos / f.maximo : 0)),
          pointBorderColor: "#ffffff",
          pointRadius: 6,
        },
      ],
    },
    options: {
      layout: { padding: 10 },
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 0,
          max: 16,
          ticks: { stepSize: 4, backdropColor: "transparent", color: "#8a9793", font: { size: 11 } },
          grid: { color: "#dfe7e4" },
          angleLines: { color: "#dfe7e4" },
          pointLabels: { color: "#12312c", font: { size: 12, weight: "bold" } },
        },
      },
    },
  };
  return `https://quickchart.io/chart?v=4&w=520&h=420&devicePixelRatio=2&bkg=white&c=${encodeURIComponent(JSON.stringify(config))}`;
}

export function promptClaude(d: Dados) {
  const r = d.respostas ?? {};
  const linhas: string[] = [];
  linhas.push("Você é o consultor de segurança condominial do Grupo MAGAV. Analise o diagnóstico abaixo e elabore um plano de ação priorizado (curto, médio e longo prazo) por fator, destacando riscos críticos, quick wins e investimentos recomendados.");
  linhas.push("");
  linhas.push("## DADOS DO CONDOMÍNIO");
  linhas.push(`Condomínio: ${d.nome_condominio}`);
  linhas.push(`Síndico/gestor: ${d.nome_sindico}`);
  linhas.push(`E-mail: ${d.email_contato}`);
  linhas.push(`Telefone: ${d.telefone_contato || "—"}`);
  linhas.push(`Data do diagnóstico: ${d.data_diagnostico}`);
  linhas.push("");
  linhas.push("## RESULTADO GERAL");
  linhas.push(`Pontuação total: ${d.pontuacao_total}/96 (${d.percentual}%)`);
  linhas.push(`Nível: ${d.nivel}`);
  linhas.push(`Fator mais fraco: ${d.fator_mais_fraco}`);
  linhas.push("Escala: 2 = Sim/Sempre/Funcionando bem · 1 = Parcialmente/Com falhas · 0 = Não/Nunca/Não existe");
  linhas.push("");
  linhas.push("## RESPOSTAS POR FATOR");
  for (const f of FATORES) {
    const pf = d.pontuacao_por_fator.find((p) => p.id === f.id);
    linhas.push("");
    linhas.push(`### ${f.id} — ${f.nome} (${pf ? `${pf.pontos}/${pf.maximo}` : "—"})`);
    for (const p of f.perguntas) {
      const v = r[p.id];
      const label = v === undefined ? "Sem resposta" : `${v} (${ROTULO[v]?.txt ?? v})`;
      linhas.push(`${p.id} ${p.texto} → ${label}`);
    }
  }
  return linhas.join("\n");
}

export function emailEquipe(d: Dados) {
  const r = d.respostas ?? {};
  const cnt = { 2: 0, 1: 0, 0: 0 } as Record<number, number>;
  Object.values(r).forEach((v) => (cnt[v] = (cnt[v] ?? 0) + 1));
  const corGeral = corRatio(d.percentual / 100);

  const card = (rotulo: string, valor: string, cor = "#12312c") => `
    <td style="width:33%;padding:6px;" valign="top">
      <div style="background:#ffffff;border:1px solid #e3e9e6;border-radius:12px;padding:14px;">
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#6d7c78;">${rotulo}</p>
        <p style="margin:0;font-size:20px;font-weight:700;color:${cor};">${valor}</p>
      </div>
    </td>`;

  const fatoresCards = d.pontuacao_por_fator
    .map((f) => {
      const ratio = f.maximo ? f.pontos / f.maximo : 0;
      const pct = Math.round(ratio * 100);
      return `<tr><td style="padding:6px 0;">
        <table style="width:100%;border-collapse:collapse;"><tr>
          <td style="font-size:14px;color:#1c2b2b;">${escapar(f.nome)}</td>
          <td style="font-size:14px;font-weight:700;text-align:right;color:${corRatio(ratio)};">${f.pontos}/${f.maximo} · ${pct}%</td>
        </tr></table>
        <div style="background:#edf1ef;border-radius:6px;height:8px;margin-top:6px;overflow:hidden;">
          <div style="background:${corRatio(ratio)};width:${pct}%;height:8px;border-radius:6px;"></div>
        </div>
      </td></tr>`;
    })
    .join("");

  const detalhes = FATORES.map((f) => {
    const pf = d.pontuacao_por_fator.find((p) => p.id === f.id);
    const linhas = f.perguntas
      .map((p) => {
        const v = r[p.id];
        const rot = (v === undefined ? undefined : ROTULO[v]) ?? { txt: "—", cor: "#6d7c78", bg: "#f0f0f0" };
        return `<tr>
          <td style="padding:10px 8px 10px 0;border-bottom:1px solid #eef2f0;font-size:13px;color:#41514d;vertical-align:top;width:36px;"><strong style="color:#12312c;">${p.id}</strong></td>
          <td style="padding:10px 8px;border-bottom:1px solid #eef2f0;font-size:13px;line-height:1.5;color:#1c2b2b;">${escapar(p.texto)}</td>
          <td style="padding:10px 0;border-bottom:1px solid #eef2f0;text-align:right;vertical-align:top;white-space:nowrap;">
            <span style="display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;color:${rot.cor};background:${rot.bg};">${rot.txt}</span>
          </td>
        </tr>`;
      })
      .join("");
    const ratio = pf && pf.maximo ? pf.pontos / pf.maximo : 0;
    return `<div style="border:1px solid #e3e9e6;border-radius:14px;margin-bottom:16px;overflow:hidden;">
      <div style="background:#12312c;padding:14px 18px;">
        <table style="width:100%;border-collapse:collapse;"><tr>
          <td style="font-size:15px;font-weight:700;color:#ffffff;">${f.id} · ${escapar(f.nome)}<br><span style="font-size:12px;font-weight:400;color:#a9c2bb;">${escapar(f.zona)}</span></td>
          <td style="text-align:right;font-size:16px;font-weight:700;color:${corRatio(ratio)};">${pf ? `${pf.pontos}/${pf.maximo}` : "—"}</td>
        </tr></table>
      </div>
      <div style="padding:4px 18px 8px;background:#ffffff;"><table style="width:100%;border-collapse:collapse;">${linhas}</table></div>
    </div>`;
  }).join("");

  const prompt = escapar(promptClaude(d));

  return `<!doctype html>
<html lang="pt-BR"><body style="margin:0;padding:0;background-color:#f4f7f5;font-family:Arial,Helvetica,sans-serif;color:#1c2b2b;">
  <div style="max-width:680px;margin:0 auto;padding:28px 16px;">
    <div style="background:#12312c;border-radius:16px;padding:26px 24px;margin-bottom:16px;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a9c2bb;">Grupo MAGAV · Relatório técnico interno</p>
      <h1 style="margin:0 0 6px;font-size:24px;color:#ffffff;">${escapar(d.nome_condominio)}</h1>
      <p style="margin:0;font-size:14px;color:#d5e3df;">Novo diagnóstico de segurança condominial · ${escapar(d.data_diagnostico)}</p>
    </div>

    <table style="width:100%;border-collapse:collapse;margin:0 -6px 10px;"><tr>
      ${card("Pontuação", `${d.pontuacao_total}<span style="font-size:13px;color:#6d7c78;">/96</span>`, corGeral)}
      ${card("Índice", `${d.percentual}%`, corGeral)}
      ${card("Nível", escapar(d.nivel), corGeral)}
    </tr></table>

    <div style="background:#ffffff;border:1px solid #e3e9e6;border-radius:14px;padding:18px;margin-bottom:16px;">
      <p style="margin:0 0 10px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#6d7c78;">Contato do lead</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:5px 0;font-size:14px;color:#6d7c78;">Síndico/gestor</td><td style="padding:5px 0;font-size:14px;text-align:right;font-weight:700;">${escapar(d.nome_sindico)}</td></tr>
        <tr><td style="padding:5px 0;font-size:14px;color:#6d7c78;">E-mail</td><td style="padding:5px 0;font-size:14px;text-align:right;"><a href="mailto:${escapar(d.email_contato)}" style="color:#12312c;">${escapar(d.email_contato)}</a></td></tr>
        <tr><td style="padding:5px 0;font-size:14px;color:#6d7c78;">Telefone</td><td style="padding:5px 0;font-size:14px;text-align:right;">${escapar(d.telefone_contato || "—")}</td></tr>
      </table>
    </div>

    <table style="width:100%;border-collapse:collapse;margin:0 -6px 10px;"><tr>
      ${card("Respostas Sim", String(cnt[2] ?? 0), "#1f7a54")}
      ${card("Parciais", String(cnt[1] ?? 0), "#8a6d0b")}
      ${card("Respostas Não", String(cnt[0] ?? 0), "#b2362b")}
    </tr></table>

    <div style="border:1px solid #f0c9c4;background:#fdf5f4;border-radius:14px;padding:18px;margin-bottom:16px;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#d4483b;">Ponto crítico</p>
      <p style="margin:0;font-size:18px;font-weight:700;color:#12312c;">${escapar(d.fator_mais_fraco)}</p>
    </div>

    <div style="background:#ffffff;border:1px solid #e3e9e6;border-radius:14px;padding:18px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#6d7c78;">Pontuação por fator</p>
      <div style="text-align:center;margin:0 0 12px;">
        <img src="${radarUrl(d.pontuacao_por_fator)}" width="520" alt="Gráfico de radar da pontuação por fator" style="display:block;width:100%;max-width:520px;height:auto;margin:0 auto;border:0;" />
      </div>
      <table style="width:100%;border-collapse:collapse;">${fatoresCards}</table>
    </div>

    <h2 style="margin:0 0 12px;font-size:17px;color:#12312c;">Respostas detalhadas (48)</h2>
    ${detalhes}

    <div style="background:#ffffff;border:2px solid #12312c;border-radius:14px;padding:18px;margin-top:24px;">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#6d7c78;">Prompt para o Claude</p>
      <p style="margin:0 0 12px;font-size:13px;line-height:1.5;color:#41514d;">Clique dentro do quadro, selecione tudo (Ctrl/Cmd + A) e copie — ou toque e segure no celular. Cole direto no Claude.</p>
      <pre style="margin:0;padding:14px;background:#f4f7f5;border:1px dashed #9fb3ad;border-radius:10px;font-family:Consolas,Menlo,monospace;font-size:12px;line-height:1.5;color:#1c2b2b;white-space:pre-wrap;word-break:break-word;user-select:all;-webkit-user-select:all;">${prompt}</pre>
    </div>

    <p style="margin:24px 0 0;font-size:12px;color:#8a9793;text-align:center;">Grupo MAGAV · Responder este e-mail fala direto com o síndico</p>
  </div>
</body></html>`;
}
