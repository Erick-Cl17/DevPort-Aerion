import { createClient } from "@/lib/supabase-server";
import { obtenerContextoUsuario } from "@/lib/data";
import { registrarAuditoria } from "@/lib/auditoria";
import { redirect } from "next/navigation";

export default async function CargosPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error: errorParam } = await searchParams;
    const supabase = await createClient();
    const { profile } = await obtenerContextoUsuario();

    const { data: cargos } = await supabase
        .from("cargos")
        .select("id, nombre, descripcion, estado")
        .order("nombre");

    async function crearCargo(formData: FormData) {
        "use server";
        const supabase = await createClient();
        const { profile, user } = await obtenerContextoUsuario();

        const nombre = ((formData.get("nombre") as string) ?? "").trim();
        const descripcion = ((formData.get("descripcion") as string) ?? "").trim();

        if (!nombre || !profile?.organizacion_id) {
            redirect("/dashboard/cargos?error=" + encodeURIComponent("El nombre es obligatorio"));
        }

        const { data: nuevo, error } = await supabase
            .from("cargos")
            .insert({
                organizacion_id: profile!.organizacion_id,
                nombre,
                descripcion: descripcion || null,
            })
            .select("id")
            .single();

        if (error) {
            redirect(`/dashboard/cargos?error=${encodeURIComponent(error.message)}`);
        }

        await registrarAuditoria({
            actorId: user!.id,
            accion: "crear_cargo",
            recurso: "cargos",
            recursoId: nuevo?.id,
            contexto: { nombre },
        });

        redirect("/dashboard/cargos");
    }

    return (
        <section className="max-w-3xl mx-auto px-6 py-10">
            <h1 className="font-display text-2xl font-bold text-foreground mb-6">Cargos</h1>

            {errorParam && (
                <p className="bg-critical/10 border border-critical/40 text-critical text-sm rounded-lg px-4 py-3 mb-4">
                    {errorParam}
                </p>
            )}

            <form action={crearCargo} className="panel p-4 flex flex-col sm:flex-row gap-3 mb-6">
                <input
                    name="nombre"
                    required
                    placeholder="Nombre del cargo (ej: Coordinador)"
                    className="flex-1 bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border"
                />
                <input
                    name="descripcion"
                    placeholder="Descripción (opcional)"
                    className="flex-1 bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border"
                />
                <button
                    type="submit"
                    className="bg-gradient-accent text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 shrink-0"
                >
                    + Agregar
                </button>
            </form>

            <div className="panel divide-y divide-border">
                {(cargos ?? []).map((c) => (
                    <div key={c.id} className="px-4 py-3 flex justify-between text-sm">
                        <div>
                            <p className="text-foreground font-medium">{c.nombre}</p>
                            {c.descripcion && <p className="text-muted-foreground text-xs">{c.descripcion}</p>}
                        </div>
                        <span className={c.estado === "activo" ? "text-success" : "text-muted-foreground"}>
                            {c.estado}
                        </span>
                    </div>
                ))}
                {(cargos ?? []).length === 0 && (
                    <p className="px-4 py-8 text-center text-muted-foreground text-sm">
                        Todavía no hay cargos creados.
                    </p>
                )}
            </div>
        </section>
    );
}
