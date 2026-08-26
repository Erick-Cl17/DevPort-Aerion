import { createClient } from "@/lib/supabase-server";
import { obtenerContextoUsuario } from "@/lib/data";
import BusquedaPantalla from "@/components/BusquedaPantalla";

const NIVEL_TONO = (n: number) =>
    n >= 15
        ? "bg-critical/35 text-critical border-critical/50"
        : n >= 9
          ? "bg-warning/20 text-warning border-warning/40"
          : n >= 4
            ? "bg-primary/20 text-primary border-primary/40"
            : "bg-success/15 text-success border-success/40";

const NIVEL_ESTADO_TONO: Record<string, string> = {
    Identificado: "text-primary",
    "En evaluación": "text-primary",
    Tratamiento: "text-warning",
    Mitigado: "text-success",
    Aceptado: "text-warning",
    Cerrado: "text-muted-foreground",
    Vencido: "text-critical",
};

export default async function SecurityCenterPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q = "" } = await searchParams;
    const { profile } = await obtenerContextoUsuario();
    const supabase = await createClient();
    const orgId = profile?.organizacion_id ?? "";

    const [{ data: riesgos }, { data: vulnerabilidades }, { data: actividad }] = await Promise.all([
            supabase
            .from("riesgos")
            .select("codigo, nombre, probabilidad, impacto, nivel_inherente, estado")
            .eq("organizacion_id", orgId)
            .ilike("nombre", `%${q}%`),
        supabase
            .from("vulnerabilidades")
            .select("severidad, estado")
            .eq("organizacion_id", orgId),
        supabase
            .from("auditoria")
            .select("accion, recurso, fecha_hora, actor:actor_id(nombre, apellido)")
            .in("accion", ["crear_riesgo", "crear_vulnerabilidad", "importar_json_riesgos"])
            .order("fecha_hora", { ascending: false })
            .limit(6),
    ]);

    const listaRiesgos = riesgos ?? [];
    const listaVulns = vulnerabilidades ?? [];

    // Matriz 5x5: fila = probabilidad (1..5), columna = impacto (1..5).
    // Cada celda cuenta cuántos riesgos reales caen ahí.
    const matriz = Array.from({ length: 5 }, () => Array(5).fill(0));
    for (const r of listaRiesgos) {
        const p = Math.min(5, Math.max(1, r.probabilidad));
        const i = Math.min(5, Math.max(1, r.impacto));
        matriz[p - 1][i - 1]++;
    }

    const nivelPromedio = listaRiesgos.length
        ? (listaRiesgos.reduce((acc, r) => acc + r.nivel_inherente, 0) / listaRiesgos.length).toFixed(1)
        : "0";
    const riesgosCriticos = listaRiesgos.filter((r) => r.nivel_inherente >= 15).length;
    const vulnsAbiertas = listaVulns.filter((v) => v.estado !== "Cerrada").length;

    const top5Riesgos = [...listaRiesgos]
        .sort((a, b) => b.nivel_inherente - a.nivel_inherente)
        .slice(0, 5);

    return (
        <section className="max-w-6xl mx-auto px-6 py-10 space-y-8">
            <div>
                <span className="label-mono">Centro de Seguridad</span>
                <h1 className="font-display text-2xl font-bold text-foreground mt-1">
                    Panorama de riesgos y vulnerabilidades
                </h1>
            </div>

            <BusquedaPantalla placeholder="Buscar riesgo por nombre" value={q} />

            {/* KPIs */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Kpi etiqueta="Riesgos registrados" valor={listaRiesgos.length} tono="text-primary" />
                <Kpi etiqueta="Nivel inherente promedio" valor={nivelPromedio} tono="text-warning" />
                <Kpi etiqueta="Riesgos críticos (≥15)" valor={riesgosCriticos} tono="text-critical" />
                <Kpi etiqueta="Vulnerabilidades abiertas" valor={vulnsAbiertas} tono="text-cyan" />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                {/* Matriz de riesgo */}
                <div className="panel p-6 overflow-x-auto">
                    <h2 className="font-display text-lg font-bold text-foreground mb-1">Matriz de riesgo</h2>
                    <p className="text-muted-foreground text-sm mb-4">Probabilidad × Impacto</p>

                    <div className="min-w-105">
                        <div className="grid grid-cols-[3rem_repeat(5,1fr)] gap-1.5">
                            <span />
                            {[1, 2, 3, 4, 5].map((i) => (
                                <span key={i} className="label-mono text-center">
                                    Imp. {i}
                                </span>
                            ))}
                            {[5, 4, 3, 2, 1].map((p) => (
                                <div key={p} className="col-span-6 grid grid-cols-[3rem_repeat(5,1fr)] gap-1.5">
                                    <span className="label-mono self-center text-right pr-1">P{p}</span>
                                    {[1, 2, 3, 4, 5].map((i) => {
                                        const cantidad = matriz[p - 1][i - 1];
                                        const nivel = p * i;
                                        return (
                                            <div
                                                key={i}
                                                className={`aspect-square rounded-lg border flex items-center justify-center font-mono text-sm font-bold ${NIVEL_TONO(nivel)}`}
                                                title={`Probabilidad ${p} · Impacto ${i} · ${cantidad} riesgo(s)`}
                                            >
                                                {cantidad > 0 ? cantidad : ""}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">
                        Cada celda muestra cuántos riesgos registrados caen en esa combinación de probabilidad e impacto.
                    </p>
                </div>

                {/* Registro crítico + actividad reciente */}
                <div className="space-y-6">
                    <div className="panel p-6">
                        <h2 className="font-display text-lg font-bold text-foreground mb-4">Registro crítico</h2>
                        <ul className="space-y-3">
                            {top5Riesgos.map((r) => (
                                <li key={r.codigo} className="border border-border rounded-lg p-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-mono text-xs text-muted-foreground">{r.codigo}</span>
                                        <span className={`text-xs font-semibold ${NIVEL_ESTADO_TONO[r.estado] ?? ""}`}>
                                            {r.estado}
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground mt-1">{r.nombre}</p>
                                </li>
                            ))}
                            {top5Riesgos.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Todavía no hay riesgos registrados —{" "}
                                    <a href="/dashboard/proyecto" className="text-cyan hover:opacity-80">
                                        agrégalos en Proyecto
                                    </a>
                                    .
                                </p>
                            )}
                        </ul>
                    </div>

                    <div className="panel p-6">
                        <h2 className="font-display text-lg font-bold text-foreground mb-4">Actividad reciente</h2>
                        <ol className="relative space-y-4 border-l border-border pl-4">
                            {(actividad ?? []).map((a: any, i: number) => (
                                <li key={i} className="relative">
                                    <span className="absolute top-1.5 -left-4.75 size-2 rounded-full bg-primary" />
                                    <p className="text-xs text-muted-foreground font-mono">
                                        {new Date(a.fecha_hora).toLocaleString("es-EC")} · {a.actor?.nombre}{" "}
                                        {a.actor?.apellido}
                                    </p>
                                    <p className="text-sm text-foreground mt-0.5">
                                        {a.accion} en {a.recurso}
                                    </p>
                                </li>
                            ))}
                            {(!actividad || actividad.length === 0) && (
                                <p className="text-sm text-muted-foreground">Sin actividad todavía.</p>
                            )}
                        </ol>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Kpi({ etiqueta, valor, tono }: { etiqueta: string; valor: string | number; tono: string }) {
    return (
        <div className="panel p-5">
            <p className="label-mono">{etiqueta}</p>
            <p className={`font-display text-3xl font-bold mt-2 ${tono}`}>{valor}</p>
        </div>
    );
}
