import { createClient } from "@/lib/supabase-server";
import { obtenerContextoUsuario } from "@/lib/data";
import { registrarAuditoria } from "@/lib/auditoria";
import { redirect } from "next/navigation";

export default async function NuevoEquipoPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error: errorParam } = await searchParams;
    const supabase = await createClient();
    const { profile } = await obtenerContextoUsuario();

    // Posibles responsables: usuarios de la misma organización.
    const { data: usuarios } = await supabase
        .from("profiles")
        .select("id, nombre, apellido")
        .eq("organizacion_id", profile?.organizacion_id ?? "");

    async function crearEquipo(formData: FormData) {
        "use server";

        const supabase = await createClient();
        const { profile, user } = await obtenerContextoUsuario();

        const nombre = ((formData.get("nombre") as string) ?? "").trim();
        const codigo = ((formData.get("codigo") as string) ?? "").trim().toUpperCase();
        const zonaHoraria = ((formData.get("zona_horaria") as string) ?? "").trim();
        const responsableId = ((formData.get("responsable_id") as string) ?? "").trim();

        // Igual que en el resto de formularios: el servidor vuelve a exigir
        // los campos obligatorios, no solo el atributo required del navegador.
        if (!nombre || !codigo || !zonaHoraria || !profile?.organizacion_id) {
            redirect(
                "/dashboard/equipos/nuevo?error=" +
                    encodeURIComponent("Nombre, código y zona horaria son obligatorios")
            );
        }

        const { data: nuevo, error } = await supabase
            .from("equipos")
            .insert({
                organizacion_id: profile!.organizacion_id,
                nombre,
                codigo,
                zona_horaria: zonaHoraria,
                responsable_id: responsableId || null,
            })
            .select("id")
            .single();

        if (error) {
            // La política RLS (equipos_admin_org_escribe) rechaza el insert si
            // el usuario no es admin de organización
            redirect(`/dashboard/equipos/nuevo?error=${encodeURIComponent(error.message)}`);
        }

        await registrarAuditoria({
            actorId: user!.id,
            accion: "crear_equipo",
            recurso: "equipos",
            recursoId: nuevo?.id,
            contexto: { nombre, codigo },
        });

        redirect("/dashboard/equipos");
    }

    return (
        <section className="max-w-xl mx-auto px-6 py-10">
            <h1 className="font-display text-2xl font-bold text-foreground mb-6">Nuevo equipo</h1>

            {errorParam && (
                <p className="bg-critical/10 border border-critical/40 text-critical text-sm rounded-lg px-4 py-3 mb-4">
                    {errorParam}
                </p>
            )}

            <form action={crearEquipo} className="panel p-6 flex flex-col gap-4">
                <input
                    name="nombre"
                    required
                    placeholder="Nombre del equipo"
                    className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border"
                />
                <input
                    name="codigo"
                    required
                    placeholder="Código corto (ej: ALPHA)"
                    className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border"
                />
                <input
                    name="zona_horaria"
                    required
                    defaultValue="America/Guayaquil"
                    placeholder="Zona horaria IANA (ej: America/Guayaquil)"
                    className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border"
                />
                <select
                    name="responsable_id"
                    className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border"
                >
                    <option value="">Sin responsable por ahora</option>
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
                    Crear equipo
                </button>
            </form>
        </section>
    );
}
