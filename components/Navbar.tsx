import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { obtenerContextoUsuario } from "@/lib/data";
import { redirect } from "next/navigation";

// Aquí se agrega además el nombre de la organización y el nivel de rol más alto del 
// usuario, porque en AERION el menú debe reflejar el alcance (organización/equipo)

// El contexto (usuario + perfil + rol) se obtiene UNA sola vez por petición gracias a 
// obtenerContextoUsuario() (lib/data.ts), que usa cache() de React — así el Navbar y 
// la página que se esté mostrando no duplican las mismas consultas a Supabase.
export default async function Navbar() {
    const { user, profile, organizacionNombre, nivel } = await obtenerContextoUsuario();

    const nombreCompleto = profile
        ? `${profile.nombre} ${profile.apellido}`.trim()
        : null;

    async function signOut() {
        "use server";
        const supabase = await createClient();
        await supabase.auth.signOut();
        redirect("/login");
    }

    return (
        <nav className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur px-6 py-4 flex justify-between items-center">
            <Link
                href="/"
                className="font-display text-xl font-bold text-foreground hover:text-primary transition-colors"
            >
                AERION
            </Link>

            <div className="flex items-center gap-6">
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Inicio
                </Link>
                {user && (
                    <Link
                        href="/dashboard"
                        className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                        Dashboard
                    </Link>
                )}

                {user ? (
                    <div className="flex items-center gap-4">
                        <div className="text-right leading-tight hidden sm:block">
                            <p className="text-sm text-foreground">{nombreCompleto ?? user.email}</p>
                            <p className="text-xs text-muted-foreground">
                                {organizacionNombre ?? "Sin organización"}
                                {nivel ? ` · ${nivel}` : ""}
                            </p>
                        </div>
                        <form action={signOut}>
                            <button
                                type="submit"
                                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                            >
                                Cerrar sesión
                            </button>
                        </form>
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
