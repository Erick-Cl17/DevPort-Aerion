import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { obtenerContextoUsuario } from "@/lib/data";
import ZonaPeligroPerfil from "@/components/ZonaPeligroPerfil";

export default async function PerfilPage() {
    const { profile, nivel } = await obtenerContextoUsuario();

    // El código de invitación solo lo puede ver y compartir un admin de
    // organización (o superadmin) — quien se une con código no lo necesita.
    const esAdmin = nivel === "admin_organizacion" || nivel === "superadmin";
    let codigoInvitacion: string | null = null;

    if (esAdmin && profile?.organizacion_id) {
        const supabase = await createClient();
        const { data: org } = await supabase
            .from("organizaciones")
            .select("codigo_invitacion")
            .eq("id", profile.organizacion_id)
            .single();
        codigoInvitacion = org?.codigo_invitacion ?? null;
    }

    return (
        <section className="max-w-2xl mx-auto px-6 py-10">
            <div className="mb-8">
                <Link href="/dashboard" className="text-primary hover:opacity-80 text-sm mb-4 inline-block">
                    ← Volver al dashboard
                </Link>
                <h1 className="font-display text-2xl font-bold text-foreground">
                    Configuración de Perfil
                </h1>
                <p className="text-muted-foreground text-sm">
                    Gestiona tu cuenta y configuración
                </p>
            </div>

            <div className="space-y-6">
                {codigoInvitacion && (
                    <div className="panel p-6">
                        <h2 className="font-display text-lg font-bold text-foreground mb-2">
                            Código de invitación
                        </h2>
                        <p className="text-muted-foreground text-sm mb-4">
                            Comparte este código con las personas que quieras invitar a tu organización.
                            Lo usarán en "Unirme con código" al registrarse.
                        </p>
                        <p className="font-mono text-xl tracking-widest text-primary bg-secondary border border-border rounded-lg px-4 py-3 text-center">
                            {codigoInvitacion}
                        </p>
                    </div>
                )}

                <ZonaPeligroPerfil />
            </div>
        </section>
    );
}
