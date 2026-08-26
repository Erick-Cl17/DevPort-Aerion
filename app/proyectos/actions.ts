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
    const archivo = formData.get("imagen");
    if (!nombre || !(archivo instanceof File) || archivo.size === 0) redirect("/proyectos?error=El nombre y la imagen son obligatorios");
    if (!archivo.type.startsWith("image/")) redirect("/proyectos?error=El archivo debe ser una imagen");

    const supabase = await createClient();
    const extension = archivo.name.split(".").pop()?.toLowerCase() || "jpg";
    const ruta = `proyectos/${profile.organizacion_id}/${crypto.randomUUID()}.${extension}`;
    const { error: errorSubida } = await supabase.storage.from(ASSETS_BUCKET).upload(ruta, archivo, { contentType: archivo.type, upsert: false });
    if (errorSubida) redirect(`/proyectos?error=${encodeURIComponent(errorSubida.message)}`);

    const { data: publico } = supabase.storage.from(ASSETS_BUCKET).getPublicUrl(ruta);
    const codigo = `PRO-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const { error } = await supabase.from("proyectos").insert({ organizacion_id: profile.organizacion_id, codigo, nombre, descripcion: descripcion || null, imagen_url: publico.publicUrl, imagen_path: ruta, creado_por: user.id });
    if (error) redirect(`/proyectos?error=${encodeURIComponent(error.message)}`);
    redirect("/proyectos?ok=1");
}
