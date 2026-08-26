import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-server";
import { obtenerContextoUsuario } from "@/lib/data";
import { IMAGENES } from "@/lib/image-paths";
import { redirect } from "next/navigation";
import HeaderNotificaciones from "@/components/HeaderNotificaciones";
import HeaderPerfil from "@/components/HeaderPerfil";

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
            supabase
                .from("notificaciones")
                .select("id", { count: "exact", head: true })
                .eq("destinatario_id", user.id)
                .neq("estado", "leida"),
            supabase
                .from("notificaciones")
                .select("id, mensaje, evento, revision_id, created_at, estado")
                .eq("destinatario_id", user.id)
                .order("created_at", { ascending: false })
                .limit(5),
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
        if (usuario) await supabase.from("notificaciones").update({ estado: "leida", leida_at: new Date().toISOString() }).eq("destinatario_id", usuario.id).neq("estado", "leida");
    }

    return (
        <nav className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur px-6 py-4 flex justify-between items-center">
            <Link
                href="/"
                className="flex items-center text-foreground hover:text-primary transition-colors"
            >
                <Image
                    src={IMAGENES.logo}
                    alt="AERION"
                    width={120}
                    height={36}
                    className="h-9 w-auto object-contain"
                />
            </Link>

            <div className="flex items-center gap-4 sm:gap-6">
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Inicio
                </Link>
                <Link href="/simuladores" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Simuladores
                </Link>

                {/* En md+ se ven todos los enlaces en línea; por debajo de
                    md quedan ocultos y aparecen dentro de MobileNavMenu, en
                    vez de simplemente desaparecer sin alternativa. */}
                <div className="hidden md:flex items-center gap-6">
                    {user && (
                        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                            Dashboard
                        </Link>
                    )}
                    {user && (
                        <Link href="/dashboard/equipos" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                            Equipos
                        </Link>
                    )}
                    {user && (
                        <Link href="/dashboard/usuarios" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                            Usuarios
                        </Link>
                    )}
                    {user && (
                        <Link href="/dashboard/proyecto" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                            Proyecto
                        </Link>
                    )}
                    {user && (
                        <Link href="/dashboard/security-center" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                            Security Center
                        </Link>
                    )}
                    {user && (
                        <Link href="/dashboard/administracion" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                            Administración
                        </Link>
                    )}
                </div>

                {user ? (
                    <div className="flex items-center gap-2">
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
