import { createClient } from "@/lib/supabase-server";
import { obtenerHoraEnZona, formatearEnZona } from "@/lib/timezonedb";
import Link from "next/link";

const ESTADO_COLOR: Record<string, string> = {
    "No iniciada": "text-muted-foreground",
    "En proceso": "text-cyan",
    "Finalizada · En plazo": "text-success",
    "Finalizada · Fuera de plazo": "text-warning",
    "Vencida / No realizada": "text-critical",
    Cancelada: "text-muted-foreground",
};

export default async function DashboardPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from("profiles")
        .select("nombre, apellido, zona_horaria")
        .eq("id", user!.id)
        .single();

    // La vista revisiones_estado ya calcula estado y cumplimiento en SQL
    const { data: revisiones } = await supabase
        .from("revisiones_estado")
        .select("id, codigo, titulo, estado, fecha_fin_plazo, zona_horaria_plazo, equipos(nombre)")
        .order("fecha_fin_plazo", { ascending: true });

    const conteo = (revisiones ?? []).reduce<Record<string, number>>((acc, r) => {
        acc[r.estado] = (acc[r.estado] ?? 0) + 1;
        return acc;
    }, {});

    const zona = profile?.zona_horaria ?? "America/Guayaquil";
    const { data: horaZona, error: errorZona } = await obtenerHoraEnZona(zona);

    const kpis = [
        { label: "Total", value: revisiones?.length ?? 0 },
        { label: "No iniciada", value: conteo["No iniciada"] ?? 0 },
        { label: "En proceso", value: conteo["En proceso"] ?? 0 },
        { label: "Finalizada en plazo", value: conteo["Finalizada · En plazo"] ?? 0 },
        { label: "Fuera de plazo", value: conteo["Finalizada · Fuera de plazo"] ?? 0 },
        { label: "Vencidas", value: conteo["Vencida / No realizada"] ?? 0 },
    ];

    return (
        <section className="max-w-6xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-display text-2xl font-bold text-foreground">
                        Hola, {profile?.nombre ?? "usuario"}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Resumen de revisiones según tu alcance
                    </p>
                </div>
                <Link
                    href="/dashboard/revisiones/nueva"
                    className="bg-gradient-accent text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                    + Nueva revisión
                </Link>
            </div>

            {/* Widget que consume la API externa TimeZoneDB */}
            <div className="panel p-4 mb-8 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Hora actual en tu zona ({zona})</span>
                {horaZona ? (
                    <span className="font-mono text-cyan">
                        {horaZona.formatted} ({horaZona.abbreviation})
                    </span>
                ) : (
                    <span className="text-warning">
                        No se pudo obtener la hora desde TimeZoneDB{errorZona ? ` — ${errorZona}` : ""}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
                {kpis.map((k) => (
                    <div key={k.label} className="panel p-4">
                        <p className="text-2xl font-display font-bold text-foreground">{k.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{k.label}</p>
                    </div>
                ))}
            </div>

            <div className="panel overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-surface-raised text-muted-foreground text-xs uppercase tracking-wide">
                        <tr>
                            <th className="text-left px-4 py-3">Código</th>
                            <th className="text-left px-4 py-3">Título</th>
                            <th className="text-left px-4 py-3">Equipo</th>
                            <th className="text-left px-4 py-3">Plazo (fin)</th>
                            <th className="text-left px-4 py-3">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(revisiones ?? []).map((r: any) => (
                            <tr key={r.id} className="border-t border-border hover:bg-secondary/40">
                                <td className="px-4 py-3">
                                    <Link href={`/dashboard/revisiones/${r.id}`} className="text-primary hover:underline">
                                        {r.codigo}
                                    </Link>
                                </td>
                                <td className="px-4 py-3 text-foreground">{r.titulo}</td>
                                <td className="px-4 py-3 text-muted-foreground">{r.equipos?.nombre}</td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {formatearEnZona(r.fecha_fin_plazo, r.zona_horaria_plazo)}
                                </td>
                                <td className={`px-4 py-3 font-medium ${ESTADO_COLOR[r.estado] ?? ""}`}>
                                    {r.estado}
                                </td>
                            </tr>
                        ))}
                        {(revisiones ?? []).length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                    Todavía no tienes revisiones visibles en tu alcance.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
