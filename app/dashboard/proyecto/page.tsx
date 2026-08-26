import { createClient } from "@/lib/supabase-server";
import { obtenerContextoUsuario } from "@/lib/data";
import { crearRiesgoManual, crearVulnerabilidadManual } from "./actions";
import ImportarJson from "./ImportarJson";
import Link from "next/link";
import BusquedaPantalla from "@/components/BusquedaPantalla";

const NIVEL_TONO = (n: number) =>
    n >= 15
        ? "bg-critical/20 text-critical"
        : n >= 9
          ? "bg-warning/20 text-warning"
          : n >= 4
            ? "bg-primary/20 text-primary"
            : "bg-success/20 text-success";

const SEVERIDAD_TONO: Record<string, string> = {
    Crítica: "bg-critical/20 text-critical",
    Alta: "bg-warning/20 text-warning",
    Media: "bg-primary/20 text-primary",
    Baja: "bg-success/20 text-success",
};

export default async function ProyectoPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; ok?: string; n?: string; q?: string; proyecto_id?: string }>;
}) {
    const { error, ok, n, q = "", proyecto_id: proyectoSeleccionado = "" } = await searchParams;
    const { profile } = await obtenerContextoUsuario();
    const supabase = await createClient();

    const [{ data: riesgos }, { data: vulnerabilidades }, { data: proyectos }] = await Promise.all([
        supabase
            .from("riesgos")
            .select("id, codigo, nombre, categoria, probabilidad, impacto, nivel_inherente, estado")
            .eq("organizacion_id", profile?.organizacion_id ?? "")
            .order("created_at", { ascending: false })
            .limit(20),
        supabase
            .from("vulnerabilidades")
            .select("id, codigo, nombre, categoria, severidad, estado")
            .eq("organizacion_id", profile?.organizacion_id ?? "")
            .order("created_at", { ascending: false })
            .limit(20),
        supabase
            .from("proyectos")
            .select("id, codigo, nombre")
            .eq("organizacion_id", profile?.organizacion_id ?? "")
            .order("nombre"),
    ]);

    return (
        <section className="max-w-5xl mx-auto px-6 py-10 space-y-8">
            <div>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">Evaluaciones</h1>
                <p className="text-muted-foreground text-sm">
                    Registra riesgos y vulnerabilidades a mano, o importa varios de una vez con un archivo JSON.
                </p>
            </div>

            {error && (
                <p className="bg-critical/10 border border-critical/40 text-critical text-sm rounded-lg px-4 py-3">
                    {error}
                </p>
            )}
            {ok === "riesgo" && (
                <p className="bg-success/10 border border-success/40 text-success text-sm rounded-lg px-4 py-3">
                    Riesgo registrado correctamente.
                </p>
            )}
            {ok === "vulnerabilidad" && (
                <p className="bg-success/10 border border-success/40 text-success text-sm rounded-lg px-4 py-3">
                    Vulnerabilidad registrada correctamente.
                </p>
            )}
            {ok === "import" && (
                <p className="bg-success/10 border border-success/40 text-success text-sm rounded-lg px-4 py-3">
                    Se importaron {n} registros correctamente.
                </p>
            )}

            <BusquedaPantalla placeholder="Buscar riesgo o vulnerabilidad" value={q} />

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Registro manual de riesgo */}
                <div className="panel p-6">
                    <h2 className="font-display text-lg font-bold text-foreground mb-4">Nuevo riesgo</h2>
                    <form action={crearRiesgoManual} className="space-y-3">
                        <SelectCampo label="Proyecto" name="proyecto_id" opciones={proyectos?.map((p) => p.id) ?? []} etiquetas={proyectos?.map((p) => `${p.codigo} · ${p.nombre}`) ?? []} valorInicial={proyectoSeleccionado} requerido />
                        <Campo label="Nombre" name="nombre" required />
                        <Campo label="Descripción" name="descripcion" textarea />
                        <div className="grid grid-cols-2 gap-3">
                            <Campo label="Categoría" name="categoria" placeholder="Ciberataques" />
                            <Campo label="Responsable" name="responsable" />
                            <Campo label="Activo afectado" name="activo" />
                            <Campo label="Amenaza" name="amenaza" />
                            <SelectCampo label="Probabilidad (1-5)" name="probabilidad" opciones={["1", "2", "3", "4", "5"]} valorInicial="3" />
                            <SelectCampo label="Impacto (1-5)" name="impacto" opciones={["1", "2", "3", "4", "5"]} valorInicial="3" />
                            <SelectCampo
                                label="Tratamiento"
                                name="tratamiento"
                                opciones={["Mitigar", "Aceptar", "Transferir", "Evitar"]}
                            />
                            <SelectCampo
                                label="Estado"
                                name="estado"
                                opciones={["Identificado", "En evaluación", "Tratamiento", "Mitigado", "Aceptado", "Cerrado"]}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-accent text-primary-foreground font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Guardar riesgo
                        </button>
                    </form>
                </div>

                {/* Registro manual de vulnerabilidad */}
                <div className="panel p-6">
                    <h2 className="font-display text-lg font-bold text-foreground mb-4">Nueva vulnerabilidad</h2>
                    <form action={crearVulnerabilidadManual} className="space-y-3">
                        <SelectCampo label="Proyecto" name="proyecto_id" opciones={proyectos?.map((p) => p.id) ?? []} etiquetas={proyectos?.map((p) => `${p.codigo} · ${p.nombre}`) ?? []} valorInicial={proyectoSeleccionado} requerido />
                        <Campo label="Nombre" name="nombre" required />
                        <Campo label="Descripción" name="descripcion" textarea />
                        <div className="grid grid-cols-2 gap-3">
                            <Campo label="Categoría" name="categoria" placeholder="Técnica" />
                            <Campo label="Activo afectado" name="activo_afectado" />
                            <SelectCampo
                                label="Severidad"
                                name="severidad"
                                opciones={["Crítica", "Alta", "Media", "Baja"]}
                                valorInicial="Media"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-accent text-primary-foreground font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Guardar vulnerabilidad
                        </button>
                    </form>
                </div>
            </div>

            {/* Importación masiva por JSON */}
            <div className="panel p-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-1">Importar desde JSON</h2>
                <p className="text-muted-foreground text-sm mb-4">
                    Para cargar varios riesgos o vulnerabilidades de una vez, en lugar de uno por uno.
                </p>
                <ImportarJson />
            </div>

            {/* Listados */}
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="panel p-6">
                    <h2 className="font-display text-lg font-bold text-foreground mb-4">
                        Riesgos registrados ({riesgos?.length ?? 0})
                    </h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {(riesgos ?? []).map((r) => (
                            <div key={r.id} className="flex items-center justify-between gap-3 border border-border rounded-lg px-3 py-2.5">
                                <div className="min-w-0">
                                    <Link href={`/dashboard/proyecto/riesgos/${r.id}/editar`} className="text-sm text-foreground truncate hover:text-cyan">
                                        {r.nombre}
                                    </Link>
                                    <p className="text-xs text-muted-foreground font-mono">{r.codigo} · {r.estado}</p>
                                </div>
                                <Link href={`/dashboard/proyecto/riesgos/${r.id}/editar`} className={`shrink-0 rounded px-2 py-1 text-xs font-bold font-mono ${NIVEL_TONO(r.nivel_inherente)} hover:opacity-80`}>
                                    Editar · {r.nivel_inherente}
                                </Link>
                            </div>
                        ))}
                        {(!riesgos || riesgos.length === 0) && (
                            <p className="text-sm text-muted-foreground">Todavía no hay riesgos registrados.</p>
                        )}
                    </div>
                </div>

                <div className="panel p-6">
                    <h2 className="font-display text-lg font-bold text-foreground mb-4">
                        Vulnerabilidades registradas ({vulnerabilidades?.length ?? 0})
                    </h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {(vulnerabilidades ?? []).map((v) => (
                            <div key={v.id} className="flex items-center justify-between gap-3 border border-border rounded-lg px-3 py-2.5">
                                <div className="min-w-0">
                                    <Link href={`/dashboard/proyecto/vulnerabilidades/${v.id}/editar`} className="text-sm text-foreground truncate hover:text-cyan">
                                        {v.nombre}
                                    </Link>
                                    <p className="text-xs text-muted-foreground font-mono">{v.codigo} · {v.estado}</p>
                                </div>
                                <Link href={`/dashboard/proyecto/vulnerabilidades/${v.id}/editar`} className={`shrink-0 rounded px-2 py-1 text-xs font-bold ${SEVERIDAD_TONO[v.severidad] ?? ""} hover:opacity-80`}>
                                    Editar · {v.severidad}
                                </Link>
                            </div>
                        ))}
                        {(!vulnerabilidades || vulnerabilidades.length === 0) && (
                            <p className="text-sm text-muted-foreground">Todavía no hay vulnerabilidades registradas.</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

function Campo({
    label,
    name,
    required,
    textarea,
    placeholder,
}: {
    label: string;
    name: string;
    required?: boolean;
    textarea?: boolean;
    placeholder?: string;
}) {
    return (
        <label className="block text-sm">
            <span className="text-muted-foreground block mb-1">{label}</span>
            {textarea ? (
                <textarea
                    name={name}
                    required={required}
                    placeholder={placeholder}
                    rows={2}
                    className="w-full bg-secondary text-foreground rounded-lg px-3 py-2 border border-border focus:outline-none focus:border-primary text-sm"
                />
            ) : (
                <input
                    type="text"
                    name={name}
                    required={required}
                    placeholder={placeholder}
                    className="w-full bg-secondary text-foreground rounded-lg px-3 py-2 border border-border focus:outline-none focus:border-primary text-sm"
                />
            )}
        </label>
    );
}

function SelectCampo({
    label,
    name,
    opciones,
    valorInicial,
    etiquetas,
    requerido,
}: {
    label: string;
    name: string;
    opciones: string[];
    valorInicial?: string;
    etiquetas?: string[];
    requerido?: boolean;
}) {
    return (
        <label className="block text-sm">
            <span className="text-muted-foreground block mb-1">{label}</span>
            <select
                name={name}
                required={requerido}
                defaultValue={valorInicial || opciones[0]}
                className="w-full bg-secondary text-foreground rounded-lg px-3 py-2 border border-border focus:outline-none focus:border-primary text-sm"
            >
                {!requerido && <option value="">Seleccionar…</option>}
                {opciones.map((o, indice) => (
                    <option key={o} value={o}>
                        {etiquetas?.[indice] ?? o}
                    </option>
                ))}
            </select>
        </label>
    );
}
