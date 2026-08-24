export type Escala = 0 | 1 | 2;

export type Pergunta = { id: string; texto: string; curto: string };

export type Fator = {
  id: string;
  nome: string;
  zona: string;
  descricao: string;
  badge: string;
  perguntas: Pergunta[];
};

export const ESCALA: { valor: Escala; label: string; curto: string }[] = [
  { valor: 2, label: "Sim / Sempre / Funcionando bem", curto: "Sim" },
  { valor: 1, label: "Parcialmente / Às vezes / Com falhas", curto: "Parcialmente" },
  { valor: 0, label: "Não / Nunca / Não existe", curto: "Não" },
];

export const PONTUACAO_MAXIMA_TOTAL = 96;
export const PONTUACAO_MAXIMA_FATOR = 16;

export const FATORES: Fator[] = [
  {
    id: "F1",
    nome: "Implementos Físicos",
    zona: "Perímetro & Estrutura",
    descricao: "Estrutura, barreiras e proteções físicas do condomínio.",
    badge: "Perímetro auditado",
    perguntas: [
      {
        id: "1.1",
        curto: "Muros e grades",
        texto:
          "Os muros e grades do perímetro estão em bom estado (sem buracos, corrosão ou estrutura comprometida)?",
      },
      {
        id: "1.2",
        curto: "Altura e topo do muro",
        texto:
          "A altura dos muros é adequada (mínimo 2,5m) e há proteção no topo (concertina, cerca elétrica ou similar)?",
      },
      {
        id: "1.3",
        curto: "Portões e cancelas",
        texto: "Todos os portões e cancelas funcionam corretamente e fecham com travamento automático?",
      },
      {
        id: "1.4",
        curto: "Iluminação",
        texto:
          "A iluminação cobre todas as áreas críticas: entradas, garagens, corredores, escadarias e playground?",
      },
      {
        id: "1.5",
        curto: "Vegetação",
        texto:
          "A vegetação ao redor do condomínio está podada — sem arbustos que escondam pessoas nem árvores que facilitem escalada do muro?",
      },
      {
        id: "1.6",
        curto: "Guarita",
        texto:
          "As guaritas e portarias têm estrutura física adequada (vidro resistente, trava interna, comunicação com central)?",
      },
      {
        id: "1.7",
        curto: "Áreas técnicas",
        texto:
          "Áreas de risco interno (sala de máquinas, gerador, barrilete, subestação) são trancadas e têm acesso restrito?",
      },
      {
        id: "1.8",
        curto: "Eclusas",
        texto: "Possui sistema de eclusas (portas duplas intertravadas) para acessos de veículos e pedestres?",
      },
    ],
  },
  {
    id: "F2",
    nome: "Implementos Tecnológicos",
    zona: "Tecnologia & Monitoramento",
    descricao: "Sistemas eletrônicos, câmeras, controle de acesso e comunicação.",
    badge: "Tecnologia mapeada",
    perguntas: [
      {
        id: "2.1",
        curto: "Cobertura de câmeras",
        texto:
          "As câmeras de segurança cobrem todas as entradas, saídas, garagem e áreas comuns sem pontos cegos críticos?",
      },
      { id: "2.2", curto: "Gravação 30 dias", texto: "As imagens das câmeras são gravadas e armazenadas por no mínimo 30 dias?" },
      {
        id: "2.3",
        curto: "Qualidade de imagem",
        texto: "As câmeras foram verificadas recentemente: imagem nítida, lente limpa, sem vegetação obstruindo?",
      },
      { id: "2.4", curto: "Interfone", texto: "O sistema de interfone funciona em todos os apartamentos e é testado periodicamente?" },
      {
        id: "2.5",
        curto: "Controle de acesso",
        texto: "O controle de acesso eletrônico (tag, biometria ou senha) tem registros consultáveis de quem entrou e saiu?",
      },
      {
        id: "2.6",
        curto: "Monitoramento 24h",
        texto: "O condomínio possui alarme ou sistema de monitoramento remoto ativo (central de monitoramento 24h)?",
      },
      {
        id: "2.7",
        curto: "Sensores",
        texto: "Há sensores de presença ou sistemas de detecção em áreas vulneráveis (garagem, cobertura, fundos)?",
      },
      { id: "2.8", curto: "Sirene / dissuasão", texto: "Há sistema de sirene ou de aviso de intrusão ou de dissuasão sonora/luminosa?" },
    ],
  },
  {
    id: "F3",
    nome: "Procedimentos",
    zona: "Portaria & Protocolos",
    descricao: "Protocolos, rotinas e documentação de segurança.",
    badge: "Protocolos revisados",
    perguntas: [
      {
        id: "3.1",
        curto: "Visitantes",
        texto: "Existe um protocolo escrito e atualizado para entrada de visitantes — e ele é seguido na prática?",
      },
      {
        id: "3.2",
        curto: "Prestadores",
        texto: "Há procedimento documentado para entrada de prestadores de serviço (cadastro, crachá, acompanhamento)?",
      },
      {
        id: "3.3",
        curto: "Emergências",
        texto:
          "O condomínio possui protocolo de emergência escrito (invasão, incêndio, emergência médica) conhecido pela equipe?",
      },
      {
        id: "3.4",
        curto: "Registro de ocorrências",
        texto: "Ocorrências são registradas formalmente (livro ou sistema digital) e revisadas pelo síndico?",
      },
      {
        id: "3.5",
        curto: "Revogação de acessos",
        texto:
          "Os acessos de ex-moradores, ex-funcionários e prestadores encerrados são revogados imediatamente após o desligamento?",
      },
      { id: "3.6", curto: "Revisão de acessos", texto: "Há revisão periódica (ao menos trimestral) de todos os acessos ativos ao condomínio?" },
      {
        id: "3.7",
        curto: "Rondas",
        texto: "Existe procedimento de ronda periódica nas dependências do condomínio com registro de vistoria?",
      },
      {
        id: "3.8",
        curto: "LGPD",
        texto: "Existe protocolo de controle da informação e proteção de dados pessoais dos condôminos (LGPD e similares)?",
      },
    ],
  },
  {
    id: "F4",
    nome: "Recursos Humanos",
    zona: "Equipe Operacional",
    descricao: "Equipe, treinamento e capacidade operacional das pessoas.",
    badge: "Equipe avaliada",
    perguntas: [
      { id: "4.1", curto: "Treinamento", texto: "Os porteiros e vigilantes receberam treinamento de segurança nos últimos 12 meses?" },
      {
        id: "4.2",
        curto: "Resposta a emergência",
        texto: "A equipe sabe o que fazer em situações de emergência (invasão, ameaça, pessoa suspeita)?",
      },
      {
        id: "4.3",
        curto: "Escala",
        texto: "A escala de trabalho garante cobertura contínua — sem períodos sem ninguém responsável pelo acesso?",
      },
      {
        id: "4.4",
        curto: "Supervisão",
        texto: "O síndico ou zelador faz supervisão regular da equipe de portaria (não apenas fiscalização reativa)?",
      },
      { id: "4.5", curto: "Antecedentes", texto: "A contratação de porteiros e zeladores inclui verificação de antecedentes criminais?" },
      {
        id: "4.6",
        curto: "Comportamento suspeito",
        texto: "A equipe sabe identificar comportamentos suspeitos e tem orientação clara sobre como agir?",
      },
      {
        id: "4.7",
        curto: "Contatos atualizados",
        texto: "Há número de contato atualizado de todos os funcionários e substitutos em caso de ausência?",
      },
      {
        id: "4.8",
        curto: "Integração de novatos",
        texto: "Novos colaboradores recebem treinamento adequado sobre segurança antes de assumirem o posto?",
      },
    ],
  },
  {
    id: "F5",
    nome: "Ambiente Interno",
    zona: "Moradores & Cultura",
    descricao: "Cultura de segurança, comportamento dos moradores e governança interna.",
    badge: "Cultura diagnosticada",
    perguntas: [
      { id: "5.1", curto: "Regras conhecidas", texto: "Os moradores conhecem e respeitam as regras básicas de segurança do condomínio?" },
      {
        id: "5.2",
        curto: "Comunicação",
        texto: "Há comunicação regular com os moradores sobre segurança (avisos, alertas, boletins periódicos)?",
      },
      {
        id: "5.3",
        curto: "Carona no acesso",
        texto: 'Os moradores evitam abrir portões para terceiros sem autorização da portaria ("carona no acesso")?',
      },
      { id: "5.4", curto: "Canal de report", texto: "Existe um canal claro para moradores reportarem incidentes ou situações suspeitas?" },
      {
        id: "5.5",
        curto: "Reunião de segurança",
        texto: "O condomínio realizou ao menos uma reunião sobre segurança com os moradores no último ano?",
      },
      {
        id: "5.6",
        curto: "Orientação a crianças",
        texto: "Crianças e adolescentes têm orientação dos responsáveis sobre segurança nas áreas comuns?",
      },
      {
        id: "5.7",
        curto: "Autorizados",
        texto: "Há critério sobre quem os moradores cadastram como autorizado a retirar encomendas ou acessar o apartamento?",
      },
      {
        id: "5.8",
        curto: "Funcionários domésticos",
        texto:
          "Os funcionários domésticos das unidades (diaristas, cuidadores, babás) recebem instruções mínimas sobre as regras de segurança do condomínio?",
      },
    ],
  },
  {
    id: "F6",
    nome: "Ambiente Externo",
    zona: "Entorno & Rede",
    descricao: "Contexto do entorno, riscos regionais e relação com a segurança pública.",
    badge: "Entorno analisado",
    perguntas: [
      {
        id: "6.1",
        curto: "Perfil do bairro",
        texto:
          "O síndico conhece o perfil de ocorrências criminais do bairro (roubos, furtos, invasões) nos últimos 12 meses?",
      },
      { id: "6.2", curto: "Contato policial", texto: "Há contato estabelecido com a delegacia ou base policial mais próxima?" },
      {
        id: "6.3",
        curto: "Rede de condomínios",
        texto: "O condomínio participa de rede de comunicação com outros condomínios da região (grupo, associação ou similar)?",
      },
      {
        id: "6.4",
        curto: "Entorno imediato",
        texto: "O entorno imediato (calçadas, lotes vizinhos, pontos de ônibus) é monitorado ou avaliado periodicamente?",
      },
      {
        id: "6.5",
        curto: "Iluminação pública",
        texto:
          "Há iluminação pública adequada na frente e nos flancos do condomínio? (O síndico acompanha e cobra quando não há.)",
      },
      {
        id: "6.6",
        curto: "Mudanças no entorno",
        texto:
          "O condomínio já avaliou ou atualizou sua segurança após mudança relevante no entorno (nova obra, comércio, movimentação)?",
      },
      {
        id: "6.7",
        curto: "Suporte jurídico",
        texto: "Em caso de ocorrência grave, o condomínio tem contato com advogado e sabe acionar boletim de ocorrência?",
      },
      {
        id: "6.8",
        curto: "Índice da região",
        texto:
          "A região do entorno é considerada segura — com baixo índice de ocorrências — e isso é monitorado periodicamente pelo síndico?",
      },
    ],
  },
];

export const DIAGNOSTICO_POR_FATOR: Record<string, string> = {
  F1: "A barreira física é o que dá tempo de reação. Hoje ela é o elo mais frágil do seu condomínio.",
  F2: "Tecnologia sem cobertura ou sem gravação vira registro de prejuízo, não prevenção.",
  F3: "Sem procedimento escrito e seguido, cada acesso depende do bom senso de quem está de plantão.",
  F4: "Equipamento não decide sob pressão — pessoas decidem. É aí que está sua maior exposição.",
  F5: "A maior parte das invasões em condomínios começa com um acesso autorizado por engano.",
  F6: "O risco começa fora do muro. Sem leitura do entorno, o condomínio reage sempre tarde demais.",
};

export const TOTAL_PERGUNTAS = FATORES.reduce((acc, f) => acc + f.perguntas.length, 0);
