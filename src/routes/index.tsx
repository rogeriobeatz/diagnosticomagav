import { createFileRoute } from "@tanstack/react-router";

import ExperienciaDiagnostico from "@/components/condo/ExperienciaDiagnostico";

const TITULO = "Diagnóstico 3D de Segurança Condominial | Grupo MAGAV";
const DESCRICAO =
  "Ferramenta interativa para síndicos e gestores: responda 48 perguntas em uma maquete 3D do condomínio e descubra o ponto crítico da sua segurança.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESCRICAO },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESCRICAO },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <ExperienciaDiagnostico />;
}
