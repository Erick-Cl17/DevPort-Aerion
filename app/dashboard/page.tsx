import Link from "next/link";
import { Activity, AlertTriangle, ClipboardCheck, FolderKanban, ShieldAlert, Users } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import { obtenerContextoUsuario } from "@/lib/data";

export default async function DashboardPage() {
    const { user, profile } = await obtenerContextoUsuario();
    const supabase = await createClient();
    const nombre = profile?.nombre ?? user?.email?.split("@")[0] ?? "Usuario";

    const [{ data: revisiones }, { count: equipos }, { count: usuarios }, { data: riesgos }, { data: vulnerabilidades }, { data: auditoria }] = await Promise.all([
        supabase.from("revisiones_estado").select("id, codigo, titulo, estado, fecha_fin_real, fecha_fin_plazo").order("fecha_fin_plazo", { ascending: false }).limit(8),
        supabase.from("equipos").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("organizacion_id", profile?.organizacion_id ?? ""),
        supabase.from("riesgos").select("id, codigo, nombre, nivel_inherente, estado").eq("organizacion_id", profile?.organizacion_id ?? "").order("nivel_inherente", { ascending: false }).limit(5),
        supabase.from("vulnerabilidades").select("id, severidad, estado").eq("organizacion_id", profile?.organizacion_id ?? ""),
        supabase.from("auditoria").select("accion, recurso, fecha_hora, actor:actor_id(nombre, apellido)").order("fecha_hora", { ascending: false }).limit(5),
    ]);

    const listaRevisiones = revisiones ?? [];
    const listaRiesgos = riesgos ?? [];
    const listaVulnerabilidades = vulnerabilidades ?? [];
    const listaAuditoria = (auditoria ?? []) as Array<{ fecha_hora: string; accion: string; recurso: string }>;
    const finalizadas = listaRevisiones.filter((revision) => revision.fecha_fin_real);
    const enPlazo = finalizadas.filter((revision) => revision.fecha_fin_real! <= revision.fecha_fin_plazo).length;
    const cumplimiento = finalizadas.length ? Math.round((enPlazo / finalizadas.length) * 100) : 0;
    const riesgosCriticos = listaRiesgos.filter((riesgo) => riesgo.nivel_inherente >= 15).length;
    const vulnerabilidadesAbiertas = listaVulnerabilidades.filter((vulnerabilidad) => vulnerabilidad.estado !== "Cerrada").length;

    return <section className="min-h-[calc(100vh-73px)] bg-background px-5 py-7 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-5">
            <header><p className="label-mono">Centro de operaciones</p><h1 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">Buenos días, {nombre}</h1><p className="mt-1 text-sm text-muted-foreground">Resumen operativo de tu organización.</p></header>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Kpi label="Revisiones" value={listaRevisiones.length} detail="Registros recientes" icon={<ClipboardCheck />} />
                <Kpi label="Riesgos críticos" value={riesgosCriticos} detail="Nivel inherente ≥ 15" icon={<ShieldAlert />} tone="critical" />
                <Kpi label="Vulnerabilidades" value={vulnerabilidadesAbiertas} detail="Pendientes de cierre" icon={<AlertTriangle />} tone="warning" />
                <Kpi label="Cumplimiento" value={`${cumplimiento}%`} detail="Revisiones finalizadas" icon={<Activity />} tone="success" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Mini label="Proyectos activos" value={equipos ?? 0} icon={<FolderKanban />} href="/dashboard/equipos" />
                <Mini label="Usuarios" value={usuarios ?? 0} icon={<Users />} href="/dashboard/usuarios" />
                <Mini label="Riesgos registrados" value={listaRiesgos.length} icon={<ShieldAlert />} href="/dashboard/proyecto" />
                <Mini label="Acciones recientes" value={(auditoria ?? []).length} icon={<Activity />} href="/dashboard/auditoria" />
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
                <div className="panel corner-ticks p-5"><SectionTitle kicker="Exposición" title="Riesgo por nivel" /><div className="space-y-4">{["Crítico", "Alto", "Medio", "Bajo"].map((nivel, indice) => { const cantidad = listaRiesgos.filter((riesgo) => nivel === "Crítico" ? riesgo.nivel_inherente >= 15 : nivel === "Alto" ? riesgo.nivel_inherente >= 9 && riesgo.nivel_inherente < 15 : nivel === "Medio" ? riesgo.nivel_inherente >= 4 && riesgo.nivel_inherente < 9 : riesgo.nivel_inherente < 4).length; const colores = ["bg-critical", "bg-warning", "bg-cyan", "bg-success"]; return <div key={nivel}><div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>{nivel}</span><span>{cantidad}</span></div><div className="h-2 rounded-full bg-secondary"><div className={`h-full rounded-full ${colores[indice]}`} style={{ width: `${listaRiesgos.length ? Math.max(4, cantidad / listaRiesgos.length * 100) : 0}%` }} /></div></div>; })}</div></div>
                <div className="panel corner-ticks p-5"><SectionTitle kicker="Revisiones" title="Últimas ejecuciones" /><div className="space-y-2">{listaRevisiones.slice(0, 4).map((revision) => <Link key={revision.id} href={`/dashboard/revisiones/${revision.id}`} className="block rounded-xl border border-border bg-background/35 p-3 transition hover:border-cyan/50"><p className="font-mono text-[0.6rem] text-muted-foreground">{revision.codigo}</p><p className="text-sm text-foreground">{revision.titulo}</p><p className="mt-1 text-xs text-cyan">{revision.estado}</p></Link>)}{!listaRevisiones.length && <Empty text="No hay revisiones registradas." />}</div></div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                <div className="panel p-5"><SectionTitle kicker="Hallazgos" title="Riesgos recientes" /><div className="space-y-2">{listaRiesgos.map((riesgo) => <Link key={riesgo.id} href={`/dashboard/proyecto/riesgos/${riesgo.id}/editar`} className="flex items-center justify-between rounded-xl border border-border p-3 hover:border-cyan/50"><span><small className="font-mono text-[0.6rem] text-muted-foreground">{riesgo.codigo}</small><span className="block text-sm text-foreground">{riesgo.nombre}</span></span><span className="font-mono text-xs text-critical">{riesgo.nivel_inherente}</span></Link>)}{!listaRiesgos.length && <Empty text="No hay riesgos registrados." />}</div></div>
                <div className="panel p-5"><SectionTitle kicker="Auditoría" title="Actividad reciente" /><div className="space-y-3">{listaAuditoria.map((registro, indice) => <div key={`${registro.fecha_hora}-${indice}`} className="border-l border-cyan/40 pl-3"><p className="font-mono text-[0.6rem] text-muted-foreground">{new Date(registro.fecha_hora).toLocaleString("es-EC")}</p><p className="text-sm text-foreground">{registro.accion} en {registro.recurso}</p></div>)}{!listaAuditoria.length && <Empty text="No hay actividad registrada." />}</div></div>
            </div>
        </div>
    </section>;
}

function Kpi({ label, value, detail, icon, tone = "cyan" }: { label: string; value: string | number; detail: string; icon: React.ReactNode; tone?: "cyan" | "critical" | "warning" | "success" }) { return <div className="panel circuit-frame p-5"><div className="flex justify-between"><p className="label-mono">{label}</p><span className={`text-${tone}`} aria-hidden>{icon}</span></div><p className="mt-3 font-display text-3xl font-bold text-foreground">{value}</p><p className={`mt-2 text-xs text-${tone}`}>{detail}</p></div>; }
function Mini({ label, value, icon, href }: { label: string; value: number; icon: React.ReactNode; href: string }) { return <Link href={href} className="flex items-center justify-between rounded-xl border border-border bg-surface/45 px-4 py-3 transition hover:border-cyan/50"><span><span className="label-mono">{label}</span><strong className="mt-1 block font-display text-xl text-foreground">{value}</strong></span><span className="text-muted-foreground">{icon}</span></Link>; }
function SectionTitle({ kicker, title }: { kicker: string; title: string }) { return <div className="mb-4 flex items-end gap-3"><div><p className="label-mono">{kicker}</p><h2 className="font-display text-lg font-semibold text-foreground">{title}</h2></div><span className="mb-1 h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" /></div>; }
function Empty({ text }: { text: string }) { return <p className="py-6 text-center text-sm text-muted-foreground">{text}</p>; }
