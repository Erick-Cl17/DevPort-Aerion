import { createClient } from "@/lib/supabase-server";

// Se llama desde cualquier Server Action que haga un cambio importante
// (crear, actualizar, desactivar). 
export async function registrarAuditoria(params: {
    actorId: string;
    accion: string;
    recurso: string;
    recursoId?: string;
    contexto?: Record<string, unknown>;
    resultado?: "exito" | "fallo";
}) {
    const supabase = await createClient();
    await supabase.from("auditoria").insert({
        actor_id: params.actorId,
        accion: params.accion,
        recurso: params.recurso,
        recurso_id: params.recursoId ?? null,
        contexto: params.contexto ?? null,
        resultado: params.resultado ?? "exito",
    });
}
