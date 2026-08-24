import { createClient } from "@/lib/supabase-server";
import { obtenerContextoUsuario } from "@/lib/data";
import { registrarAuditoria } from "@/lib/auditoria";
import { redirect } from "next/navigation";

const NIVELES = [
    "superadmin",
    "admin_organizacion",
    "admin_equipo",
    "supervisor",
    "revisor",
    "consulta",
];

export default async function RolesPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error: errorParam } = await searchParams;
    const supabase = await createClient();

    const { data: roles } = await supabase
        .from("roles")
        .select("id, nombre, nivel, estado")
        .order("nivel");

    async function crearRol(formData: FormData) {
        "use server";
        const supabase = await createClient();
        const { profile, user } = await obtenerContextoUsuario();

        const nombre = ((formData.get("nombre") as string) ?? "").trim();
        const nivel = ((formData.get("nivel") as string) ?? "").trim();

        if (!nombre || !nivel || !profile?.organizacion_id) {
            redirect("/dashboard/roles?error=" + encodeURIComponent("Nombre y nivel son obligatorios"));
        }

        const { data: nuevo, error } = await supabase
            .from("roles")
            .insert({
                organizacion_id: profile!.organizacion_id,
                nombre,
                nivel,
            })
            .select("id")
            .single();

        if (error) {
            redirect(`/dashboard/roles?error=${encodeURIComponent(error.message)}`);
        }

        await registrarAuditoria({
            actorId: user!.id,
            accion: "crear_rol",
            recurso: "roles",
            recursoId: nuevo?.id,
            contexto: { nombre, nivel },
        });

        redirect("/dashboard/roles");
    }

    return (
        <section className="max-w-3xl mx-auto px-6 py-10">
            <h1 className="font-display text-2xl font-bold text-foreground mb-6">Roles</h1>

            {errorParam && (
                <p className="bg-critical/10 border border-critical/40 text-critical text-sm rounded-lg px-4 py-3 mb-4">
                    {errorParam}
                </p>
            )}

            <form action={crearRol} className="panel p-4 flex flex-col sm:flex-row gap-3 mb-6">
                <input
                    name="nombre"
                    required
                    placeholder="Nombre del rol"
                    className="flex-1 bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border"
                />
                <select
                    name="nivel"
                    required
                    className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border"
                >
                    <option value="">Nivel…</option>
                    {NIVELES.map((n) => (
                        <option key={n} value={n}>
                            {n}
                        </option>
                    ))}
                </select>
                <button
                    type="submit"
                    className="bg-gradient-accent text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 shrink-0"
                >
                    + Agregar
                </button>
            </form>

            <div className="panel divide-y divide-border">
                {(roles ?? []).map((r) => (
                    <div key={r.id} className="px-4 py-3 flex justify-between text-sm">
                        <p className="text-foreground font-medium">{r.nombre}</p>
                        <span className="text-cyan font-mono text-xs">{r.nivel}</span>
                    </div>
                ))}
                {(roles ?? []).length === 0 && (
                    <p className="px-4 py-8 text-center text-muted-foreground text-sm">
                        Todavía no hay roles creados.
                    </p>
                )}
            </div>
        </section>
    );
}
