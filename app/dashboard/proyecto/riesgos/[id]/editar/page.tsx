import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { obtenerContextoUsuario } from "@/lib/data";

export default async function EditarRiesgoPage({
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
    const { data: riesgo } = await supabase
        .from("riesgos")
        .select("*")
        .eq("id", id)
        .eq("organizacion_id", profile?.organizacion_id ?? "")
        .single();

    if (!riesgo) notFound();

    async function actualizar(formData: FormData) {
        "use server";
        const { profile } = await obtenerContextoUsuario();
        if (!profile?.organizacion_id) redirect("/login");
        const nombre = String(formData.get("nombre") ?? "").trim();
        if (!nombre) redirect(`/dashboard/proyecto/riesgos/${id}/editar?error=El nombre es obligatorio`);

        const supabase = await createClient();
        const { error } = await supabase.from("riesgos").update({
            nombre,
            descripcion: String(formData.get("descripcion") ?? "").trim() || null,
            categoria: String(formData.get("categoria") ?? "").trim() || null,
            probabilidad: Number(formData.get("probabilidad")),
            impacto: Number(formData.get("impacto")),
            tratamiento: String(formData.get("tratamiento") ?? "Mitigar"),
            estado: String(formData.get("estado") ?? "Identificado"),
        }).eq("id", id).eq("organizacion_id", profile.organizacion_id);
        if (error) redirect(`/dashboard/proyecto/riesgos/${id}/editar?error=${encodeURIComponent(error.message)}`);
        redirect("/dashboard/proyecto");
    }

    return (
        <section className="max-w-xl mx-auto px-6 py-10">
            <Link href="/dashboard/proyecto" className="text-sm text-cyan hover:opacity-80">← Volver a Proyecto</Link>
            <h1 className="mt-4 mb-1 font-display text-2xl font-bold text-foreground">Editar riesgo</h1>
            <p className="mb-6 font-mono text-xs text-muted-foreground">{riesgo.codigo} · {id}</p>
            {error && <p className="mb-4 rounded-lg border border-critical/40 bg-critical/10 px-4 py-3 text-sm text-critical">{error}</p>}
            <form action={actualizar} className="panel flex flex-col gap-4 p-6">
                <input name="nombre" required defaultValue={riesgo.nombre} placeholder="Nombre" className="rounded-lg border border-border bg-secondary px-4 py-3 text-foreground" />
                <textarea name="descripcion" defaultValue={riesgo.descripcion ?? ""} placeholder="Descripción" rows={3} className="rounded-lg border border-border bg-secondary px-4 py-3 text-foreground" />
                <input name="categoria" defaultValue={riesgo.categoria ?? ""} placeholder="Categoría" className="rounded-lg border border-border bg-secondary px-4 py-3 text-foreground" />
                <div className="grid grid-cols-2 gap-3">
                    <select name="probabilidad" defaultValue={String(riesgo.probabilidad)} className="rounded-lg border border-border bg-secondary px-4 py-3 text-foreground">{[1, 2, 3, 4, 5].map((value) => <option key={value}>{value}</option>)}</select>
                    <select name="impacto" defaultValue={String(riesgo.impacto)} className="rounded-lg border border-border bg-secondary px-4 py-3 text-foreground">{[1, 2, 3, 4, 5].map((value) => <option key={value}>{value}</option>)}</select>
                </div>
                <select name="tratamiento" defaultValue={riesgo.tratamiento ?? "Mitigar"} className="rounded-lg border border-border bg-secondary px-4 py-3 text-foreground">{["Mitigar", "Aceptar", "Transferir", "Evitar"].map((value) => <option key={value}>{value}</option>)}</select>
                <select name="estado" defaultValue={riesgo.estado ?? "Identificado"} className="rounded-lg border border-border bg-secondary px-4 py-3 text-foreground">{["Identificado", "En evaluación", "Tratamiento", "Mitigado", "Aceptado", "Cerrado"].map((value) => <option key={value}>{value}</option>)}</select>
                <button type="submit" className="rounded-lg bg-gradient-accent px-4 py-3 font-semibold text-primary-foreground hover:opacity-90">Guardar cambios</button>
            </form>
        </section>
    );
}
