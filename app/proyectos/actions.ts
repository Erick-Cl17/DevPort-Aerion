"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { obtenerContextoUsuario } from "@/lib/data";
import { ASSETS_BUCKET } from "@/lib/storage-config";

export async function crearProyecto(formData: FormData) {
    const { user, profile } = await obtenerContextoUsuario();
    if (!user || !profile?.organizacion_id) redirect("/proyectos?error=Necesitas pertenecer a una organización");

    const nombre = String(formData.get("nombre") ?? "").trim();
    const descripcion = String(formData.get("descripcion") ?? "").trim();
    const estado = String(formData.get("estado") ?? "en_progreso").trim();
    const version = Math.max(1, Number(formData.get("version")) || 1);
    const cantidadPruebas = Math.max(0, Number(formData.get("cantidad_pruebas")) || 0);

    if (!nombre) redirect("/proyectos?error=El nombre es obligatorio");

    const supabase = await createClient();

    const rutaExistente = String(formData.get("imagen_existente") ?? "").trim();
    let imagen_url: string;
    let imagen_path: string;

    if (rutaExistente) {
        imagen_path = rutaExistente;
        imagen_url = supabase.storage.from(ASSETS_BUCKET).getPublicUrl(rutaExistente).data.publicUrl;
    } else {
        const archivo = formData.get("imagen");
        if (!(archivo instanceof File) || archivo.size === 0) {
            redirect("/proyectos?error=Selecciona una imagen nueva o una existente");
        }
        if (!archivo.type.startsWith("image/")) {
            redirect("/proyectos?error=El archivo debe ser una imagen");
        }

        const extension = archivo.name.split(".").pop()?.toLowerCase() || "jpg";
        imagen_path = `proyectos/${profile.organizacion_id}/${crypto.randomUUID()}.${extension}`;
        const { error: errorSubida } = await supabase.storage
            .from(ASSETS_BUCKET)
            .upload(imagen_path, archivo, { contentType: archivo.type, upsert: false });
        if (errorSubida) redirect(`/proyectos?error=${encodeURIComponent(errorSubida.message)}`);

        imagen_url = supabase.storage.from(ASSETS_BUCKET).getPublicUrl(imagen_path).data.publicUrl;
    }

    const codigo = `PRO-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const { error } = await supabase.from("proyectos").insert({
        organizacion_id: profile.organizacion_id,
        codigo,
        nombre,
        descripcion: descripcion || null,
        imagen_url,
        imagen_path,
        creado_por: user.id,
        estado,
        version,
        cantidad_pruebas: cantidadPruebas,
    });
    if (error) redirect(`/proyectos?error=${encodeURIComponent(error.message)}`);
    redirect("/proyectos?ok=1");
}