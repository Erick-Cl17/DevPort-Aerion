import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { obtenerContextoUsuario } from "@/lib/data";
import { redirect } from "next/navigation";
import SelectorIdioma from "@/components/SelectorIdioma";
import HeaderNotificaciones from "@/components/HeaderNotificaciones";
import HeaderPerfil from "@/components/HeaderPerfil";
import RelojZonaHoraria from "@/components/RelojZonaHoraria";

// Aquí se agrega además el nombre de la organización y el nivel de rol más alto del 
// usuario, porque en AERION el menú debe reflejar el alcance (organización/equipo)

// El contexto (usuario + perfil + rol) se obtiene UNA sola vez por petición gracias a 
// obtenerContextoUsuario() (lib/data.ts), que usa cache() de React — así el Navbar y 
// la página que se esté mostrando no duplican las mismas consultas a Supabase.
export default async function Navbar() {
    const { user, profile, organizacionNombre, nivel } = await obtenerContextoUsuario();

    let noLeidas = 0;
    let recientes: { id: string; mensaje: string; evento: string; revision_id: string | null; created_at: string; estado: string }[] = [];

    if (user) {
        const supabase = await createClient();
        const [{ count }, { data }] = await Promise.all([
            supabase.from("notificaciones").select("id", { count: "exact", head: true }).eq("destinatario_id", user.id).neq("estado", "leida"),
            supabase.from("notificaciones").select("id, mensaje, evento, revision_id, created_at, estado").eq("destinatario_id", user.id).order("created_at", { ascending: false }).limit(5),
        ]);
        noLeidas = count ?? 0;
        recientes = data ?? [];
    }

    async function signOut() {
        "use server";
        const supabase = await createClient();
        await supabase.auth.signOut();
        redirect("/login");
    }

    async function marcarTodas() {
        "use server";
        const supabase = await createClient();
        const { data: { user: usuario } } = await supabase.auth.getUser();
        if (usuario) {
            await supabase.from("notificaciones").update({ estado: "leida", leida_at: new Date().toISOString() }).eq("destinatario_id", usuario.id).neq("estado", "leida");
        }
    }

    return (
        <nav className="sticky top-0 z-40 border-b border-border bg-surface/80 px-6 py-5 backdrop-blur flex min-h-[84px] items-center justify-between lg:ml-[var(--sidebar-width)]">
            <div className="ml-auto flex items-center gap-4 sm:gap-6">
                <RelojZonaHoraria zona={profile?.zona_horaria ?? "America/Guayaquil"} />
                <SelectorIdioma />

                {user ? (
                    <div className="flex items-center gap-4">
                        <HeaderNotificaciones noLeidas={noLeidas} recientes={recientes} marcarTodas={marcarTodas} />
                        <HeaderPerfil
                            nombre={profile?.nombre ?? ""}
                            apellido={profile?.apellido ?? ""}
                            email={user.email ?? ""}
                            organizacionNombre={organizacionNombre}
                            nivel={nivel}
                            onSignOut={signOut}
                        />
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="bg-gradient-accent text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
                    >
                        Ingresar
                    </Link>
                )}
            </div>
        </nav>
    );
}
