# Diagnóstico 3D de Segurança Condominial — MVP

Ferramenta gamificada para síndicos e donos de condomínio: em vez de formulário, o usuário
percorre uma maquete 3D low-poly do condomínio e, a cada resposta, o próprio ambiente muda
(luzes acendem, câmeras aparecem, muro se ergue, portaria ganha equipe). Ao final, placar +
ponto crítico e CTA para falar com a MAGAV.

## Experiência

```text
[Abertura] logo MAGAV + "Monte o raio-x do seu condomínio" -> Começar
      |
[Maquete 3D central]  <-- HUD 2D em volta (pergunta, 3 botões, medidores)
      |
6 zonas = 6 fatores (48 perguntas, 8 por zona)
 F1 Perímetro/Estrutura · F2 Tecnologia · F3 Procedimentos
 F4 Equipe · F5 Moradores · F6 Entorno
      |
[Captura do lead]  ->  [Placar + fator mais fraco]  ->  [WhatsApp / e-mail]
```

- Cada resposta (Sim=2 / Parcialmente=1 / Não=0) provoca uma reação visível na cena:
  Sim acende/constrói o elemento em verde-MAGAV, Parcialmente deixa âmbar e piscando,
  Não deixa a área apagada com marcador de risco vermelho.
- Progresso por zona: barra de 0–16 pontos e "escudo" que se preenche.
- Micro-feedback: som opcional, contador de pontos animado, badge ao concluir cada fator
  ("Perímetro auditado"), e um "índice de exposição" que sobe/desce ao vivo.
- Navegação livre entre zonas já iniciadas, retomada do progresso salva no navegador.
- Mobile: mesma cena em qualidade reduzida, HUD vira painel inferior; se o dispositivo
  não suportar WebGL, cai automaticamente para uma versão isométrica em SVG animado.

## Captura do lead e resultado

- Formulário de identificação (nome do condomínio, síndico, e-mail, telefone, data)
  aparece **depois** das 48 perguntas, como "desbloqueio do resultado", com validação Zod.
- Envio para o webhook externo que você fornecer (Make/Zapier/n8n/CRM), com o payload:
  identificação, respostas item a item, pontuação por fator, total /96 e fator mais fraco.
- Tela final: nota geral, medidor dos 6 fatores em radar simplificado, destaque do fator
  mais frágil com uma frase de diagnóstico — sem abrir o relatório completo — e CTA
  "Falar com um especialista MAGAV" via WhatsApp e e-mail.

## Identidade

Paleta tirada do logotipo: verde-escuro petróleo, verde-esmeralda, areia/dourado e
cinza-sálvia, sobre fundo escuro (leitura de "sala de controle"). Logo MAGAV no topo e na
tela final. Tipografia geométrica, cantos suaves, movimento contido e profissional.

## Detalhes técnicos

- React Three Fiber + drei para a cena low-poly (primitivas geométricas, sem modelos
  externos), carregada só no cliente via `ClientOnly` + `React.lazy`; fallback SVG.
- Estado do diagnóstico em store local + `localStorage`; cálculo de pontuação no cliente.
- Envio do lead via `createServerFn` que repassa ao webhook, com a URL guardada como
  secret no projeto (nada de webhook exposto no navegador). Sem banco de dados.
- Tokens de cor em `src/styles.css` (oklch), logo publicado como asset CDN.
- Rota única `/` com etapas internas; `head()` com título/descrição próprios.

## O que preciso de você

1. A URL do webhook (posso pedir como secret na hora de implementar).
2. Número de WhatsApp e e-mail de contato da MAGAV.
