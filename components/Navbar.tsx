import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

// Aquí se agrega además el nombre de la organización y el nivel de rol más alto del 
// usuario, porque en AERION el menú debe reflejar el alcance (organización/equipo)
export default async function Navbar() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let nombreCompleto: string | null = null;
    let nivel: string | null = null;
    let organizacionNombre: string | null = null;

    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("nombre, apellido, organizacion_id, organizaciones(nombre)")
            .eq("id", user.id)
            .single();

        if (profile) {
            nombreCompleto = `${profile.nombre} ${profile.apellido}`.trim();
            organizacionNombre = (profile as any).organizaciones?.nombre ?? null;
        }

        const { data: asignacion } = await supabase
            .from("asignaciones")
            .select("roles(nivel)")
            .eq("usuario_id", user.id)
            .eq("estado", "activo")
            .limit(1)
            .maybeSingle();

        nivel = (asignacion as any)?.roles?.nivel ?? null;
    }

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
