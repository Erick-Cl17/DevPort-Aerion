import { createClient } from "@/lib/supabase-server";
import { obtenerContextoUsuario } from "@/lib/data";
import { registrarAuditoria } from "@/lib/auditoria";
import { redirect, notFound } from "next/navigation";

export default async function EditarEquipoPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ error?: string }>;
}) {
    const { id } = await params;
    const { error: errorParam } = await searchParams;
    const supabase = await createClient();
    const { profile } = await obtenerContextoUsuario();

    const { data: equipo } = await supabase.from("equipos").select("*").eq("id", id).single();
    if (!equipo) notFound();

    const { data: usuarios } = await supabase
        .from("profiles")
        .select("id, nombre, apellido")
        .eq("organizacion_id", equipo.organizacion_id);

    async function actualizarEquipo(formData: FormData) {
        "use server";
        const supabase = await createClient();
        const { user } = await obtenerContextoUsuario();

        const nombre = ((formData.get("nombre") as string) ?? "").trim();
        const zonaHoraria = ((formData.get("zona_horaria") as string) ?? "").trim();
        const responsableId = ((formData.get("responsable_id") as string) ?? "").trim();

        if (!nombre || !zonaHoraria) {
            redirect(
                `/dashboard/equipos/${id}/editar?error=${encodeURIComponent(
                    "Nombre y zona horaria son obligatorios"
                )}`
            );
        }

        const { error } = await supabase
            .from("equipos")
            .update({
                nombre,
                zona_horaria: zonaHoraria,
                responsable_id: responsableId || null,
            })
            .eq("id", id);

        if (error) {
            redirect(`/dashboard/equipos/${id}/editar?error=${encodeURIComponent(error.message)}`);
        }

        await registrarAuditoria({
            actorId: user!.id,
            accion: "actualizar_equipo",
            recurso: "equipos",
            recursoId: id,
            contexto: { nombre, zonaHoraria },
        });

        redirect("/dashboard/equipos");
    }

    async function alternarEstado() {
        "use server";
        const supabase = await createClient();
        const { user } = await obtenerContextoUsuario();

        const { data: actual } = await supabase.from("equipos").select("estado").eq("id", id).single();
        const nuevoEstado = actual?.estado === "activo" ? "inactivo" : "activo";

        await supabase.from("equipos").update({ estado: nuevoEstado }).eq("id", id);

        await registrarAuditoria({
            actorId: user!.id,
            accion: nuevoEstado === "activo" ? "reactivar_equipo" : "desactivar_equipo",
            recurso: "equipos",
            recursoId: id,
        });

        redirect("/dashboard/equipos");
    }

    return (
        <section className="max-w-xl mx-auto px-6 py-10">
            <h1 className="font-display text-2xl font-bold text-foreground mb-6">
                Editar equipo · {equipo.codigo}
            </h1>

            {errorParam && (
                <p className="bg-critical/10 border border-critical/40 text-critical text-sm rounded-lg px-4 py-3 mb-4">
                    {errorParam}
                </p>
            )}

            <form action={actualizarEquipo} className="panel p-6 flex flex-col gap-4 mb-4">
                <input
                    name="nombre"
                    required
                    defaultValue={equipo.nombre}
                    className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border"
                />
                <input
                    name="zona_horaria"
                    required
                    defaultValue={equipo.zona_horaria}
                    className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border"
                />
                <select
                    name="responsable_id"
                    defaultValue={equipo.responsable_id ?? ""}
                    className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border"
                >
                    <option value="">Sin responsable</option>
                    {(usuarios ?? []).map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.nombre} {u.apellido}
                        </option>
                    ))}
                </select>
                <button
                    type="submit"
                    className="bg-gradient-accent text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                    Guardar cambios
                </button>
            </form>

            <form action={alternarEstado}>
                <button
                    type="submit"
                    className={`w-full border text-sm font-semibold py-3 rounded-lg transition-colors ${
                        equipo.estado === "activo"
                            ? "border-critical text-critical hover:bg-critical/10"
                            : "border-success text-success hover:bg-success/10"
                    }`}
                >
                    {equipo.estado === "activo" ? "Desactivar equipo" : "Reactivar equipo"}
                </button>
            </form>
        </section>
    );
}
