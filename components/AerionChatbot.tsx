"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircle, X, BookOpen, Send } from "lucide-react";
import { IMAGENES } from "@/lib/image-paths";

type Idioma = "ES" | "EN" | "ZH";

type Texto = { ES: string; EN: string; ZH: string };

const TEXTOS: Record<string, Texto> = {
    titulo: { ES: "Asistente AERION", EN: "AERION Assistant", ZH: "AERION 助手" },
    apoyo: { ES: "¿Necesitas ayuda?", EN: "Need help?", ZH: "需要帮助吗？" },
    bienvenida: { ES: "Puedo orientarte en esta ventana. Elige una pregunta o abre el manual.", EN: "I can guide you on this page. Choose a question or open the manual.", ZH: "我可以指导你使用此页面。选择问题或打开手册。" },
    manual: { ES: "Abrir manual", EN: "Open manual", ZH: "打开手册" },
    cerrar: { ES: "Cerrar", EN: "Close", ZH: "关闭" },
    enviar: { ES: "Enviar", EN: "Send", ZH: "发送" },
    preguntaInicio: { ES: "¿Qué puedo hacer en AERION?", EN: "What can I do in AERION?", ZH: "我可以在 AERION 中做什么？" },
    preguntaModulo: { ES: "¿Qué puedo hacer en este módulo?", EN: "What can I do in this module?", ZH: "我可以在此模块中做什么？" },
    preguntaManual: { ES: "¿Dónde encuentro instrucciones detalladas?", EN: "Where can I find detailed instructions?", ZH: "在哪里可以找到详细说明？" },
    respuestaInicio: { ES: "AERION organiza revisiones, equipos, usuarios, riesgos y auditoría. Usa el menú lateral para acceder a cada módulo.", EN: "AERION organizes reviews, teams, users, risks and audits. Use the sidebar to access each module.", ZH: "AERION 用于管理评审、团队、用户、风险和审计。使用侧边栏访问各个模块。" },
    respuestaModulo: { ES: "Este módulo te permite consultar y gestionar la información relacionada con la sección actual. Revisa el manual para ver el proceso paso a paso.", EN: "This module lets you view and manage information related to the current section. Check the manual for the step-by-step process.", ZH: "此模块用于查看和管理当前部分的信息。请查看手册了解详细步骤。" },
    respuestaManual: { ES: "El manual reúne el objetivo, los permisos, los pasos y las acciones disponibles de cada módulo.", EN: "The manual includes the purpose, permissions, steps and available actions for every module.", ZH: "手册包含每个模块的用途、权限、步骤和可用操作。" },
};

const RESUMENES: Record<string, Texto> = {
    inicio: { ES: "Esta es la pantalla inicial: presenta AERION y permite Registrarse o Acceder.", EN: "This is the home screen: it presents AERION and lets you Sign up or Sign in.", ZH: "这是首页：介绍 AERION，并提供注册或登录入口。" },
    dashboard: { ES: "El Dashboard resume revisiones, riesgos, vulnerabilidades, cumplimiento, usuarios y actividad reciente.", EN: "The Dashboard summarizes reviews, risks, vulnerabilities, compliance, users and recent activity.", ZH: "仪表板总结评审、风险、漏洞、合规率、用户和最近活动。" },
    proyectos: { ES: "En Proyectos gestionas los proyectos de la organización, sus datos básicos y la relación con riesgos y evaluaciones.", EN: "In Projects you manage the organization's projects, their basic data and their connection to risks and assessments.", ZH: "在项目中管理组织的项目、基本信息以及与风险和评估的关系。" },
    equipos: { ES: "En Equipos puedes crear equipos, elegir su zona horaria, asignar responsables y cambiar su estado.", EN: "In Teams you can create teams, select time zones, assign owners and change their status.", ZH: "在团队中可以创建团队、选择时区、分配负责人和更改状态。" },
    usuarios: { ES: "En Usuarios consultas personas y asignaciones; en Asignar relacionas usuario, equipo, rol y cargo.", EN: "In Users you review people and assignments; Assign links a user, team, role and position.", ZH: "在用户中查看人员和分配；在分配中关联用户、团队、角色和职位。" },
    evaluaciones: { ES: "En Evaluaciones registras riesgos y vulnerabilidades, defines niveles e importas hallazgos desde JSON.", EN: "In Assessments you record risks and vulnerabilities, define levels and import JSON findings.", ZH: "在评估中登记风险和漏洞，设置等级并导入 JSON 发现项。" },
    revisiones: { ES: "En Revisiones defines fechas, responsables, equipos y evidencias para ejecutar y cerrar cada revisión.", EN: "In Reviews you define dates, owners, teams and evidence to run and close each review.", ZH: "在评审中定义日期、负责人、团队和证据，用于执行和结束每项评审。" },
    notificaciones: { ES: "En Notificaciones revisas avisos, enlaces y pendientes para actuar sobre eventos relevantes del sistema.", EN: "In Notifications you review alerts, links and pending items that require action on relevant system events.", ZH: "在通知中查看提醒、链接和待处理事项，以便处理系统中的相关事件。" },
    seguridad: { ES: "En Centro de Seguridad evalúas la matriz probabilidad-impacto, riesgos críticos y la actividad reciente del entorno.", EN: "In the Security Center you review the probability-impact matrix, critical risks and recent environment activity.", ZH: "在安全中心查看概率-影响矩阵、关键风险和环境最近的活动。" },
    auditoria: { ES: "En Auditoría revisas qué persona hizo cada acción y puedes filtrar por acción, recurso o resultado. También puedes registrar una acción manual y adjuntar un archivo guardado en Storage.", EN: "In Audit you review who performed each action and filter by action, resource or result. You can also register a manual action and attach a file stored in Storage.", ZH: "在审计中查看每个人执行的操作，并按操作、资源或结果筛选。还可以登记手动操作并附加保存在 Storage 中的文件。" },
    administracion: { ES: "En Administración encuentras Cargos, Roles, Reportes y Auditoría. Roles define niveles: superadmin, admin de organización, supervisor y consulta.", EN: "Administration contains Positions, Roles, Reports and Audit. Roles define levels: superadmin, organization admin, supervisor and viewer.", ZH: "管理模块包含职位、角色、报告和审计。角色等级包括超级管理员、组织管理员、主管和查看者。" },
    perfil: { ES: "En Perfil actualizas tus datos, correo y zona horaria, que también controla fechas, reloj y saludo.", EN: "In Profile you update your details, email and time zone, which also controls dates, clock and greeting.", ZH: "在个人资料中更新信息、邮箱和时区；时区也控制日期、时钟和问候语。" },
    laboratorio: { ES: "En el Laboratorio de APIs puedes consultar Open Notify: la posición de la Estación Espacial Internacional y las personas que están en el espacio.", EN: "In the API Lab you can query Open Notify for the International Space Station's position and the people currently in space.", ZH: "在 API 实验室中可以查询 Open Notify，了解国际空间站的位置和当前在太空中的人员。" },
    general: { ES: "Esta pantalla pertenece a AERION. Abre el manual para consultar sus pasos específicos.", EN: "This screen belongs to AERION. Open the manual for its specific steps.", ZH: "此页面属于 AERION。打开手册查看具体步骤。" },
};

function idiomaInicial(): Idioma {
    if (typeof window === "undefined") return "ES";
    const valor = window.localStorage.getItem("aerion-idioma");
    return valor === "EN" || valor === "ZH" ? valor : "ES";
}

function moduloActual(pathname: string) {
    if (pathname === "/") return "inicio";
    if (pathname === "/dashboard") return "dashboard";
    if (pathname.includes("equipos")) return "equipos";
    if (pathname.includes("usuarios")) return "usuarios";
    if (pathname.includes("proyecto")) return "evaluaciones";
    if (pathname.includes("notificaciones")) return "notificaciones";
    if (pathname.includes("perfil")) return "perfil";
    if (pathname.includes("revisiones")) return "revisiones";
    if (pathname.includes("security-center")) return "seguridad";
    if (pathname.includes("test-lab")) return "laboratorio";
    if (pathname.includes("auditoria")) return "auditoria";
    if (pathname.includes("administracion")) return "administracion";
    return "general";
}

export default function AerionChatbot() {
    const pathname = usePathname();
    const [idioma, setIdioma] = useState<Idioma>("ES");
    const [abierto, setAbierto] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [respuesta, setRespuesta] = useState<Texto | null>(null);
    const [videoDisponible, setVideoDisponible] = useState(true);

    useEffect(() => {
        const actualizar = (evento: Event) => {
            const codigo = (evento as CustomEvent<string>).detail;
            if (codigo === "ES" || codigo === "EN" || codigo === "ZH") setIdioma(codigo);
        };
        setIdioma(idiomaInicial());
        window.addEventListener("aerion:idioma", actualizar);
        return () => window.removeEventListener("aerion:idioma", actualizar);
    }, []);

    const texto = (clave: string) => TEXTOS[clave][idioma];
    const modulo = moduloActual(pathname);
    const preguntas = ["preguntaInicio", "preguntaModulo", "preguntaManual"];

    function responder(clave: string) {
        setRespuesta(clave === "respuestaModulo" ? RESUMENES[modulo] : TEXTOS[clave]);
    }

    function enviarMensaje(evento: React.FormEvent) {
        evento.preventDefault();
        if (!mensaje.trim()) return;
        responder(mensaje.toLowerCase().includes("manual") || mensaje.toLowerCase().includes("instru") ? "respuestaManual" : "respuestaModulo");
        setMensaje("");
    }

    return (
        <div className="fixed bottom-5 right-5 z-60 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
            {!abierto && <button type="button" onClick={() => setAbierto(true)} className="chatbot-hint" aria-label={texto("apoyo")}>{texto("apoyo")}</button>}
            {abierto && <section className="chatbot-window" aria-label={texto("titulo")}>
                <header className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div><p className="font-display font-semibold text-foreground">{texto("titulo")}</p><p className="text-xs text-muted-foreground">{modulo}</p></div>
                    <button type="button" onClick={() => setAbierto(false)} aria-label={texto("cerrar")} className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"><X className="size-4" /></button>
                </header>
                <div className="max-h-72 space-y-3 overflow-y-auto p-4">
                    <p className="text-sm text-muted-foreground">{texto("bienvenida")}</p>
                    {respuesta && <p className="rounded-xl border border-cyan/20 bg-cyan/10 p-3 text-sm text-foreground">{respuesta[idioma]}</p>}
                    <div className="space-y-2">{preguntas.map((pregunta) => <button key={pregunta} type="button" onClick={() => responder(pregunta === "preguntaInicio" ? "respuestaInicio" : pregunta === "preguntaManual" ? "respuestaManual" : "respuestaModulo")} className="w-full rounded-lg border border-border px-3 py-2 text-left text-xs text-foreground transition hover:border-cyan/50 hover:bg-secondary">{texto(pregunta)}</button>)}</div>
                    <form onSubmit={enviarMensaje} className="flex gap-2"><input value={mensaje} onChange={(event) => setMensaje(event.target.value)} placeholder={texto("apoyo")} className="min-w-0 flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-xs text-foreground outline-none focus:border-cyan/60" /><button type="submit" aria-label={texto("enviar")} className="rounded-lg bg-cyan px-3 text-background"><Send className="size-4" /></button></form>
                </div>
                <Link href={`/manual?modulo=${modulo}`} className="flex items-center gap-2 border-t border-border px-4 py-3 text-xs font-semibold text-cyan hover:bg-secondary"><BookOpen className="size-4" />{texto("manual")}</Link>
            </section>}
            <button type="button" onClick={() => setAbierto((valor) => !valor)} className="chatbot-button" aria-label={texto("titulo")}>
                {videoDisponible ? (
                    <video
                        src={IMAGENES.chatbot}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        onError={() => setVideoDisponible(false)}
                        aria-label="AERION"
                        className="size-4.75rem rounded-full object-cover"
                    />
                ) : (
                    <Image src={IMAGENES.logo} alt="AERION" width={76} height={76} className="size-4.75rem rounded-full object-cover" unoptimized />
                )}
                <MessageCircle className="absolute bottom-0 right-0 size-5 rounded-full bg-cyan p-1 text-background" />
            </button>
        </div>
    );
}
