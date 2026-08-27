import { createClient } from "@/lib/supabase-server";
import { EVIDENCIAS_BUCKET } from "@/lib/storage-config";
import { obtenerContextoUsuario } from "@/lib/data";
import { redirect } from "next/navigation";

async function registrarAuditoria(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { user } = await obtenerContextoUsuario();
    if (!user) redirect("/login");

    const accion = String(formData.get("accion") ?? "").trim();
    const recurso = String(formData.get("recurso") ?? "").trim();
    const mensaje = String(formData.get("mensaje") ?? "").trim();
    const archivo = formData.get("archivo");
    if (!accion || !recurso || !(archivo instanceof File) || archivo.size === 0) {
        redirect("/dashboard/auditoria?error=Completa la acción, el recurso y selecciona un archivo");
    }

    const extension = archivo.name.includes(".") ? archivo.name.slice(archivo.name.lastIndexOf(".")) : "";
    const ruta = `${user!.id}/${Date.now()}-${crypto.randomUUID()}${extension}`;
    const { error: cargaError } = await supabase.storage.from(EVIDENCIAS_BUCKET).upload(ruta, archivo, {
        contentType: archivo.type || "application/octet-stream",
        upsert: false,
    });
    if (cargaError) redirect(`/dashboard/auditoria?error=${encodeURIComponent(cargaError.message)}`);

    const { error } = await supabase.from("auditoria").insert({
        actor_id: user!.id,
        accion,
        recurso,
        mensaje: mensaje || null,
        resultado: "exito",
        contexto: { archivo: { nombre: archivo.name, tipo: archivo.type || "desconocido", tamano: archivo.size, storage_path: ruta } },
    });
    if (error) {
        await supabase.storage.from(EVIDENCIAS_BUCKET).remove([ruta]);
        redirect(`/dashboard/auditoria?error=${encodeURIComponent(error.message)}`);
    }
    redirect("/dashboard/auditoria?ok=1");
}

export default async function AuditoriaPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; q?: string; resultado?: string }> }) {
    const { error: errorParam, ok, q = "", resultado = "" } = await searchParams;
    const supabase = await createClient();

    // La política RLS auditoria_lectura_admin ya limita esto a superadmin
    // o a las propias acciones del usuario — no hace falta filtrar aquí.
    let consulta = supabase
        .from("auditoria")
        .select("accion, recurso, resultado, fecha_hora, mensaje, contexto, actor:actor_id(nombre, apellido)")
        .order("fecha_hora", { ascending: false })
        .limit(100);
    if (q.trim()) consulta = consulta.or(`accion.ilike.%${q.trim()}%,recurso.ilike.%${q.trim()}%,mensaje.ilike.%${q.trim()}%`);
    if (resultado === "exito" || resultado === "fallo") consulta = consulta.eq("resultado", resultado);
    const { data: registros } = await consulta;

    return (
        <section className="max-w-4xl mx-auto px-6 py-10">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Auditoría</h1>
            <p className="text-muted-foreground text-sm mb-8">
                Últimas 100 acciones registradas (solo ves las tuyas, salvo que seas Superadmin)
            </p>

            {errorParam && <p className="mb-4 rounded-lg border border-critical/40 bg-critical/10 px-4 py-3 text-sm text-critical">{errorParam}</p>}
            {ok && <p className="mb-4 rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">Registro guardado correctamente.</p>}

            <form method="get" className="mb-6 flex flex-col gap-3 sm:flex-row">
                <input name="q" defaultValue={q} placeholder="Buscar acción, recurso o descripción" className="min-w-0 flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground" />
                <select name="resultado" defaultValue={resultado} className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"><option value="">Todos los resultados</option><option value="exito">Éxito</option><option value="fallo">Fallo</option></select>
                <button type="submit" className="rounded-lg border border-cyan/40 px-4 py-2 text-sm font-semibold text-cyan hover:bg-cyan/10">Filtrar</button>
            </form>

            <form action={registrarAuditoria} className="panel mb-6 grid gap-4 p-5 sm:grid-cols-2">
                <h2 className="font-display text-lg font-semibold text-foreground sm:col-span-2">Registrar acción</h2>
                <input name="accion" required placeholder="Acción realizada" className="rounded-lg border border-border bg-secondary px-3 py-2 text-foreground" />
                <input name="recurso" required placeholder="Recurso o módulo" className="rounded-lg border border-border bg-secondary px-3 py-2 text-foreground" />
                <textarea name="mensaje" placeholder="Descripción (opcional)" rows={2} className="rounded-lg border border-border bg-secondary px-3 py-2 text-foreground sm:col-span-2" />
                <label className="text-sm text-muted-foreground sm:col-span-2">Archivo de respaldo<input type="file" name="archivo" required className="mt-2 block w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground" /></label>
                <button type="submit" className="rounded-lg bg-gradient-accent px-4 py-2.5 text-sm font-semibold text-primary-foreground sm:col-span-2">Registrar auditoría</button>
            </form>

            <div className="panel divide-y divide-border">
                {(registros ?? []).map((r: any, i: number) => (
                    <div key={i} className="px-4 py-3 flex items-center justify-between text-sm">
                        <div>
                            <p className="text-foreground">
                                <span className="font-medium">{r.actor?.nombre} {r.actor?.apellido}</span>{" "}
                                <span className="text-muted-foreground">— {r.accion} en {r.recurso}</span>
                            </p>
                            {r.mensaje && <p className="mt-1 text-xs text-muted-foreground">{r.mensaje}</p>}
                            {r.contexto?.archivo?.storage_path && <p className="mt-1 text-xs text-cyan">Archivo: {r.contexto.archivo.nombre}</p>}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={r.resultado === "exito" ? "text-success text-xs" : "text-critical text-xs"}>
                                {r.resultado}
                            </span>
                            <span className="text-muted-foreground text-xs">
                                {new Date(r.fecha_hora).toLocaleString("es-EC")}
                            </span>
                        </div>
                    </div>
                ))}
                {(registros ?? []).length === 0 && (
                    <p className="px-4 py-8 text-center text-muted-foreground text-sm">
                        No hay registros de auditoría visibles todavía.
                    </p>
                )}
            </div>
        </section>
    );
}
