import Link from "next/link";
import { Activity, AlertTriangle, ClipboardCheck, FolderKanban, ShieldAlert, Users } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import { obtenerContextoUsuario } from "@/lib/data";
import { cookies } from "next/headers";

type Idioma = "ES" | "EN" | "ZH";

const COPY = {
    ES: { centro: "Centro de operaciones", resumen: "Resumen operativo de tu organización.", revisiones: "Revisiones", registros: "Registros recientes", riesgosCriticos: "Riesgos críticos", nivel: "Nivel inherente ≥ 15", vulnerabilidades: "Vulnerabilidades", pendientes: "Pendientes de cierre", cumplimiento: "Cumplimiento", finalizadas: "Revisiones finalizadas", proyectos: "Proyectos activos", usuarios: "Usuarios", riesgosRegistrados: "Riesgos registrados", acciones: "Acciones recientes", exposicion: "Exposición", riesgoNivel: "Riesgo por nivel", critico: "Crítico", alto: "Alto", medio: "Medio", bajo: "Bajo", ultimas: "Últimas ejecuciones", hallazgos: "Hallazgos", riesgosRecientes: "Riesgos recientes", auditoria: "Auditoría", actividad: "Actividad reciente", sinRevisiones: "No hay revisiones registradas.", sinRiesgos: "No hay riesgos registrados.", sinActividad: "No hay actividad registrada.", accionEn: "en" },
    EN: { centro: "Operations center", resumen: "Operational summary of your organization.", revisiones: "Reviews", registros: "Recent records", riesgosCriticos: "Critical risks", nivel: "Inherent level ≥ 15", vulnerabilidades: "Vulnerabilities", pendientes: "Pending closure", cumplimiento: "Compliance", finalizadas: "Completed reviews", proyectos: "Active projects", usuarios: "Users", riesgosRegistrados: "Registered risks", acciones: "Recent actions", exposicion: "Exposure", riesgoNivel: "Risk by level", critico: "Critical", alto: "High", medio: "Medium", bajo: "Low", ultimas: "Latest executions", hallazgos: "Findings", riesgosRecientes: "Recent risks", auditoria: "Audit", actividad: "Recent activity", sinRevisiones: "No reviews registered.", sinRiesgos: "No risks registered.", sinActividad: "No activity registered.", accionEn: "in" },
    ZH: { centro: "运营中心", resumen: "组织运营概览。", revisiones: "评审", registros: "最近记录", riesgosCriticos: "严重风险", nivel: "固有等级 ≥ 15", vulnerabilidades: "漏洞", pendientes: "待关闭", cumplimiento: "合规率", finalizadas: "已完成评审", proyectos: "活跃项目", usuarios: "用户", riesgosRegistrados: "已登记风险", acciones: "最近操作", exposicion: "暴露情况", riesgoNivel: "按等级划分的风险", critico: "严重", alto: "高", medio: "中", bajo: "低", ultimas: "最近执行", hallazgos: "发现项", riesgosRecientes: "最近风险", auditoria: "审计", actividad: "最近活动", sinRevisiones: "暂无评审记录。", sinRiesgos: "暂无风险记录。", sinActividad: "暂无活动记录。", accionEn: "于" },
} as const;

function obtenerSaludo(fecha: Date, zona: string, idioma: Idioma) {
    const hora = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: zona }).format(fecha));
    const periodo = hora < 12 ? "mañana" : hora < 19 ? "tarde" : "noche";
    const saludos = {
        ES: { mañana: "Buenos días", tarde: "Buenas tardes", noche: "Buenas noches" },
        EN: { mañana: "Good morning", tarde: "Good afternoon", noche: "Good evening" },
        ZH: { mañana: "早上好", tarde: "下午好", noche: "晚上好" },
    } as const;
    return saludos[idioma][periodo];
}

export default async function DashboardPage() {
    const { user, profile } = await obtenerContextoUsuario();
    const codigoIdioma = (await cookies()).get("aerion-idioma")?.value;
    const idioma: Idioma = codigoIdioma === "EN" || codigoIdioma === "ZH" ? codigoIdioma : "ES";
    const t = COPY[idioma];
    const supabase = await createClient();
    const nombre = profile?.nombre ?? user?.email?.split("@")[0] ?? "Usuario";
    const zonaHoraria = profile?.zona_horaria ?? "America/Guayaquil";
    const saludo = obtenerSaludo(new Date(), zonaHoraria, idioma);

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
            <header><p className="label-mono">{t.centro}</p><h1 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">{saludo}, {nombre}</h1><p className="mt-1 text-sm text-muted-foreground">{t.resumen}</p></header>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Kpi label={t.revisiones} value={listaRevisiones.length} detail={t.registros} icon={<ClipboardCheck />} />
                <Kpi label={t.riesgosCriticos} value={riesgosCriticos} detail={t.nivel} icon={<ShieldAlert />} tone="critical" />
                <Kpi label={t.vulnerabilidades} value={vulnerabilidadesAbiertas} detail={t.pendientes} icon={<AlertTriangle />} tone="warning" />
                <Kpi label={t.cumplimiento} value={`${cumplimiento}%`} detail={t.finalizadas} icon={<Activity />} tone="success" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Mini label={t.proyectos} value={equipos ?? 0} icon={<FolderKanban />} href="/dashboard/equipos" />
                <Mini label={t.usuarios} value={usuarios ?? 0} icon={<Users />} href="/dashboard/usuarios" />
                <Mini label={t.riesgosRegistrados} value={listaRiesgos.length} icon={<ShieldAlert />} href="/dashboard/proyecto" />
                <Mini label={t.acciones} value={(auditoria ?? []).length} icon={<Activity />} href="/dashboard/auditoria" />
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
                <div className="panel corner-ticks p-5"><SectionTitle kicker={t.exposicion} title={t.riesgoNivel} /><div className="space-y-4">{[t.critico, t.alto, t.medio, t.bajo].map((nivel, indice) => { const cantidad = listaRiesgos.filter((riesgo) => indice === 0 ? riesgo.nivel_inherente >= 15 : indice === 1 ? riesgo.nivel_inherente >= 9 && riesgo.nivel_inherente < 15 : indice === 2 ? riesgo.nivel_inherente >= 4 && riesgo.nivel_inherente < 9 : riesgo.nivel_inherente < 4).length; const colores = ["bg-critical", "bg-warning", "bg-cyan", "bg-success"]; return <div key={nivel}><div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>{nivel}</span><span>{cantidad}</span></div><div className="h-2 rounded-full bg-secondary"><div className={`h-full rounded-full ${colores[indice]}`} style={{ width: `${listaRiesgos.length ? Math.max(4, cantidad / listaRiesgos.length * 100) : 0}%` }} /></div></div>; })}</div></div>
                <div className="panel corner-ticks p-5"><SectionTitle kicker={t.revisiones} title={t.ultimas} /><div className="space-y-2">{listaRevisiones.slice(0, 4).map((revision) => <Link key={revision.id} href={`/dashboard/revisiones/${revision.id}`} className="block rounded-xl border border-border bg-background/35 p-3 transition hover:border-cyan/50"><p className="font-mono text-[0.6rem] text-muted-foreground">{revision.codigo}</p><p className="text-sm text-foreground">{revision.titulo}</p><p className="mt-1 text-xs text-cyan">{revision.estado}</p></Link>)}{!listaRevisiones.length && <Empty text={t.sinRevisiones} />}</div></div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                <div className="panel p-5"><SectionTitle kicker={t.hallazgos} title={t.riesgosRecientes} /><div className="space-y-2">{listaRiesgos.map((riesgo) => <Link key={riesgo.id} href={`/dashboard/proyecto/riesgos/${riesgo.id}/editar`} className="flex items-center justify-between rounded-xl border border-border p-3 hover:border-cyan/50"><span><small className="font-mono text-[0.6rem] text-muted-foreground">{riesgo.codigo}</small><span className="block text-sm text-foreground">{riesgo.nombre}</span></span><span className="font-mono text-xs text-critical">{riesgo.nivel_inherente}</span></Link>)}{!listaRiesgos.length && <Empty text={t.sinRiesgos} />}</div></div>
                <div className="panel p-5"><SectionTitle kicker={t.auditoria} title={t.actividad} /><div className="space-y-3">{listaAuditoria.map((registro, indice) => <div key={`${registro.fecha_hora}-${indice}`} className="border-l border-cyan/40 pl-3"><p className="font-mono text-[0.6rem] text-muted-foreground">{new Date(registro.fecha_hora).toLocaleString(idioma === "ES" ? "es-EC" : idioma === "EN" ? "en-US" : "zh-CN")}</p><p className="text-sm text-foreground">{registro.accion} {t.accionEn} {registro.recurso}</p></div>)}{!listaAuditoria.length && <Empty text={t.sinActividad} />}</div></div>
            </div>
        </div>
    </section>;
}

function Kpi({ label, value, detail, icon, tone = "cyan" }: { label: string; value: string | number; detail: string; icon: React.ReactNode; tone?: "cyan" | "critical" | "warning" | "success" }) { return <div className="panel circuit-frame p-5"><div className="flex justify-between"><p className="label-mono">{label}</p><span className={`text-${tone}`} aria-hidden>{icon}</span></div><p className="mt-3 font-display text-3xl font-bold text-foreground">{value}</p><p className={`mt-2 text-xs text-${tone}`}>{detail}</p></div>; }
function Mini({ label, value, icon, href }: { label: string; value: number; icon: React.ReactNode; href: string }) { return <Link href={href} className="flex items-center justify-between rounded-xl border border-border bg-surface/45 px-4 py-3 transition hover:border-cyan/50"><span><span className="label-mono">{label}</span><strong className="mt-1 block font-display text-xl text-foreground">{value}</strong></span><span className="text-muted-foreground">{icon}</span></Link>; }
function SectionTitle({ kicker, title }: { kicker: string; title: string }) { return <div className="mb-4 flex items-end gap-3"><div><p className="label-mono">{kicker}</p><h2 className="font-display text-lg font-semibold text-foreground">{title}</h2></div><span className="mb-1 h-px flex-1 bg-linear-to-r from-primary/50 to-transparent" /></div>; }
function Empty({ text }: { text: string }) { return <p className="py-6 text-center text-sm text-muted-foreground">{text}</p>; }
