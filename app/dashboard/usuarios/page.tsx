import { createClient } from "@/lib/supabase-server";
import { obtenerContextoUsuario } from "@/lib/data";
import { registrarAuditoria } from "@/lib/auditoria";
import { redirect } from "next/navigation";
import Link from "next/link";
import BusquedaPantalla from "@/components/BusquedaPantalla";

export default async function UsuariosPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; q?: string }>;
}) {
    const { error: errorParam, q = "" } = await searchParams;
    const supabase = await createClient();
    const { profile } = await obtenerContextoUsuario();

    const { data: usuarios } = await supabase
        .from("profiles")
        .select("id, nombre, apellido, email, estado")
        .eq("organizacion_id", profile?.organizacion_id ?? "")
        .order("nombre")
        .ilike("nombre", `%${q}%`);

    const { data: asignaciones } = await supabase
        .from("asignaciones")
        .select("id, usuario_id, estado, equipos(nombre), roles(nombre, nivel), cargos(nombre)")
        .eq("estado", "activo");

    async function desactivarAsignacion(formData: FormData) {
        "use server";
        const supabase = await createClient();
        const { user } = await obtenerContextoUsuario();
        const asignacionId = formData.get("asignacion_id") as string;

        await supabase.from("asignaciones").update({ estado: "inactivo" }).eq("id", asignacionId);

        await registrarAuditoria({
            actorId: user!.id,
            accion: "desactivar_asignacion",
            recurso: "asignaciones",
            recursoId: asignacionId,
        });

        redirect("/dashboard/usuarios");
    }

    return (
        <section className="max-w-4xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-display text-2xl font-bold text-foreground">Usuarios</h1>
                    <p className="text-muted-foreground text-sm">Usuarios de tu organización y sus roles</p>
                </div>
                <Link
                    href="/dashboard/usuarios/asignar"
                    className="bg-gradient-accent text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                    + Asignar a equipo
                </Link>
            </div>

            {errorParam && (
                <p className="bg-critical/10 border border-critical/40 text-critical text-sm rounded-lg px-4 py-3 mb-4">
                    {errorParam}
                </p>
            )}

            <BusquedaPantalla placeholder="Buscar usuario por nombre" value={q} />

            <div className="panel divide-y divide-border">
                {(usuarios ?? []).map((u) => {
                    const propias = (asignaciones ?? []).filter((a: any) => a.usuario_id === u.id);
                    return (
                        <div key={u.id} className="px-4 py-3 text-sm">
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-foreground font-medium">
                                    {u.nombre} {u.apellido}
                                </p>
                                <span className="text-muted-foreground text-xs">{u.email}</span>
                            </div>
                            {propias.length === 0 ? (
                                <p className="text-muted-foreground text-xs">Sin asignaciones activas</p>
                            ) : (
                                <ul className="flex flex-wrap gap-2">
                                    {propias.map((a: any) => (
                                        <li
                                            key={a.id}
                                            className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center gap-2"
                                        >
                                            {a.equipos?.nombre} · {a.roles?.nombre}
                                            {a.cargos?.nombre ? ` · ${a.cargos.nombre}` : ""}
                                            <form action={desactivarAsignacion}>
                                                <input type="hidden" name="asignacion_id" value={a.id} />
                                                <button
                                                    type="submit"
                                                    className="text-critical hover:opacity-70"
                                                    title="Quitar asignación"
                                                >
                                                    ×
                                                </button>
                                            </form>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    );
                })}
                {(usuarios ?? []).length === 0 && (
                    <p className="px-4 py-8 text-center text-muted-foreground text-sm">
                        No hay usuarios en tu organización todavía.
                    </p>
                )}
            </div>
        </section>
    );
}
