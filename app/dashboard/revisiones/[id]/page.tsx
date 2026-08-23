import { createClient } from "@/lib/supabase-server";
import { formatearEnZona } from "@/lib/timezonedb";
import { redirect, notFound } from "next/navigation";

export default async function DetalleRevisionPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: revision } = await supabase
        .from("revisiones_estado")
        .select("*, equipos(nombre), responsable:responsable_id(nombre, apellido)")
        .eq("id", id)
        .single();

    if (!revision) notFound();

    const { data: eventos } = await supabase
        .from("revision_eventos")
        .select("tipo_evento, fecha_hora, actor:actor_id(nombre, apellido)")
        .eq("revision_id", id)
        .order("fecha_hora", { ascending: false });

    const esResponsable = revision.responsable_id === user!.id;

    async function iniciar() {
        "use server";
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        await supabase
            .from("revisiones")
            .update({ fecha_inicio_real: new Date().toISOString() })
            .eq("id", id);

        await supabase.from("revision_eventos").insert({
            revision_id: id,
            tipo_evento: "inicio",
            actor_id: user!.id,
        });

        redirect(`/dashboard/revisiones/${id}`);
    }

    async function finalizar() {
        "use server";
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        await supabase
            .from("revisiones")
            .update({ fecha_fin_real: new Date().toISOString() })
            .eq("id", id);

        await supabase.from("revision_eventos").insert({
            revision_id: id,
            tipo_evento: "finalizacion",
            actor_id: user!.id,
        });

        redirect(`/dashboard/revisiones/${id}`);
    }

    async function cancelar() {
        "use server";
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        await supabase.from("revisiones").update({ cancelada: true }).eq("id", id);

        await supabase.from("revision_eventos").insert({
            revision_id: id,
            tipo_evento: "cancelacion",
            actor_id: user!.id,
        });

        redirect(`/dashboard/revisiones/${id}`);
    }

    return (
        <section className="max-w-3xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-2">
                <h1 className="font-display text-2xl font-bold text-foreground">
                    {revision.codigo} · {revision.titulo}
                </h1>
                <span className="text-sm font-medium text-cyan">{revision.estado}</span>
            </div>
            <p className="text-muted-foreground mb-8">
                Equipo: {revision.equipos?.nombre} · Responsable: {revision.responsable?.nombre}{" "}
                {revision.responsable?.apellido}
            </p>

            <div className="panel p-6 grid sm:grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                    <p className="text-muted-foreground text-xs mb-1">Inicio del plazo</p>
                    <p className="text-foreground">
                        {formatearEnZona(revision.fecha_inicio_plazo, revision.zona_horaria_plazo)}
                    </p>
                </div>
                <div>
                    <p className="text-muted-foreground text-xs mb-1">Fin del plazo</p>
                    <p className="text-foreground">
                        {formatearEnZona(revision.fecha_fin_plazo, revision.zona_horaria_plazo)}
                    </p>
                </div>
                {revision.descripcion && (
                    <div className="sm:col-span-2">
                        <p className="text-muted-foreground text-xs mb-1">Descripción</p>
                        <p className="text-foreground">{revision.descripcion}</p>
                    </div>
                )}
            </div>

            {esResponsable && !revision.cancelada && (
                <div className="flex gap-3 mb-8">
                    {!revision.fecha_inicio_real && (
                        <form action={iniciar}>
                            <button className="bg-gradient-accent text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90">
                                Iniciar revisión
                            </button>
                        </form>
                    )}
                    {revision.fecha_inicio_real && !revision.fecha_fin_real && (
                        <form action={finalizar}>
                            <button className="bg-success text-background text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90">
                                Finalizar revisión
                            </button>
                        </form>
                    )}
                    {!revision.fecha_fin_real && (
                        <form action={cancelar}>
                            <button className="border border-critical text-critical text-sm font-semibold px-4 py-2 rounded-lg hover:bg-critical/10">
                                Cancelar
                            </button>
                        </form>
                    )}
                </div>
            )}

            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Cronología</h2>
            <ul className="panel divide-y divide-border">
                {(eventos ?? []).map((ev: any, i: number) => (
                    <li key={i} className="px-4 py-3 text-sm flex justify-between">
                        <span className="text-foreground capitalize">{ev.tipo_evento}</span>
                        <span className="text-muted-foreground">
                            {ev.actor?.nombre} {ev.actor?.apellido} ·{" "}
                            {new Date(ev.fecha_hora).toLocaleString("es-EC")}
                        </span>
                    </li>
                ))}
                {(eventos ?? []).length === 0 && (
                    <li className="px-4 py-6 text-center text-muted-foreground text-sm">
                        Sin eventos registrados todavía.
                    </li>
                )}
            </ul>
        </section>
    );
}
