import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { obtenerContextoUsuario } from "@/lib/data";
import { crearProyecto } from "./actions";
import { ASSETS_BUCKET } from "@/lib/storage-config";
import SelectorImagenProyecto from "@/components/SelectorImagenProyecto";

export default async function ProyectosPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
    const { error, ok } = await searchParams;
    const { profile } = await obtenerContextoUsuario();
    const supabase = await createClient();
    const { data: proyectos } = await supabase.from("proyectos").select("id, codigo, nombre, descripcion, imagen_url, created_at").eq("organizacion_id", profile?.organizacion_id ?? "").order("created_at", { ascending: false });

    const { data: archivos } = await supabase.storage
        .from(ASSETS_BUCKET)
        .list(`proyectos/${profile?.organizacion_id}`, { limit: 100, sortBy: { column: "created_at", order: "desc" } });

    const imagenesExistentes = (archivos ?? []).map((f) => {
        const ruta = `proyectos/${profile?.organizacion_id}/${f.name}`;
        const { data: pub } = supabase.storage.from(ASSETS_BUCKET).getPublicUrl(ruta);
        return { path: ruta, url: pub.publicUrl };
    });

    return (
        <section className="min-h-[calc(100vh-73px)] bg-background px-6 py-10">
            <div className="mx-auto max-w-6xl space-y-8">
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="label-mono">Proyectos</p>
                        <h1 className="mt-1 font-display text-3xl font-bold text-foreground">Proyectos de la organización</h1>
                    </div>
                    <Link href="#nuevo-proyecto" className="w-fit rounded-lg bg-gradient-accent px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">+ Registrar nuevo proyecto</Link>
                </header>
                {error && <p className="rounded-lg border border-critical/40 bg-critical/10 px-4 py-3 text-sm text-critical">{error}</p>}
                {ok && <p className="rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">Proyecto registrado correctamente.</p>}

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {(proyectos ?? []).map((proyecto) => (
                        <article key={proyecto.id} className="panel circuit-frame overflow-hidden">
                            <div className="relative aspect-[16/9] bg-secondary">
                                {proyecto.imagen_url && <Image src={proyecto.imagen_url} alt={proyecto.nombre} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />}
                            </div>
                            <div className="p-5">
                                <p className="font-mono text-xs text-cyan">{proyecto.codigo}</p>
                                <h2 className="mt-2 font-display text-lg font-bold text-foreground">{proyecto.nombre}</h2>
                                {proyecto.descripcion && <p className="mt-2 text-sm text-muted-foreground">{proyecto.descripcion}</p>}
                                <Link href={`/dashboard/proyecto?proyecto_id=${proyecto.id}`} className="mt-4 inline-block text-xs font-semibold text-cyan hover:opacity-80">Ver evaluaciones</Link>
                            </div>
                        </article>
                    ))}
                </div>
                {(!proyectos || proyectos.length === 0) && <p className="panel py-12 text-center text-sm text-muted-foreground">Todavía no hay proyectos registrados.</p>}

                <div id="nuevo-proyecto" className="panel corner-ticks max-w-2xl p-6">
                    <p className="label-mono">Nuevo registro</p>
                    <h2 className="mt-1 font-display text-xl font-bold text-foreground">Registrar proyecto</h2>
                    <form action={crearProyecto} encType="multipart/form-data" className="mt-5 grid gap-4">
                        <input name="nombre" required placeholder="Nombre del proyecto" className="rounded-lg border border-border bg-secondary px-4 py-3 text-foreground" />
                        <textarea name="descripcion" rows={3} placeholder="Descripción (opcional)" className="rounded-lg border border-border bg-secondary px-4 py-3 text-foreground" />

                        <label className="text-sm text-muted-foreground">
                            Estado
                            <select name="estado" defaultValue="en_progreso" className="mt-1 w-full rounded-lg border border-border bg-secondary px-4 py-3 text-foreground">
                                <option value="en_progreso">En progreso</option>
                                <option value="pausado">Pausado</option>
                                <option value="finalizado">Finalizado</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            <label className="text-sm text-muted-foreground">
                                Versión
                                <input type="number" name="version" min={1} defaultValue={1} className="mt-1 w-full rounded-lg border border-border bg-secondary px-4 py-3 text-foreground" />
                            </label>
                            <label className="text-sm text-muted-foreground">
                                Cantidad de pruebas
                                <input type="number" name="cantidad_pruebas" min={0} defaultValue={0} className="mt-1 w-full rounded-lg border border-border bg-secondary px-4 py-3 text-foreground" />
                            </label>
                        </div>

                        <SelectorImagenProyecto imagenesExistentes={imagenesExistentes} />

                        <button type="submit" className="rounded-lg bg-gradient-accent px-4 py-3 font-semibold text-primary-foreground hover:opacity-90">Guardar proyecto</button>
                    </form>
                </div>
            </div>
        </section>
    );
}