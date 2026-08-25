import { createClient } from "@/lib/supabase-server";

export default async function ReportesPage() {
    const supabase = await createClient();

    // Ya viene filtrado por RLS: solo equipos a los que el usuario pertenece.
    const { data: revisiones } = await supabase
        .from("revisiones_estado")
        .select("estado, cumplimiento, equipos(nombre)");

    const porEquipo = (revisiones ?? []).reduce<
        Record<string, { total: number; enPlazo: number; fueraPlazo: number; pendientes: number }>
    >((acc, r: any) => {
        const nombre = r.equipos?.nombre ?? "Sin equipo";
        acc[nombre] = acc[nombre] ?? { total: 0, enPlazo: 0, fueraPlazo: 0, pendientes: 0 };
        acc[nombre].total += 1;
        if (r.cumplimiento === "En plazo") acc[nombre].enPlazo += 1;
        else if (r.cumplimiento === "Fuera de plazo") acc[nombre].fueraPlazo += 1;
        else acc[nombre].pendientes += 1;
        return acc;
    }, {});

    const filas = Object.entries(porEquipo);

    return (
        <section className="max-w-4xl mx-auto px-6 py-10">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                Reporte de cumplimiento
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
                Revisiones finalizadas en plazo vs. fuera de plazo, por equipo
            </p>

            <div className="panel overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-surface-raised text-muted-foreground text-xs uppercase tracking-wide">
                        <tr>
                            <th className="text-left px-4 py-3">Equipo</th>
                            <th className="text-left px-4 py-3">Total</th>
                            <th className="text-left px-4 py-3">En plazo</th>
                            <th className="text-left px-4 py-3">Fuera de plazo</th>
                            <th className="text-left px-4 py-3">Pendientes/vencidas</th>
                            <th className="text-left px-4 py-3">% cumplimiento</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filas.map(([equipo, r]) => {
                            const finalizadas = r.enPlazo + r.fueraPlazo;
                            const porcentaje = finalizadas > 0 ? Math.round((r.enPlazo / finalizadas) * 100) : null;
                            return (
                                <tr key={equipo} className="border-t border-border">
                                    <td className="px-4 py-3 text-foreground font-medium">{equipo}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{r.total}</td>
                                    <td className="px-4 py-3 text-success">{r.enPlazo}</td>
                                    <td className="px-4 py-3 text-warning">{r.fueraPlazo}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{r.pendientes}</td>
                                    <td className="px-4 py-3 text-cyan font-semibold">
                                        {porcentaje !== null ? `${porcentaje}%` : "—"}
                                    </td>
                                </tr>
                            );
                        })}
                        {filas.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                    Todavía no hay revisiones para reportar.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
              </div>
            </div>
        </section>
    );
}
