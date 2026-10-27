import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

// Called weekly by an external scheduler (e.g. cron-job.org) so the Supabase free tier never pauses.
// Read-only, returns no data.
export const Route = createFileRoute("/api/public/keepalive")({
  server: {
    handlers: {
      GET: async () => {
        const url = process.env["SUPABASE_URL"];
        const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
        if (!url || !key) return Response.json({ ok: false, motivo: "supabase-nao-configurado" }, { status: 503 });
        try {
          const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
          const { error } = await supabase.from("leads").select("id", { head: true, count: "exact" }).limit(1);
          if (error) return Response.json({ ok: false, motivo: "erro-consulta" }, { status: 500 });
          return Response.json({ ok: true, em: new Date().toISOString() });
        } catch {
          return Response.json({ ok: false, motivo: "indisponivel" }, { status: 500 });
        }
      },
    },
  },
});
