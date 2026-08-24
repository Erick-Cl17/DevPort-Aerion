import { createClient } from "@/lib/supabase-server";

export default async function AuditoriaPage() {
    const supabase = await createClient();

    // La política RLS auditoria_lectura_admin ya limita esto a superadmin
    // o a las propias acciones del usuario — no hace falta filtrar aquí.
    const { data: registros } = await supabase
        .from("auditoria")
        .select("accion, recurso, resultado, fecha_hora, actor:actor_id(nombre, apellido)")
        .order("fecha_hora", { ascending: false })
        .limit(100);

    return (
        <section className="max-w-4xl mx-auto px-6 py-10">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Auditoría</h1>
            <p className="text-muted-foreground text-sm mb-8">
                Últimas 100 acciones registradas (solo ves las tuyas, salvo que seas Superadmin)
            </p>

            <div className="panel divide-y divide-border">
                {(registros ?? []).map((r: any, i: number) => (
                    <div key={i} className="px-4 py-3 flex items-center justify-between text-sm">
                        <div>
                            <p className="text-foreground">
                                <span className="font-medium">{r.actor?.nombre} {r.actor?.apellido}</span>{" "}
                                <span className="text-muted-foreground">— {r.accion} en {r.recurso}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={r.resultado === "exito" ? "text-success text-xs" : "text-critical text-xs"}>
                                {r.resultado}
                            </span>
                            <span className="text-muted-foreground text-xs">
                                {new Date(r.fecha_hora).toLocaleString("es-EC")}
                            </span>
                        </div>
                    </div>
                ))}
                {(registros ?? []).length === 0 && (
                    <p className="px-4 py-8 text-center text-muted-foreground text-sm">
                        No hay registros de auditoría visibles todavía.
                    </p>
                )}
            </div>
        </section>
    );
}
