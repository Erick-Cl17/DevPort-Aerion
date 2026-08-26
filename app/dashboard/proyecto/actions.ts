"use server";

import { createClient } from "@/lib/supabase-server";
import { obtenerContextoUsuario } from "@/lib/data";
import { registrarAuditoria } from "@/lib/auditoria";
import { redirect } from "next/navigation";

// Un riesgo o vulnerabilidad tal como llega del formulario manual o de un
// bloque dentro del JSON subido. Todos los campos son opcionales menos
// "nombre" — el resto se completa con valores por defecto razonables.
type FilaRiesgo = {
    codigo?: string;
    nombre: string;
    descripcion?: string;
    categoria?: string;
    activo?: string;
    amenaza?: string;
    probabilidad?: number;
    impacto?: number;
    tratamiento?: string;
    estado?: string;
    responsable?: string;
};

type FilaVulnerabilidad = {
    codigo?: string;
    nombre: string;
    descripcion?: string;
    categoria?: string;
    severidad?: string;
    activo_afectado?: string;
    estado?: string;
};

function siguienteCodigo(prefijo: string) {
    // Código legible simple; no garantiza consecutivos sin huecos, pero
    // evita duplicados exactos gracias al sufijo aleatorio.
    return `${prefijo}-${Date.now().toString(36).toUpperCase().slice(-5)}`;
}

export async function crearRiesgoManual(formData: FormData) {
    const { user, profile } = await obtenerContextoUsuario();
    if (!user || !profile?.organizacion_id) {
        redirect("/dashboard/proyecto?error=" + encodeURIComponent("Necesitas pertenecer a una organización."));
    }

    const nombre = ((formData.get("nombre") as string) ?? "").trim();
    const proyectoId = ((formData.get("proyecto_id") as string) ?? "").trim();
    if (!nombre || !proyectoId) {
        redirect("/dashboard/proyecto?error=" + encodeURIComponent("El nombre del riesgo es obligatorio."));
    }

    const supabase = await createClient();
    const { error } = await supabase.from("riesgos").insert({
        organizacion_id: profile!.organizacion_id,
        proyecto_id: proyectoId,
        codigo: ((formData.get("codigo") as string) || "").trim() || siguienteCodigo("RSK"),
        nombre,
        descripcion: (formData.get("descripcion") as string) || null,
        categoria: (formData.get("categoria") as string) || null,
        activo: (formData.get("activo") as string) || null,
        amenaza: (formData.get("amenaza") as string) || null,
        probabilidad: Number(formData.get("probabilidad")) || 3,
        impacto: Number(formData.get("impacto")) || 3,
        tratamiento: (formData.get("tratamiento") as string) || "Mitigar",
        estado: (formData.get("estado") as string) || "Identificado",
        responsable: (formData.get("responsable") as string) || null,
        creado_por: user!.id,
    });

    if (error) {
        console.error("Error creando riesgo:", error);
        redirect("/dashboard/proyecto?error=" + encodeURIComponent("No se pudo guardar el riesgo: " + error.message));
    }

    await registrarAuditoria({
        actorId: user!.id,
        accion: "crear_riesgo",
        recurso: "riesgos",
        contexto: { nombre },
    });

    redirect("/dashboard/proyecto?ok=riesgo");
}

export async function crearVulnerabilidadManual(formData: FormData) {
    const { user, profile } = await obtenerContextoUsuario();
    if (!user || !profile?.organizacion_id) {
        redirect("/dashboard/proyecto?error=" + encodeURIComponent("Necesitas pertenecer a una organización."));
    }

    const nombre = ((formData.get("nombre") as string) ?? "").trim();
    const proyectoId = ((formData.get("proyecto_id") as string) ?? "").trim();
    if (!nombre || !proyectoId) {
        redirect("/dashboard/proyecto?error=" + encodeURIComponent("El nombre de la vulnerabilidad es obligatorio."));
    }

    const supabase = await createClient();
    const { error } = await supabase.from("vulnerabilidades").insert({
        organizacion_id: profile!.organizacion_id,
        proyecto_id: proyectoId,
        codigo: ((formData.get("codigo") as string) || "").trim() || siguienteCodigo("VUL"),
        nombre,
        descripcion: (formData.get("descripcion") as string) || null,
        categoria: (formData.get("categoria") as string) || null,
        severidad: (formData.get("severidad") as string) || "Media",
        activo_afectado: (formData.get("activo_afectado") as string) || null,
        creado_por: user!.id,
    });

    if (error) {
        console.error("Error creando vulnerabilidad:", error);
        redirect("/dashboard/proyecto?error=" + encodeURIComponent("No se pudo guardar la vulnerabilidad: " + error.message));
    }

    await registrarAuditoria({
        actorId: user!.id,
        accion: "crear_vulnerabilidad",
        recurso: "vulnerabilidades",
        contexto: { nombre },
    });

    redirect("/dashboard/proyecto?ok=vulnerabilidad");
}

// Recibe el JSON ya parseado en el cliente (como texto, dentro de un campo
// oculto del formulario) y hace la inserción masiva en el servidor.
export async function importarDesdeJson(formData: FormData) {
    const { user, profile } = await obtenerContextoUsuario();
    if (!user || !profile?.organizacion_id) {
        redirect("/dashboard/proyecto?error=" + encodeURIComponent("Necesitas pertenecer a una organización."));
    }

    const crudo = (formData.get("json") as string) ?? "";
    let datos: { riesgos?: FilaRiesgo[]; vulnerabilidades?: FilaVulnerabilidad[] };

    try {
        datos = JSON.parse(crudo);
    } catch {
        redirect("/dashboard/proyecto?error=" + encodeURIComponent("El archivo no es un JSON válido."));
    }

    const riesgos = Array.isArray(datos!.riesgos) ? datos!.riesgos : [];
    const vulnerabilidades = Array.isArray(datos!.vulnerabilidades) ? datos!.vulnerabilidades : [];

    if (riesgos.length === 0 && vulnerabilidades.length === 0) {
        redirect(
            "/dashboard/proyecto?error=" +
                encodeURIComponent('El JSON debe tener al menos "riesgos" o "vulnerabilidades" con elementos.')
        );
    }

    const supabase = await createClient();
    let insertados = 0;
    const errores: string[] = [];

    if (riesgos.length > 0) {
        const filas = riesgos
            .filter((r) => (r.nombre ?? "").trim().length > 0)
            .map((r) => ({
                organizacion_id: profile!.organizacion_id,
                codigo: (r.codigo || "").trim() || siguienteCodigo("RSK"),
                nombre: r.nombre.trim(),
                descripcion: r.descripcion ?? null,
                categoria: r.categoria ?? null,
                activo: r.activo ?? null,
                amenaza: r.amenaza ?? null,
                probabilidad: Number(r.probabilidad) >= 1 && Number(r.probabilidad) <= 5 ? Number(r.probabilidad) : 3,
                impacto: Number(r.impacto) >= 1 && Number(r.impacto) <= 5 ? Number(r.impacto) : 3,
                tratamiento: r.tratamiento ?? "Mitigar",
                estado: r.estado ?? "Identificado",
                responsable: r.responsable ?? null,
                creado_por: user!.id,
            }));

        if (filas.length > 0) {
            const { data, error } = await supabase.from("riesgos").insert(filas).select("id");
            if (error) errores.push("riesgos: " + error.message);
            else insertados += data?.length ?? filas.length;
        }
    }

    if (vulnerabilidades.length > 0) {
        const filas = vulnerabilidades
            .filter((v) => (v.nombre ?? "").trim().length > 0)
            .map((v) => ({
                organizacion_id: profile!.organizacion_id,
                codigo: (v.codigo || "").trim() || siguienteCodigo("VUL"),
                nombre: v.nombre.trim(),
                descripcion: v.descripcion ?? null,
                categoria: v.categoria ?? null,
                severidad: v.severidad ?? "Media",
                activo_afectado: v.activo_afectado ?? null,
                creado_por: user!.id,
            }));

        if (filas.length > 0) {
            const { data, error } = await supabase
                .from("vulnerabilidades")
                .insert(filas)
                .select("id");
            if (error) errores.push("vulnerabilidades: " + error.message);
            else insertados += data?.length ?? filas.length;
        }
    }

    await registrarAuditoria({
        actorId: user!.id,
        accion: "importar_json_riesgos",
        recurso: "riesgos_vulnerabilidades",
        contexto: { insertados, errores },
        resultado: errores.length > 0 ? "fallo" : "exito",
    });

    if (errores.length > 0) {
        redirect("/dashboard/proyecto?error=" + encodeURIComponent(`Se importaron ${insertados}, pero hubo errores: ${errores.join("; ")}`));
    }

    redirect(`/dashboard/proyecto?ok=import&n=${insertados}`);
}
