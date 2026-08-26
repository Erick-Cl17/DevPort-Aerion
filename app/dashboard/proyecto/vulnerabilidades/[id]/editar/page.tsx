import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { obtenerContextoUsuario } from "@/lib/data";

export default async function EditarVulnerabilidadPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ error?: string }>;
}) {
    const { id } = await params;
    const { error } = await searchParams;
    const { profile } = await obtenerContextoUsuario();
    const supabase = await createClient();
    const { data: vulnerabilidad } = await supabase
        .from("vulnerabilidades")
        .select("*")
        .eq("id", id)
        .eq("organizacion_id", profile?.organizacion_id ?? "")
        .single();

    if (!vulnerabilidad) notFound();

    async function actualizar(formData: FormData) {
        "use server";
        const { profile } = await obtenerContextoUsuario();
        if (!profile?.organizacion_id) redirect("/login");
        const nombre = String(formData.get("nombre") ?? "").trim();
        if (!nombre) redirect(`/dashboard/proyecto/vulnerabilidades/${id}/editar?error=El nombre es obligatorio`);

        const supabase = await createClient();
        const { error } = await supabase.from("vulnerabilidades").update({
            nombre,
            descripcion: String(formData.get("descripcion") ?? "").trim() || null,
            categoria: String(formData.get("categoria") ?? "").trim() || null,
            severidad: String(formData.get("severidad") ?? "Media"),
            activo_afectado: String(formData.get("activo_afectado") ?? "").trim() || null,
        }).eq("id", id).eq("organizacion_id", profile.organizacion_id);
        if (error) redirect(`/dashboard/proyecto/vulnerabilidades/${id}/editar?error=${encodeURIComponent(error.message)}`);
        redirect("/dashboard/proyecto");
    }

    return (
        <section className="max-w-xl mx-auto px-6 py-10">
            <Link href="/dashboard/proyecto" className="text-sm text-cyan hover:opacity-80">← Volver a Proyecto</Link>
            <h1 className="mt-4 mb-1 font-display text-2xl font-bold text-foreground">Editar vulnerabilidad</h1>
            <p className="mb-6 font-mono text-xs text-muted-foreground">{vulnerabilidad.codigo} · {id}</p>
            {error && <p className="mb-4 rounded-lg border border-critical/40 bg-critical/10 px-4 py-3 text-sm text-critical">{error}</p>}
            <form action={actualizar} className="panel flex flex-col gap-4 p-6">
                <input name="nombre" required defaultValue={vulnerabilidad.nombre} placeholder="Nombre" className="rounded-lg border border-border bg-secondary px-4 py-3 text-foreground" />
                <textarea name="descripcion" defaultValue={vulnerabilidad.descripcion ?? ""} placeholder="Descripción" rows={3} className="rounded-lg border border-border bg-secondary px-4 py-3 text-foreground" />
                <input name="categoria" defaultValue={vulnerabilidad.categoria ?? ""} placeholder="Categoría" className="rounded-lg border border-border bg-secondary px-4 py-3 text-foreground" />
                <input name="activo_afectado" defaultValue={vulnerabilidad.activo_afectado ?? ""} placeholder="Activo afectado" className="rounded-lg border border-border bg-secondary px-4 py-3 text-foreground" />
                <select name="severidad" defaultValue={vulnerabilidad.severidad ?? "Media"} className="rounded-lg border border-border bg-secondary px-4 py-3 text-foreground">{["Crítica", "Alta", "Media", "Baja"].map((value) => <option key={value}>{value}</option>)}</select>
                <button type="submit" className="rounded-lg bg-gradient-accent px-4 py-3 font-semibold text-primary-foreground hover:opacity-90">Guardar cambios</button>
            </form>
        </section>
    );
}
