import { createClient } from "@/lib/supabase-server";
import { obtenerContextoUsuario } from "@/lib/data";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function NotificacionesPage() {
    const supabase = await createClient();
    const { user } = await obtenerContextoUsuario();

    const { data: notificaciones } = await supabase
        .from("notificaciones")
        .select("id, mensaje, evento, estado, revision_id, created_at")
        .eq("destinatario_id", user!.id)
        .order("created_at", { ascending: false });

    async function marcarLeida(formData: FormData) {
        "use server";
        const supabase = await createClient();
        const notifId = formData.get("notificacion_id") as string;

        await supabase
            .from("notificaciones")
            .update({ estado: "leida", leida_at: new Date().toISOString() })
            .eq("id", notifId);

        redirect("/dashboard/notificaciones");
    }

    return (
        <section className="max-w-2xl mx-auto px-6 py-10">
            <h1 className="font-display text-2xl font-bold text-foreground mb-6">Notificaciones</h1>

            <div className="panel divide-y divide-border">
                {(notificaciones ?? []).map((n) => (
                    <div key={n.id} className="px-4 py-3 flex items-center justify-between gap-3 text-sm">
                        <div>
                            {n.revision_id ? (
                                <Link
                                    href={`/dashboard/revisiones/${n.revision_id}`}
                                    className="text-foreground hover:underline"
                                >
                                    {n.mensaje}
                                </Link>
                            ) : (
                                <span className="text-foreground">{n.mensaje}</span>
                            )}
                            <p className="text-muted-foreground text-xs mt-0.5">
                                {new Date(n.created_at).toLocaleString("es-EC")}
                            </p>
                        </div>
                        {n.estado !== "leida" ? (
                            <form action={marcarLeida}>
                                <input type="hidden" name="notificacion_id" value={n.id} />
                                <button
                                    type="submit"
                                    className="text-xs text-primary hover:underline shrink-0"
                                >
                                    Marcar leída
                                </button>
                            </form>
                        ) : (
                            <span className="text-xs text-muted-foreground shrink-0">Leída</span>
                        )}
                    </div>
                ))}
                {(notificaciones ?? []).length === 0 && (
                    <p className="px-4 py-8 text-center text-muted-foreground text-sm">
                        No tienes notificaciones.
                    </p>
                )}
            </div>
        </section>
    );
}
