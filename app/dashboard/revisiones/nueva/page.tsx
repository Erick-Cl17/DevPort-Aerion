import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function NuevaRevisionPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Los equipos y usuarios que devuelve esto ya vienen filtrados por RLS
    const { data: equipos } = await supabase.from("equipos").select("id, nombre, zona_horaria");
    const { data: usuarios } = await supabase.from("profiles").select("id, nombre, apellido");

    async function crearRevision(formData: FormData) {
        "use server";

        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) redirect("/login");

        const equipoId = formData.get("equipo_id") as string;
        const equipo = (await supabase.from("equipos").select("zona_horaria").eq("id", equipoId).single()).data;

        const { data: nueva, error } = await supabase
            .from("revisiones")
            .insert({
                codigo: formData.get("codigo") as string,
                titulo: formData.get("titulo") as string,
                descripcion: formData.get("descripcion") as string,
                equipo_id: equipoId,
                responsable_id: formData.get("responsable_id") as string,
                creado_por: user!.id,
                fecha_inicio_plazo: formData.get("fecha_inicio") as string,
                fecha_fin_plazo: formData.get("fecha_fin") as string,
                zona_horaria_plazo: equipo?.zona_horaria ?? "America/Guayaquil",
            })
            .select("id")
            .single();

        if (error) {
            redirect(`/dashboard/revisiones/nueva?error=${encodeURIComponent(error.message)}`);
        }

        // Traza del evento de creación (sección 20 del documento)
        await supabase.from("revision_eventos").insert({
            revision_id: nueva!.id,
            tipo_evento: "creacion",
            actor_id: user!.id,
        });

        redirect(`/dashboard/revisiones/${nueva!.id}`);
    }

    return (
        <section className="max-w-2xl mx-auto px-6 py-10">
            <h1 className="font-display text-2xl font-bold text-foreground mb-6">
                Nueva revisión
            </h1>

            <form action={crearRevision} className="panel p-6 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                    <input
                        name="codigo"
                        required
                        placeholder="Código (ej: REV-001)"
                        className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border"
                    />
                    <select
                        name="equipo_id"
                        required
                        className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border"
                    >
                        <option value="">Equipo…</option>
                        {(equipos ?? []).map((e) => (
                            <option key={e.id} value={e.id}>
                                {e.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <input
                    name="titulo"
                    required
                    placeholder="Título"
                    className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border"
                />
                <textarea
                    name="descripcion"
                    placeholder="Descripción (opcional)"
                    className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border"
                    rows={3}
                />

                <select
                    name="responsable_id"
                    required
                    className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border"
                >
                    <option value="">Responsable…</option>
                    {(usuarios ?? []).map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.nombre} {u.apellido}
                        </option>
                    ))}
                </select>

                <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                        Inicio del plazo
                        <input
                            type="datetime-local"
                            name="fecha_inicio"
                            required
                            className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border"
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                        Fin del plazo
                        <input
                            type="datetime-local"
                            name="fecha_fin"
                            required
                            className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border"
                        />
                    </label>
                </div>

                <button
                    type="submit"
                    className="bg-gradient-accent text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                    Crear revisión
                </button>
            </form>
        </section>
    );
}
