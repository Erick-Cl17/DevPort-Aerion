"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { IMAGENES } from "@/lib/image-paths";

type Idioma = "ES" | "EN" | "ZH";

const CONTENIDO = {
  ES: {
    etiqueta: "Manual de operación",
    titulo: "Guía AERION",
    intro:
      "Consulta los pasos y permisos principales para trabajar con cada módulo.",
    volver: "Volver",
    secciones: [
      [
        "Inicio",
        "Conoce el propósito de AERION y accede rápidamente a registrarte o iniciar sesión.",
      ],
      [
        "Dashboard",
        "Consulta el resumen de revisiones, riesgos, vulnerabilidades, usuarios y actividad de tu organización.",
      ],
      [
        "Proyectos",
        "Crea y administra proyectos, agrega imágenes y revisa su estado.",
      ],
      [
        "Equipos",
        "Crea equipos, selecciona su zona horaria, asigna responsables y administra su estado.",
      ],
      [
        "Usuarios",
        "Consulta los usuarios de tu organización y asigna equipos, roles y cargos según tus permisos.",
      ],
      [
        "Evaluaciones",
        "Registra riesgos y vulnerabilidades, importa información JSON y consulta los hallazgos.",
      ],
      [
        "Revisiones",
        "Crea revisiones con plazos, equipo y responsable. Desde el detalle puedes registrar avances y eventos.",
      ],
      [
        "Notificaciones",
        "Revisa los avisos de la plataforma y marca como leídos los pendientes.",
      ],
      [
        "Centro de Seguridad",
        "Analiza la matríz de probabilidad e impacto para priorizar riesgos críticos y revisar actividad reciente de la organización.",
      ],
      [
        "Administración",
        "Desde Administración accede a Cargos, Roles, Reportes y Auditoría. Cargos define funciones; Roles define permisos; Reportes resume cumplimiento; Auditoría conserva el historial.",
      ],
      [
        "Auditoría",
        "Registra acciones manuales con acción, recurso, descripción opcional y archivo de respaldo. El archivo se guarda en Storage y la base conserva su ruta y metadatos.",
      ],
      [
        "Perfil",
        "Actualiza tus datos, correo y zona horaria. La zona horaria también se usa para mostrar horarios y saludos.",
      ],
    ],
  },
  EN: {
    etiqueta: "Operations manual",
    titulo: "AERION Guide",
    intro:
      "Review the main steps and permissions for working with each module.",
    volver: "Back",
    secciones: [
      ["Home", "Learn what AERION does and quickly access sign up or sign in."],
      [
        "Dashboard",
        "Review your organization's reviews, risks, vulnerabilities, users and activity.",
      ],
      [
        "Projects",
        "Create and manage projects, add images and review their status.",
      ],
      [
        "Teams",
        "Create teams, select their time zone, assign owners and manage their status.",
      ],
      [
        "Users",
        "View organization users and assign teams, roles and positions according to your permissions.",
      ],
      [
        "Assessments",
        "Record risks and vulnerabilities, import JSON data and review findings.",
      ],
      [
        "Reviews",
        "Create reviews with deadlines, team and owner. Record progress and events from the detail page.",
      ],
      [
        "Notifications",
        "Review platform alerts and mark pending notifications as read.",
      ],
      [
        "Security Center",
        "Combine probability and impact to prioritize critical risks and review recent organizational activity.",
      ],
      [
        "Administration",
        "Use Administration to access Positions, Roles, Reports and Audit. Positions describe functions, Roles define permissions, Reports summarize compliance and Audit keeps history.",
      ],
      [
        "Audit",
        "Register manual actions with action, resource, optional description and backup file. Storage keeps the file while the database stores its path and metadata.",
      ],
      [
        "Profile",
        "Update your details, email and time zone. The time zone also controls displayed times and greetings.",
      ],
    ],
  },
  ZH: {
    etiqueta: "操作手册",
    titulo: "AERION 指南",
    intro: "查看每个模块的主要步骤和权限说明。",
    volver: "返回",
    secciones: [
      ["首页", "了解 AERION 的用途，并快速注册或登录。"],
      ["仪表板", "查看组织的评审、风险、漏洞、用户和活动概览。"],
      ["项目", "创建和管理项目，添加图片并查看状态。"],
      ["团队", "创建团队，选择时区，分配负责人并管理状态。"],
      ["用户", "查看组织用户，并根据权限分配团队、角色和职位。"],
      ["评估", "记录风险和漏洞，导入 JSON 数据并查看发现项。"],
      ["评审", "创建包含截止时间、团队和负责人的评审，并记录进度和事件。"],
      ["通知", "查看平台通知并将待处理通知标记为已读。"],
      [
        "安全中心",
        "结合概率和影响来优先处理高风险事项，并查看组织最近的活动和关键风险。",
      ],
      [
        "管理",
        "使用管理模块访问职位、角色、报告和审计。职位描述职能，角色定义权限，报告总结合规情况，审计保存操作历史。",
      ],
      [
        "审计",
        "填写操作、资源、可选描述和备份文件来登记手动操作。文件保存在 Storage，数据库只保存路径和元数据。",
      ],
      ["个人资料", "更新个人信息、邮箱和时区。时区也用于显示时间和问候语。"],
    ],
  },
} as const;

const PASOS = {
  ES: [
    [
      "En la pantalla de inicio de AERION revisa la propuesta de valor, luego selecciona Registrarse o Acceder para continuar.",
      "Si aún no tienes cuenta, crea una organización y completa los datos básicos de tu empresa o proyecto.",
      "Cuando entres al sistema, usa el menú lateral para navegar rápidamente entre módulos y pantallas clave.",
      "La vista inicial sirve como punto de entrada para empezar la configuración del entorno y de tus equipos.",
    ],
    [
      "En Dashboard observa las tarjetas superiores: revisiones, riesgos críticos, vulnerabilidades y porcentaje de cumplimiento.",
      "En la segunda fila revisa los totales de proyectos/equipos, usuarios, riesgos y acciones recientes. Cada tarjeta enlaza con su módulo.",
      "En Riesgo por nivel identifica cuántos hallazgos están en crítico, alto, medio o bajo. En Últimas ejecuciones revisa las revisiones más recientes.",
      "Usa Riesgos recientes y Actividad reciente para detectar pendientes; si no hay registros, el mensaje indica que todavía no existen datos.",
    ],
    [
      "En el menú lateral entra a Proyectos y pulsa Nuevo proyecto. Completa código, nombre y descripción con información que permita identificarlo.",
      "En el selector de imagen elige una imagen disponible y pulsa Crear proyecto. Si no hay imágenes, verifica que existan archivos públicos en el almacenamiento.",
      "Regresa al listado para comprobar nombre, código, estado e imagen. Abre el proyecto para revisar sus riesgos y vulnerabilidades asociados.",
      "Edita solo los datos necesarios y conserva un código único para evitar confundir proyectos durante las revisiones.",
    ],
    [
      "En Equipos pulsa Nuevo equipo y completa nombre, código corto, zona horaria y responsable opcional. La zona horaria se elige en el selector.",
      "Guarda el equipo y confirma que aparezca en el listado con responsable, zona horaria y estado activo.",
      "Para corregir datos pulsa Editar junto al equipo. Allí puedes cambiar nombre, zona horaria y responsable.",
      "Usa Desactivar equipo cuando ya no deba recibir nuevas asignaciones; Reactivar equipo lo devuelve al estado activo.",
    ],
    [
      "En Usuarios revisa el nombre, correo, estado, organización y asignaciones activas de cada persona.",
      "Para asignar permisos entra a Asignar usuario. Selecciona usuario, equipo, rol y cargo; el rol define el nivel de acceso y el cargo identifica la función.",
      "Guarda la asignación y regresa al listado para comprobar que aparezcan equipo, rol y cargo correctos.",
      "Si una persona cambia de equipo, revisa primero sus asignaciones anteriores para evitar duplicados o permisos incorrectos.",
    ],
    [
      "En Evaluaciones utiliza Nuevo riesgo o Nueva vulnerabilidad. Completa nombre, categoría, descripción y los campos de nivel, severidad o activo afectado.",
      "Guarda el registro y verifica que su estado aparezca en el listado. Los riesgos se pueden ordenar y consultar por su nivel inherente.",
      "Para varios registros abre Importar desde JSON, pega un objeto válido con riesgos o vulnerabilidades y ejecuta la importación.",
      "Abre cada hallazgo desde el enlace correspondiente para corregir datos, cambiar su estado y mantener actualizado el seguimiento.",
    ],
    [
      "En Revisiones pulsa Nueva revisión y completa código, título, descripción, equipo, responsable, fecha de inicio y fecha límite.",
      "Antes de guardar verifica que el equipo y responsable sean los correctos y que las fechas correspondan a la zona horaria seleccionada.",
      "Desde el detalle inicia la revisión cuando comience el trabajo. Registra eventos para documentar avances y decisiones.",
      "Adjunta evidencias con nombre de archivo y almacenamiento. Al terminar finaliza la revisión y consulta la cronología para verificar el historial.",
    ],
    [
      "En Notificaciones revisa el evento, mensaje, fecha y revisión relacionada para entender qué acción requiere atención.",
      "Pulsa la notificación para ir al recurso asociado cuando exista un enlace directo.",
      "Después de revisar un aviso, usa su acción de lectura. Marcar todas como leídas sirve para limpiar los pendientes ya atendidos.",
      "Si esperas una notificación y no aparece, comprueba primero que la acción relacionada se haya guardado correctamente.",
    ],
    [
      "En Centro de Seguridad observa la matriz combinando probabilidad e impacto para identificar riesgos con mayor exposición.",
      "Revisa Registro crítico para priorizar amenazas de nivel alto y consulta Actividad reciente para conocer los cambios recientes.",
      "En Auditoría filtra mentalmente cada registro por actor, acción, recurso, fecha, contexto y resultado.",
      "Usa estos módulos para comprobar que las acciones importantes tengan responsable y evidencia, especialmente al cerrar revisiones.",
    ],
    [
      "En Administración abre Cargos para crear funciones como analista, supervisor o coordinador.",
      "Abre Roles para definir el acceso: superadmin administra toda la plataforma; admin_organizacion administra su organización; supervisor coordina revisiones; consulta solo visualiza.",
      "En Reportes revisa el cumplimiento por equipo. En Auditoría usa Registrar auditoría para documentar acciones externas y adjuntar un archivo.",
      "Comprueba que el registro aparezca y que el archivo quede asociado mediante su ruta de Storage.",
    ],
    [
      "En Auditoría consulta actor, acción, recurso, resultado y fecha.",
      "Para registrar una acción manual completa Acción realizada y Recurso o módulo; agrega una descripción si necesitas contexto.",
      "Selecciona el archivo de respaldo. Se guarda en Storage y no dentro de la tabla; la base conserva ruta, nombre, tipo y tamaño.",
      "Pulsa Registrar auditoría y verifica la confirmación. Si falla, revisa bucket y permisos.",
    ],
    [
      "En Perfil abre Datos personales y modifica nombre, apellido, correo o zona horaria. El correo debe tener un formato válido.",
      "Selecciona la zona horaria en la lista y pulsa Guardar cambios. Si cambias el correo, revisa el mensaje de confirmación recibido.",
      "Comprueba el Estado y vuelve al Dashboard para confirmar que el reloj y el saludo usan la zona horaria seleccionada.",
      "Los administradores también pueden consultar y compartir el código de invitación de su organización desde esta pantalla.",
    ],
  ],
  EN: [
    [
      "On the AERION home screen, review the value proposition, then choose Sign up or Sign in to continue.",
      "If you need a new account, create the organization and complete the basic company or project information.",
      "After logging in, use the sidebar to move quickly between the main modules and screens.",
      "The home view acts as the entry point to start configuring the environment and the teams you work with.",
    ],
    [
      "Review the top cards for reviews, critical risks, vulnerabilities and compliance.",
      "Use the second row for project/team, user, risk and recent action totals. Each card links to its module.",
      "Use Risk by level to identify critical, high, medium and low findings, then check Latest executions.",
      "Review Recent risks and Recent activity to find pending work.",
    ],
    [
      "Open Projects and select New project. Enter an identifiable code, name and description.",
      "Choose an available image and select Create project. If none appear, verify public storage files.",
      "Return to the list to confirm the code, name, status and image. Open the project to review related findings.",
      "Keep project codes unique so reviews can be identified correctly.",
    ],
    [
      "Open Teams, select New team and complete name, short code, time zone and optional owner.",
      "Save and confirm the list shows the owner, time zone and active status.",
      "Select Edit to change the name, time zone or owner.",
      "Use Deactivate team when it should no longer receive assignments; Reactivate team restores it.",
    ],
    [
      "In Users review each person's name, email, status, organization and active assignments.",
      "Open Assign user and select a user, team, role and position. The role defines access and the position describes the function.",
      "Save and return to confirm the team, role and position are correct.",
      "Review previous assignments before changing teams to avoid duplicate or incorrect permissions.",
    ],
    [
      "Use New risk or New vulnerability and complete name, category, description and level, severity or affected asset.",
      "Save and confirm the status in the list. Risks can be reviewed by inherent level.",
      "Use Import from JSON for multiple records and submit a valid object containing risks or vulnerabilities.",
      "Open each finding to correct data, change its status and track progress.",
    ],
    [
      "Select New review and complete code, title, description, team, owner, start date and deadline.",
      "Verify the team, owner and dates before saving.",
      "Open the detail page to start the review and record events for progress and decisions.",
      "Attach evidence, finish the review and use the timeline to verify its history.",
    ],
    [
      "Open Notifications and review the event, message, date and related review.",
      "Follow the notification link when a related resource is available.",
      "Mark individual alerts or use Mark all as read after handling pending work.",
      "If an expected alert is missing, confirm that the related action was saved.",
    ],
    [
      "Use Security Center to inspect the probability-impact matrix and identify high-exposure risks.",
      "Review Critical register and Recent activity to prioritize and understand changes.",
      "In Audit inspect actor, action, resource, date, context and result.",
      "Use these areas to confirm important actions have an owner and evidence.",
    ],
    [
      "In Administration open Positions to create functions such as analyst, supervisor or coordinator.",
      "Open Roles to define access: superadmin manages the platform; organization admin manages its organization; supervisor coordinates reviews; viewer only reads.",
      "Use Reports for team compliance. In Audit use Register audit to document external actions and attach a file.",
      "Verify the record appears and the file is linked through its Storage path.",
    ],
    [
      "In Audit review actor, action, resource, result and date.",
      "Register a manual action with Action performed and Resource or module; add a description for context.",
      "Select the backup file. It is stored in Storage, not in the table; the database keeps path, name, type and size.",
      "Select Register audit and verify confirmation. If upload fails, check bucket and permissions.",
    ],
    [
      "Open Personal information in Profile and update name, email or time zone.",
      "Select the time zone from the list and save. If the email changes, check the confirmation message.",
      "Return to Dashboard to confirm the clock and greeting use the selected time zone.",
      "Organization administrators can also view and share the invitation code here.",
    ],
  ],
  ZH: [
    [
      "在 AERION 首页查看产品价值说明，然后选择注册或登录继续使用系统。",
      "如果需要创建新账户，先创建组织并填写基本的公司或项目信息。",
      "登录后，使用侧边栏可以快速访问各个核心模块和页面。",
      "首页是开始配置环境和团队工作的入口。",
    ],
    [
      "查看评审、风险、漏洞、合规率、团队和用户指标。",
      "使用卡片和链接打开详情并发现待处理事项。",
    ],
    [
      "打开项目并选择新建项目，填写代码、名称和描述。",
      "添加可用图片，保存项目并在列表中确认状态。",
    ],
    [
      "创建团队并填写名称、代码和时区。",
      "需要时选择负责人，保存后可以编辑资料和状态。",
    ],
    [
      "按姓名搜索用户并查看当前分配。",
      "在分配用户中选择用户、团队、角色和职位，保存并确认分配已启用。",
    ],
    [
      "填写名称、类别、描述和等级来登记风险或漏洞。",
      "需要批量登记时使用 JSON 导入，并打开条目进行编辑和跟踪。",
    ],
    [
      "填写代码、标题、团队、负责人、日期和描述来创建评审。",
      "打开详情开始或完成评审，记录事件、上传证据并查看时间线。",
    ],
    [
      "打开通知查看与评审和活动相关的提醒。",
      "处理待办事项后将通知标记为已读。",
    ],
    [
      "在安全中心查看风险矩阵、严重风险和最近活动。",
      "在审计中查看操作人员、资源、时间和结果。",
    ],
    [
      "在管理模块打开职位，创建分析师、主管或协调员等职能。",
      "打开角色定义访问等级：超级管理员管理平台，组织管理员管理组织，主管协调评审，查看者只能查看。",
      "在报告中查看团队合规情况。在审计中登记外部操作并附加文件。",
      "保存后确认记录出现，并通过 Storage 路径关联文件。",
    ],
    [
      "在审计中查看操作人员、操作、资源、结果和日期。",
      "登记手动操作时填写操作和资源，可添加描述。",
      "选择备份文件。文件保存在 Storage 而不是表中，数据库只保存路径、名称、类型和大小。",
      "点击登记审计并确认成功提示；失败时检查存储桶和权限。",
    ],
    [
      "在个人信息中更新姓名、邮箱和时区。",
      "保存后确认时钟、日期和仪表板问候语使用了新时区。",
    ],
  ],
} as const;

const FLUJO = {
  ES: [
    "1. Crea la organización y define sus datos básicos.",
    "2. Registra primero los roles y sus niveles de permiso.",
    "3. Registra los cargos que ocuparán los usuarios.",
    "4. Crea los equipos y asigna la zona horaria de cada uno.",
    "5. Registra o invita a los usuarios y asígnales equipo, rol y cargo.",
    "6. Crea proyectos y luego registra riesgos y vulnerabilidades.",
    "7. Crea revisiones, define fechas y responsables, y registra evidencias.",
    "8. Da seguimiento desde el dashboard, notificaciones, seguridad y auditoría.",
  ],
  EN: [
    "1. Create the organization and define its basic data.",
    "2. Create roles first and define their permission levels.",
    "3. Create the positions users will hold.",
    "4. Create teams and assign each team's time zone.",
    "5. Register or invite users and assign a team, role and position.",
    "6. Create projects, then record risks and vulnerabilities.",
    "7. Create reviews, define dates and owners, and record evidence.",
    "8. Follow progress from the dashboard, notifications, security and audit.",
  ],
  ZH: [
    "1. 创建组织并填写基本信息。",
    "2. 先创建角色并定义权限等级。",
    "3. 创建用户将担任的职位。",
    "4. 创建团队并设置每个团队的时区。",
    "5. 注册或邀请用户，并分配团队、角色和职位。",
    "6. 创建项目，然后登记风险和漏洞。",
    "7. 创建评审，设置日期和负责人，并记录证据。",
    "8. 通过仪表板、通知、安全中心和审计跟进进度。",
  ],
} as const;

export default function ManualPage() {
  const [idioma, setIdioma] = useState<Idioma>("ES");
  const searchParams = useSearchParams();
  const [indice, setIndice] = useState(0);
  useEffect(() => {
    const leer = () => {
      const valor = window.localStorage.getItem("aerion-idioma");
      if (valor === "EN" || valor === "ZH") setIdioma(valor);
      else setIdioma("ES");
    };
    const cambiar = (evento: Event) => {
      const valor = (evento as CustomEvent<string>).detail;
      if (valor === "ES" || valor === "EN" || valor === "ZH") setIdioma(valor);
    };
    leer();
    window.addEventListener("aerion:idioma", cambiar);
    return () => window.removeEventListener("aerion:idioma", cambiar);
  }, []);
  const contenido = CONTENIDO[idioma];
  useEffect(() => {
    const modulo = searchParams.get("modulo");
    const posicion = modulo
      ? contenido.secciones.findIndex(([titulo]) =>
          titulo.toLowerCase().includes(modulo.toLowerCase()),
        )
      : 0;
    setIndice(posicion >= 0 ? posicion : 0);
  }, [searchParams, contenido.secciones]);

  const [titulo, texto] = contenido.secciones[indice];
  const anterior = () =>
    setIndice(
      (valor) =>
        (valor - 1 + contenido.secciones.length) % contenido.secciones.length,
    );
  const siguiente = () =>
    setIndice((valor) => (valor + 1) % contenido.secciones.length);

  const pasos = PASOS[idioma][indice];
  const flujoTitulo =
    idioma === "ES"
      ? "Flujo recomendado"
      : idioma === "EN"
        ? "Recommended workflow"
        : "推荐流程";
  return (
    <main className="min-h-[calc(100vh-73px)] bg-background px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm text-cyan hover:opacity-80"
          >
            ← {contenido.volver}
          </Link>
          <span className="font-mono text-xs text-muted-foreground">
            {String(indice + 1).padStart(2, "0")} /{" "}
            {String(contenido.secciones.length).padStart(2, "0")}
          </span>
        </div>
        <header className="mb-7">
          <p className="label-mono">{contenido.etiqueta}</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground">
            {contenido.titulo}
          </h1>
          <p className="mt-2 text-muted-foreground">{contenido.intro}</p>
        </header>
        <div className="mb-5 overflow-hidden rounded-xl border border-cyan/20">
          <p className="label-mono text-cyan">
            {idioma === "ES"
              ? "Flujo recomendado"
              : idioma === "EN"
                ? "Recommended workflow"
                : "推荐流程"}
          </p>
          <Image
            src={IMAGENES.flujo}
            alt={
              idioma === "ES"
                ? "Flujo recomendado de AERION"
                : idioma === "EN"
                  ? "AERION recommended workflow"
                  : "AERION 推荐流程"
            }
            width={1200}
            height={420}
            className="h-auto w-full"
            priority
            unoptimized
          />
        </div>
        <div className="grid gap-5 lg:grid-cols-[14rem_1fr]">
          <nav className="panel p-3" aria-label={contenido.titulo}>
            <div className="mb-3 flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan">
              <BookOpen className="size-4" />{" "}
              {idioma === "ES"
                ? "Módulos"
                : idioma === "EN"
                  ? "Modules"
                  : "模块"}
            </div>
            {contenido.secciones.map(([nombre], posicion) => (
              <button
                key={nombre}
                type="button"
                onClick={() => setIndice(posicion)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${posicion === indice ? "bg-cyan/15 text-cyan" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
              >
                {String(posicion + 1).padStart(2, "0")} {nombre}
              </button>
            ))}
          </nav>
          <article className="manual-reader panel relative flex min-h-[31rem] flex-col justify-between overflow-hidden p-6 sm:p-10">
            <div
              aria-hidden
              className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan/10 blur-3xl"
            />
            <div className="relative">
              <p className="label-mono text-cyan">
                {String(indice + 1).padStart(2, "0")} · {contenido.etiqueta}
              </p>
              <h2 className="mt-5 max-w-2xl font-display text-3xl font-bold text-foreground sm:text-4xl">
                {titulo}
              </h2>
              <div className="mt-5 h-px max-w-xl bg-linear-to-r from-cyan/70 to-transparent" />
              <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground">
                {texto}
              </p>
              <div className="mt-8 max-w-2xl rounded-xl border border-cyan/20 bg-cyan/5 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-cyan">
                  {idioma === "ES"
                    ? "Qué observar y cómo hacerlo"
                    : idioma === "EN"
                      ? "What to observe and how to do it"
                      : "观察内容和操作方法"}
                </p>
                <ol className="space-y-3">
                  {pasos.map((paso, posicion) => (
                    <li
                      key={paso}
                      className="flex gap-3 text-sm leading-6 text-foreground"
                    >
                      <span className="font-mono text-cyan">
                        0{posicion + 1}
                      </span>
                      <span>{paso}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="relative mt-10 flex items-center justify-between border-t border-border pt-5">
              <button
                type="button"
                onClick={anterior}
                className="flex max-w-[45%] items-center gap-2 rounded-lg border border-border px-3 py-2 text-left text-sm text-muted-foreground transition hover:border-cyan/50 hover:text-cyan"
              >
                <ArrowLeft className="size-4 shrink-0" />
                {
                  contenido.secciones[
                    (indice - 1 + contenido.secciones.length) %
                      contenido.secciones.length
                  ][0]
                }
              </button>
              <button
                type="button"
                onClick={siguiente}
                className="flex max-w-[45%] items-center gap-2 rounded-lg bg-cyan px-3 py-2 text-left text-sm font-semibold text-background transition hover:brightness-110"
              >
                {
                  contenido.secciones[
                    (indice + 1) % contenido.secciones.length
                  ][0]
                }
                <ArrowRight className="size-4 shrink-0" />
              </button>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
