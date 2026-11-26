import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const titulo = "Política de Privacidade | Diagnóstico MAGAV";
const descricao = "Saiba como o Grupo MAGAV trata os dados do diagnóstico, elabora orçamentos e pesquisas de mercado e atende seus direitos de privacidade.";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: titulo },
      { name: "description", content: descricao },
      { property: "og:title", content: titulo },
      { property: "og:description", content: descricao },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacidade,
});

function Privacidade() {
  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-5 py-8 text-foreground sm:px-8 sm:py-12">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border pb-6">
        <img src="/assets/Logotipo-Grupo-MAGAV-Horizontal-Negativo.webp" alt="Grupo MAGAV" className="h-auto w-full max-w-44" />
        <Button asChild variant="ghost"><Link to="/"><ArrowLeft className="size-4" /> Voltar</Link></Button>
      </header>
      <h1 className="mt-10 text-3xl font-bold sm:text-4xl">Política de Privacidade</h1>
      <p className="mt-3 text-sm text-muted-foreground">Diagnóstico de Segurança Condominial · Atualizada em 26 de novembro de 2026</p>
      <div className="mt-8 space-y-8 text-sm leading-7 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_li]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4">
        <section>
          <h2>1. Quem trata suas informações</h2>
          <p>O Grupo MAGAV é responsável pelas finalidades do tratamento das informações fornecidas nesta ferramenta. Esta política explica como usamos esses dados, em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD). Para dúvidas ou solicitações sobre privacidade, entre em contato com <a href="mailto:atila@magav.com.br">atila@magav.com.br</a>.</p>
        </section>
        <section>
          <h2>2. Quais informações recebemos</h2>
          <ul>
            <li>Nome do condomínio, nome do síndico ou gestor, e-mail e telefone, quando informado.</li>
            <li>Respostas às perguntas de segurança, pontuação, indicadores por fator e resultado do diagnóstico.</li>
            <li>Registro do aceite, data do diagnóstico e informações necessárias ao funcionamento e à segurança da ferramenta.</li>
          </ul>
          <p className="mt-3">Não solicitamos dados sensíveis, nomes de moradores, senhas, códigos de acesso ou detalhes que permitam acessar o condomínio. Evite fornecer informações pessoais de terceiros.</p>
        </section>
        <section>
          <h2>3. Para que utilizamos os dados</h2>
          <ul>
            <li>Calcular o diagnóstico, enviar o resultado e elaborar relatórios técnicos e planos de ação.</li>
            <li>Entrar em contato para apresentar o relatório, agendar reuniões e atender solicitações.</li>
            <li>Elaborar orçamentos e propostas de serviços e soluções de segurança adequadas ao condomínio.</li>
            <li>Realizar pesquisas de mercado, estudos e análises para melhorar os serviços MAGAV, priorizando dados agregados ou anonimizados, sem identificar pessoas ou expor vulnerabilidades de um condomínio em publicações.</li>
          </ul>
          <p className="mt-3">O aceite não autoriza uso indiscriminado dos dados. Qualquer nova finalidade incompatível com estas será informada e, quando necessário, dependerá de novo consentimento.</p>
        </section>
        <section>
          <h2>4. Bases legais e suas escolhas</h2>
          <p>O tratamento das informações fornecidas para as finalidades descritas se apoia no consentimento registrado no envio. O atendimento de pedidos de orçamento e medidas pré-contratuais também pode se apoiar nos procedimentos solicitados por você. Obrigações legais serão cumpridas quando aplicáveis. A análise estatística pode utilizar dados efetivamente anonimizados.</p>
          <p className="mt-3">Você pode revogar seu consentimento e pedir a interrupção de contatos comerciais a qualquer momento, sem afetar o tratamento realizado legalmente antes da revogação. Sem as informações necessárias ou o aceite, o envio personalizado do diagnóstico não poderá ser concluído.</p>
        </section>
        <section>
          <h2>5. Compartilhamento e serviços utilizados</h2>
          <p>Os dados são disponibilizados à equipe MAGAV que elabora e apresenta o diagnóstico e a prestadores necessários ao funcionamento da ferramenta, limitados à finalidade de cada serviço:</p>
          <ul>
            <li>Lovable: hospedagem da ferramenta e infraestrutura de entrega das integrações.</li>
            <li>Resend: destinatários, conteúdo dos relatórios e informações necessárias ao envio de e-mails.</li>
            <li>QuickChart: nomes dos fatores e pontuações usados para gerar a imagem do radar nos e-mails, sem nome, telefone ou e-mail do contato na configuração do gráfico.</li>
            <li>WhatsApp/Meta: ao escolher o contato pelo WhatsApp, a mensagem inclui o condomínio e a pontuação; seu envio e tratamento também seguem as regras desse serviço.</li>
            <li>Serviços de armazenamento ou integrações de atendimento, quando configurados, podem receber os dados do diagnóstico para registro e acompanhamento.</li>
          </ul>
          <p className="mt-3">A equipe poderá utilizar ferramentas de inteligência artificial, como Claude/Anthropic, para apoiar a análise técnica das respostas, com revisão humana e minimização dos dados pessoais enviados. O diagnóstico é indicativo e não substitui uma avaliação técnica presencial.</p>
          <p className="mt-3">Alguns prestadores podem tratar dados fora do Brasil. Quando aplicável, a MAGAV deve observar os mecanismos e salvaguardas de transferência internacional exigidos pela LGPD. Não vendemos dados pessoais; o compartilhamento também pode ocorrer para cumprir obrigações legais ou proteger direitos.</p>
        </section>
        <section>
          <h2>6. Progresso salvo no navegador e estatísticas de visita</h2>
          <p>A ferramenta salva localmente as respostas e a posição nas perguntas para permitir retomar o diagnóstico no mesmo navegador. Esse registro permanece até ser apagado pela opção de recomeçar ou pela limpeza dos dados do site no navegador; não é um comprovante de envio nem substitui o registro do diagnóstico. Evite usar aparelhos compartilhados ou limpe o progresso após o uso.</p>
          <p className="mt-3">As estatísticas de visita da Lovable não usam cookies, não armazenam nada no dispositivo, não mantêm endereços IP e não identificam visitantes. Elas registram páginas visitadas, origem da visita, país, navegador, sistema operacional, tipo de dispositivo, tempo de permanência, velocidade de carregamento, erros e cliques em links e botões. Neste site, essas estatísticas são registradas para todos os visitantes, sem um painel de escolha de cookies.</p>
          <p className="mt-3">Os dados detalhados são mantidos por 90 dias, e os resumos diários por um ano. A Lovable coleta esses dados para nós. A <a href="https://lovable.dev/privacy" target="_blank" rel="noopener noreferrer">política de privacidade da Lovable</a> explica como ela os trata.</p>
        </section>
        <section>
          <h2>7. Conservação e segurança</h2>
          <p>Os dados do diagnóstico, inclusive cópias em e-mails, são mantidos pelo tempo necessário para apresentar o relatório, acompanhar propostas e atender às finalidades informadas, considerando obrigações legais e eventual defesa de direitos. Encerrada a necessidade, devem ser eliminados ou anonimizados, ressalvadas as hipóteses de conservação permitidas por lei.</p>
          <p className="mt-3">Adotamos medidas técnicas e organizacionais compatíveis com o tratamento, como comunicação por HTTPS e acesso restrito às informações. Nenhum sistema oferece segurança absoluta; possíveis incidentes serão avaliados e comunicados quando a legislação exigir.</p>
        </section>
        <section>
          <h2>8. Seus direitos</h2>
          <p>Você pode solicitar confirmação e acesso ao tratamento, correção, informação sobre compartilhamento, anonimização, bloqueio ou eliminação de dados desnecessários ou irregulares, portabilidade conforme a regulamentação, eliminação dos dados tratados com consentimento e revogação desse consentimento, observadas as exceções legais. Também pode apresentar petição à Autoridade Nacional de Proteção de Dados (ANPD).</p>
          <p className="mt-3">Envie sua solicitação a <a href="mailto:atila@magav.com.br">atila@magav.com.br</a> com o assunto “Privacidade — Diagnóstico MAGAV”. Podemos solicitar informações proporcionais para confirmar sua identidade e proteger seus dados.</p>
        </section>
        <section>
          <h2>9. Atualizações</h2>
          <p>Esta política poderá ser atualizada para refletir mudanças na ferramenta ou na legislação. A versão vigente e sua data estarão nesta página; alterações relevantes nas finalidades serão comunicadas quando necessário.</p>
        </section>
      </div>
    </main>
  );
}