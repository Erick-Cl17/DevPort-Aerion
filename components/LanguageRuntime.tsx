"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

type Idioma = "ES" | "EN" | "ZH";

const TRADUCCIONES: Record<string, { EN: string; ZH: string }> = {
    "Inicio": { EN: "Home", ZH: "首页" },
    "Proyectos": { EN: "Projects", ZH: "项目" },
    "Proyectos de la organización": { EN: "Organization projects", ZH: "组织项目" },
    "Registrar nuevo proyecto": { EN: "Register new project", ZH: "注册新项目" },
    "+ Registrar nuevo proyecto": { EN: "+ Register new project", ZH: "+ 注册新项目" },
    "Todavía no hay proyectos registrados.": { EN: "No projects have been registered yet.", ZH: "目前还没有注册项目。" },
    "Nuevo registro": { EN: "New entry", ZH: "新记录" },
    "Registrar proyecto": { EN: "Register project", ZH: "注册项目" },
    "Nombre del proyecto": { EN: "Project name", ZH: "项目名称" },
    "Descripción (opcional)": { EN: "Description (optional)", ZH: "说明（可选）" },
    "Guardar proyecto": { EN: "Save project", ZH: "保存项目" },
    "Ver evaluaciones": { EN: "View evaluations", ZH: "查看评估" },
    "En progreso": { EN: "In progress", ZH: "进行中" },
    "Pausado": { EN: "Paused", ZH: "已暂停" },
    "Finalizado": { EN: "Completed", ZH: "已完成" },
    "Cancelado": { EN: "Cancelled", ZH: "已取消" },
    "Versión": { EN: "Version", ZH: "版本" },
    "Cantidad de pruebas": { EN: "Test count", ZH: "测试数量" },
    "Imagen del proyecto": { EN: "Project image", ZH: "项目图片" },
    "Subir nueva": { EN: "Upload new", ZH: "上传新图片" },
    "Elegir existente": { EN: "Choose existing", ZH: "选择现有图片" },
    "No se eligió ningún archivo": { EN: "No file selected", ZH: "未选择任何文件" },
    "Proyecto registrado correctamente.": { EN: "Project registered successfully.", ZH: "项目已成功注册。" },
    "Equipos": { EN: "Teams", ZH: "团队" },
    "Usuarios": { EN: "Users", ZH: "用户" },
    "Evaluaciones": { EN: "Assessments", ZH: "评估" },
    "Centro de Seguridad": { EN: "Security Center", ZH: "安全中心" },
    "Administración": { EN: "Administration", ZH: "管理" },
    "Auditoría": { EN: "Audit", ZH: "审计" },
    "Dashboard": { EN: "Dashboard", ZH: "仪表板" },
    "Notificaciones": { EN: "Notifications", ZH: "通知" },
    "Perfil": { EN: "Profile", ZH: "个人资料" },
    "Configuración de Perfil": { EN: "Profile Settings", ZH: "个人资料设置" },
    "Gestiona tu cuenta y configuración": { EN: "Manage your account and settings", ZH: "管理你的账户和设置" },
    "Datos personales": { EN: "Personal information", ZH: "个人信息" },
    "Nombre": { EN: "First name", ZH: "名字" },
    "Apellido": { EN: "Last name", ZH: "姓氏" },
    "Correo electrónico": { EN: "Email", ZH: "电子邮件" },
    "Zona horaria": { EN: "Time zone", ZH: "时区" },
    "Guardar cambios": { EN: "Save changes", ZH: "保存更改" },
    "Estado": { EN: "Status", ZH: "状态" },
    "activo": { EN: "active", ZH: "活跃" },
    "Código de invitación": { EN: "Invitation code", ZH: "邀请码" },
    "Compartir este código con las personas que quieras invitar a tu organización.": { EN: "Share this code with people you want to invite to your organization.", ZH: "与想邀请加入组织的人员分享此代码。" },
    "Equipos a los que perteneces o administras": { EN: "Teams you belong to or manage", ZH: "你所属或管理的团队" },
    "Nuevo equipo": { EN: "New team", ZH: "新团队" },
    "Editar equipo": { EN: "Edit team", ZH: "编辑团队" },
    "Crear equipo": { EN: "Create team", ZH: "创建团队" },
    "Sin responsable": { EN: "No assignee", ZH: "无负责人" },
    "Sin responsable por ahora": { EN: "No assignee for now", ZH: "暂时没有负责人" },
    "Responsable": { EN: "Assignee", ZH: "负责人" },
    "Código": { EN: "Code", ZH: "代码" },
    "Editar": { EN: "Edit", ZH: "编辑" },
    "Buscar equipo por nombre": { EN: "Search team by name", ZH: "按名称搜索团队" },
    "Usuarios de tu organización y sus roles": { EN: "Users in your organization and their roles", ZH: "组织中的用户及其角色" },
    "Buscar usuario por nombre": { EN: "Search user by name", ZH: "按姓名搜索用户" },
    "Sin asignaciones activas": { EN: "No active assignments", ZH: "没有活跃分配" },
    "Riesgos": { EN: "Risks", ZH: "风险" },
    "Vulnerabilidades": { EN: "Vulnerabilities", ZH: "漏洞" },
    "Riesgo": { EN: "Risk", ZH: "风险" },
    "Nueva vulnerabilidad": { EN: "New vulnerability", ZH: "新漏洞" },
    "Nuevo riesgo": { EN: "New risk", ZH: "新风险" },
    "Riesgos recientes": { EN: "Recent risks", ZH: "最近风险" },
    "Riesgos registrados": { EN: "Registered risks", ZH: "已登记风险" },
    "Riesgos críticos": { EN: "Critical risks", ZH: "严重风险" },
    "Categoría": { EN: "Category", ZH: "类别" },
    "Descripción": { EN: "Description", ZH: "描述" },
    "Guardar": { EN: "Save", ZH: "保存" },
    "Importar desde JSON": { EN: "Import from JSON", ZH: "从 JSON 导入" },
    "Leída": { EN: "Read", ZH: "已读" },
    "Marcar todas como leídas": { EN: "Mark all as read", ZH: "全部标记为已读" },
    "Roles": { EN: "Roles", ZH: "角色" },
    "Cargos": { EN: "Positions", ZH: "职位" },
    "Revisiones": { EN: "Reviews", ZH: "评审" },
    "Nueva revisión": { EN: "New review", ZH: "新评审" },
    "Revisión": { EN: "Review", ZH: "评审" },
    "Centro de operaciones": { EN: "Operations center", ZH: "运营中心" },
    "Resumen operativo de tu organización.": { EN: "Operational summary of your organization.", ZH: "组织运营概览。" },
    "Actividad reciente": { EN: "Recent activity", ZH: "最近活动" },
    "No hay actividad registrada.": { EN: "No activity registered.", ZH: "暂无活动记录。" },
    "No hay riesgos registrados.": { EN: "No risks registered.", ZH: "暂无风险记录。" },
    "No hay revisiones registradas.": { EN: "No reviews registered.", ZH: "暂无评审记录。" },
    "Volver al dashboard": { EN: "Back to dashboard", ZH: "返回仪表板" },
    "Volver a Proyecto": { EN: "Back to Project", ZH: "返回项目" },
    "Ingresar": { EN: "Sign in", ZH: "登录" },
    "Idioma": { EN: "Language", ZH: "语言" },
    "Abrir navegación": { EN: "Open navigation", ZH: "打开导航" },
    "Cerrar navegación": { EN: "Close navigation", ZH: "关闭导航" },
    "COLLAPSE": { EN: "COLLAPSE", ZH: "折叠" },
    "Bienvenido a": { EN: "Welcome to", ZH: "欢迎来到" },
    "AERION - Gestión de revisiones multiequipo": { EN: "AERION - Multi-team review management", ZH: "AERION - 多团队评审管理" },
    "Controla el acceso a cada módulo por organización, equipo, cargo y rol. Crea revisiones con plazos, respeta la zona horaria de cada equipo y mantén trazabilidad completa de cada cambio. Inicia sesión o crea tu cuenta para continuar.": { EN: "Control access to each module by organization, team, position and role. Create reviews with deadlines, respect each team's time zone and maintain complete traceability of every change. Sign in or create your account to continue.", ZH: "按组织、团队、职位和角色控制每个模块的访问权限。创建带有截止日期的评审，遵循每个团队的时区，并完整追踪每项变更。登录或创建账户以继续。" },
    "Inicia sesión o crea tu cuenta para continuar.": { EN: "Sign in or create your account to continue.", ZH: "登录或创建账户以继续。" },
    "Roles por equipo": { EN: "Roles by team", ZH: "团队角色" },
    "Una misma persona puede ser Supervisor en un equipo y Consulta en otro.": { EN: "The same person can be a Supervisor on one team and Viewer on another.", ZH: "同一个人可以在一个团队担任主管，在另一个团队担任查看者。" },
    "Plazos y zona horaria": { EN: "Deadlines and time zone", ZH: "截止日期和时区" },
    "Cada revisión guarda su plazo en UTC y se presenta convertido a la zona horaria de cada usuario.": { EN: "Each review stores its deadline in UTC and displays it in each user's time zone.", ZH: "每项评审以 UTC 保存截止时间，并根据每位用户的时区显示。" },
    "Trazabilidad total": { EN: "Complete traceability", ZH: "完整可追溯性" },
    "Cada creación, inicio, finalización y cambio de rol queda registrado en auditoría.": { EN: "Every creation, start, completion and role change is recorded in the audit log.", ZH: "每次创建、开始、完成和角色变更都会记录在审计日志中。" },
    "Buscar simulador, versión o ID": { EN: "Search simulator, version or ID", ZH: "搜索模拟器、版本或 ID" },
    "Buscar simulador": { EN: "Search simulator", ZH: "搜索模拟器" },
    "Filtros": { EN: "Filters", ZH: "筛选" },
    "Todos": { EN: "All", ZH: "全部" },
    "Aviación": { EN: "Aviation", ZH: "航空" },
    "Helicópteros": { EN: "Helicopters", ZH: "直升机" },
    "Espacio": { EN: "Space", ZH: "太空" },
    "Drones": { EN: "Drones", ZH: "无人机" },
    "Marino": { EN: "Marine", ZH: "海事" },
    "No se encontraron imágenes.": { EN: "No images found.", ZH: "未找到图片。" },
};

function leerIdiomaActual(): Idioma {
    if (typeof window === "undefined") return "ES";

    const local = window.localStorage.getItem("aerion-idioma");
    const cookieValue = document.cookie
        .split("; ")
        .find((item) => item.startsWith("aerion-idioma="))
        ?.split("=")[1];

    const codigo = local === "EN" || local === "ZH" ? local : cookieValue === "EN" || cookieValue === "ZH" ? cookieValue : "ES";
    if (codigo !== "ES") {
        window.localStorage.setItem("aerion-idioma", codigo);
        document.cookie = `aerion-idioma=${codigo}; path=/; max-age=31536000; SameSite=Lax`;
    }
    return codigo;
}

function construirIndice(idioma: Idioma) {
    const indice = new Map<string, string>();
    Object.entries(TRADUCCIONES).forEach(([es, traduccion]) => {
        indice.set(es, idioma === "ES" ? es : traduccion[idioma]);
        indice.set(traduccion.EN, idioma === "EN" ? traduccion.EN : idioma === "ES" ? es : traduccion.ZH);
        indice.set(traduccion.ZH, idioma === "ZH" ? traduccion.ZH : idioma === "ES" ? es : traduccion.EN);
    });
    return indice;
}

function traducirPagina(idioma: Idioma) {
    const indice = construirIndice(idioma);
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodos: Text[] = [];
    let nodo: Node | null;
    while ((nodo = walker.nextNode())) nodos.push(nodo as Text);

    nodos.forEach((texto) => {
        const original = texto.nodeValue ?? "";
        const limpio = original.trim();
        const traducido = indice.get(limpio);
        if (traducido && limpio !== traducido) {
            texto.nodeValue = original.replace(limpio, traducido);
        }
    });

    document.querySelectorAll<HTMLElement>("[placeholder], [aria-label], [title]").forEach((elemento) => {
        ["placeholder", "aria-label", "title"].forEach((atributo) => {
            const valor = elemento.getAttribute(atributo);
            const traducido = valor ? indice.get(valor) : undefined;
            if (traducido) elemento.setAttribute(atributo, traducido);
        });
    });
}

export default function LanguageRuntime() {
    const pathname = usePathname();

    useEffect(() => {
        const aplicarIdioma = (siguiente?: string) => {
            const codigo = siguiente ?? leerIdiomaActual();
            const idioma: Idioma = codigo === "EN" || codigo === "ZH" ? codigo : "ES";
            document.documentElement.lang = idioma === "ES" ? "es" : idioma === "EN" ? "en" : "zh";
            document.documentElement.dataset.aerionIdioma = idioma;
            traducirPagina(idioma);
        };

        aplicarIdioma();

        const manejarCambio = (evento: Event) => {
            const siguiente = (evento as CustomEvent<string>).detail ?? leerIdiomaActual();
            aplicarIdioma(siguiente);
        };

        window.addEventListener("aerion:idioma", manejarCambio);
        window.addEventListener("storage", manejarCambio);
        return () => {
            window.removeEventListener("aerion:idioma", manejarCambio);
            window.removeEventListener("storage", manejarCambio);
        };
    }, [pathname]);

    return null;
}