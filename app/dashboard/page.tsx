import { createClient } from "@/lib/supabase-server";
import { obtenerContextoUsuario } from "@/lib/data";
import { obtenerHoraEnZona } from "@/lib/timezonedb";
import { formatearEnZona } from "@/lib/fechas";
import { obtenerPosicionISS, obtenerAstronautas } from "@/lib/opennotify";
import FiltroRevisiones from "@/components/FiltroRevisiones";
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
    const { profile } = await obtenerContextoUsuario();

    // (ver AERION_Script_SQL.sql) — aquí solo se agrupa para el KPI, sin
    // volver a pedir el usuario ni el perfil (ya vinieron del contexto).
    const { data: revisiones } = await supabase
        .from("revisiones_estado")
        .select("id, codigo, titulo, estado, fecha_fin_plazo, zona_horaria_plazo, equipos(nombre)")
        .order("fecha_fin_plazo", { ascending: true });

    const conteo = (revisiones ?? []).reduce<Record<string, number>>((acc, r) => {
        acc[r.estado] = (acc[r.estado] ?? 0) + 1;
        return acc;
    }, {});

    const zona = profile?.zona_horaria ?? "America/Guayaquil";

    // Ejecutar las 3 llamadas a APIs externas en paralelo (no secuencial)
    // Esto reduce el tiempo total de carga significativamente
    const [horaZonaResult, issResult, astrosResult] = await Promise.allSettled([
        obtenerHoraEnZona(zona),
        obtenerPosicionISS(),
        obtenerAstronautas(),
    ]);

    const horaZona = horaZonaResult.status === "fulfilled" ? horaZonaResult.value.data : null;
    const errorZona = horaZonaResult.status === "fulfilled" ? horaZonaResult.value.error : "Error al conectar";
    
    const iss = issResult.status === "fulfilled" ? issResult.value.data : null;
    const errorIss = issResult.status === "fulfilled" ? issResult.value.error : "Error al conectar";
    
    const astros = astrosResult.status === "fulfilled" ? astrosResult.value.data : null;

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="panel p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm">
                <span className="text-muted-foreground">Hora actual en tu zona ({zona})</span>
                {horaZona ? (
                    <span className="font-mono text-cyan">
                        {horaZona.formatted} ({horaZona.abbreviation})
                    </span>
                ) : (
                    <span className="text-warning text-xs sm:text-sm">
                        No se pudo obtener la hora desde TimeZoneDB{errorZona ? ` — ${errorZona}` : ""}
                    </span>
                )}
            </div>

            <div className="panel p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm">
                <span className="text-muted-foreground">Estación Espacial Internacional</span>
                {iss ? (
                    <span className="font-mono text-cyan">
                        {iss.latitud.toFixed(2)}°, {iss.longitud.toFixed(2)}°
                        {astros ? ` · ${astros.numero} en órbita` : ""}
                    </span>
                ) : (
                    <span className="text-warning text-xs sm:text-sm">
                        No se pudo contactar a Open Notify{errorIss ? ` — ${errorIss}` : ""}
                    </span>
                )}
            </div>
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
                <FiltroRevisiones revisiones={(revisiones ?? []) as any} />
            </div>
        </section>
    );
}
