import { createClient } from "@/lib/supabase-server";
import Link from "next/link";

export default async function EquiposPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error: errorParam } = await searchParams;
    const supabase = await createClient();

    // RLS ya filtra: solo se ven los equipos a los que el usuario pertenece
    // o administra (política equipos_lectura_miembros).
    const { data: equipos } = await supabase
        .from("equipos")
        .select("id, nombre, codigo, estado, zona_horaria, responsable:responsable_id(nombre, apellido)")
        .order("nombre", { ascending: true });

    return (
        <section className="max-w-4xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-display text-2xl font-bold text-foreground">Equipos</h1>
                    <p className="text-muted-foreground text-sm">
                        Equipos a los que perteneces o administras
                    </p>
                </div>
                <Link
                    href="/dashboard/equipos/nuevo"
                    className="bg-gradient-accent text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                    + Nuevo equipo
                </Link>
            </div>

            {errorParam && (
                <p className="bg-critical/10 border border-critical/40 text-critical text-sm rounded-lg px-4 py-3 mb-4">
                    {errorParam}
                </p>
            )}

            <div className="panel overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-surface-raised text-muted-foreground text-xs uppercase tracking-wide">
                        <tr>
                            <th className="text-left px-4 py-3">Código</th>
                            <th className="text-left px-4 py-3">Nombre</th>
                            <th className="text-left px-4 py-3">Responsable</th>
                            <th className="text-left px-4 py-3">Zona horaria</th>
                            <th className="text-left px-4 py-3">Estado</th>
                            <th className="text-left px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {(equipos ?? []).map((e: any) => (
                            <tr key={e.id} className="border-t border-border hover:bg-secondary/40">
                                <td className="px-4 py-3 text-foreground font-medium">{e.codigo}</td>
                                <td className="px-4 py-3 text-foreground">{e.nombre}</td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {e.responsable
                                        ? `${e.responsable.nombre} ${e.responsable.apellido}`
                                        : "Sin asignar"}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{e.zona_horaria}</td>
                                <td className="px-4 py-3">
                                    <span
                                        className={
                                            e.estado === "activo" ? "text-success" : "text-muted-foreground"
                                        }
                                    >
                                        {e.estado}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Link
                                        href={`/dashboard/equipos/${e.id}/editar`}
                                        className="text-primary hover:underline text-xs font-semibold"
                                    >
                                        Editar
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {(equipos ?? []).length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                    Todavía no perteneces a ningún equipo.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
