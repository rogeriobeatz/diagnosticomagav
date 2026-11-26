import { createFileRoute } from "@tanstack/react-router";

import ExperienciaDiagnostico from "@/components/condo/ExperienciaDiagnostico";
import compartilhamento from "@/assets/diagnostico-magav-compartilhamento.png.asset.json";

const TITULO = "Diagnóstico 3D de Segurança Condominial | Grupo MAGAV";
const DESCRICAO =
  "Ferramenta interativa para síndicos e gestores: responda 48 perguntas em uma maquete 3D do condomínio e descubra o ponto crítico da sua segurança.";
const IMAGEM = `https://diagnosticomagav.lovable.app${compartilhamento.url}`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESCRICAO },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESCRICAO },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: IMAGEM },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Diagnóstico interativo de segurança condominial do Grupo MAGAV" },
      { name: "twitter:image", content: IMAGEM },
    ],
  }),
  component: Index,
});

function Index() {
  return <ExperienciaDiagnostico />;
}
