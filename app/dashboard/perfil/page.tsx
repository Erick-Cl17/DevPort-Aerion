import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { obtenerContextoUsuario } from "@/lib/data";
import ZonaPeligroPerfil from "@/components/ZonaPeligroPerfil";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const ZONAS_HORARIAS = [
    { value: "America/Guayaquil", label: "Ecuador (Guayaquil)" },
    { value: "America/Lima", label: "Perú (Lima)" },
    { value: "America/Bogota", label: "Colombia (Bogotá)" },
    { value: "America/Mexico_City", label: "México (Ciudad de México)" },
    { value: "America/New_York", label: "Estados Unidos (Nueva York)" },
    { value: "America/Los_Angeles", label: "Estados Unidos (Los Ángeles)" },
    { value: "America/Sao_Paulo", label: "Brasil (São Paulo)" },
    { value: "America/Argentina/Buenos_Aires", label: "Argentina (Buenos Aires)" },
    { value: "Europe/Madrid", label: "España (Madrid)" },
    { value: "Europe/London", label: "Reino Unido (Londres)" },
    { value: "Europe/Paris", label: "Francia (París)" },
    { value: "Africa/Cairo", label: "Egipto (El Cairo)" },
    { value: "Asia/Dubai", label: "Emiratos Árabes Unidos (Dubái)" },
    { value: "Asia/Kolkata", label: "India (Calcuta)" },
    { value: "Asia/Shanghai", label: "China (Shanghái)" },
    { value: "Asia/Tokyo", label: "Japón (Tokio)" },
    { value: "Asia/Seoul", label: "Corea del Sur (Seúl)" },
    { value: "Australia/Sydney", label: "Australia (Sídney)" },
    { value: "Pacific/Auckland", label: "Nueva Zelanda (Auckland)" },
    { value: "UTC", label: "UTC" },
];

export default async function PerfilPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
    const { error, ok } = await searchParams;
    const { profile, nivel, user } = await obtenerContextoUsuario();
    const supabase = await createClient();
    const { data: datosPerfil } = user
        ? await supabase.from("profiles").select("nombre, apellido, email, estado, zona_horaria, ultimo_acceso").eq("id", user.id).single()
        : { data: null };

    async function actualizarPerfil(formData: FormData) {
        "use server";
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) redirect("/login");

        const nombre = String(formData.get("nombre") ?? "").trim();
        const apellido = String(formData.get("apellido") ?? "").trim();
        const email = String(formData.get("email") ?? "").trim().toLowerCase();
        const zonaHoraria = String(formData.get("zona_horaria") ?? "").trim();
        if (!nombre || !apellido || !email || !zonaHoraria) redirect("/dashboard/perfil?error=Completa todos los campos obligatorios");

        const { error } = await supabase.from("profiles").update({ nombre, apellido, email, zona_horaria: zonaHoraria }).eq("id", user.id);
        if (error) redirect(`/dashboard/perfil?error=${encodeURIComponent(error.message)}`);
        if (email !== user.email) await supabase.auth.updateUser({ email });
        revalidatePath("/dashboard/perfil");
        revalidatePath("/dashboard");
        redirect("/dashboard/perfil?ok=1");
    }

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

            {error && <p className="mb-4 rounded-lg border border-critical/40 bg-critical/10 px-4 py-3 text-sm text-critical">{error}</p>}
            {ok && <p className="mb-4 rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">Perfil actualizado correctamente.</p>}

            <div className="panel mb-6 p-6">
                <h2 className="mb-4 font-display text-lg font-bold text-foreground">Datos personales</h2>
                <form action={actualizarPerfil} className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm text-muted-foreground">Nombre<input name="nombre" required defaultValue={datosPerfil?.nombre ?? profile?.nombre ?? ""} className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground" /></label>
                    <label className="text-sm text-muted-foreground">Apellido<input name="apellido" required defaultValue={datosPerfil?.apellido ?? profile?.apellido ?? ""} className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground" /></label>
                    <label className="text-sm text-muted-foreground sm:col-span-2">Correo electrónico<input type="email" name="email" required defaultValue={datosPerfil?.email ?? user?.email ?? ""} className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground" /></label>
                    <label className="text-sm text-muted-foreground sm:col-span-2">Zona horaria<select name="zona_horaria" required defaultValue={datosPerfil?.zona_horaria ?? "America/Guayaquil"} className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground">{ZONAS_HORARIAS.map((zona) => <option key={zona.value} value={zona.value}>{zona.label}</option>)}</select></label>
                    <div className="flex items-center justify-between gap-4 border-t border-border pt-4 sm:col-span-2"><p className="text-xs text-muted-foreground">Estado: {datosPerfil?.estado ?? "activo"}</p><button type="submit" className="rounded-lg bg-gradient-accent px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Guardar cambios</button></div>
                </form>
            </div>

            <div className="space-y-6">
                {codigoInvitacion && (
                    <div className="panel p-6">
                        <h2 className="font-display text-lg font-bold text-foreground mb-2">
                            Código de invitación
                        </h2>
                        <p className="text-muted-foreground text-sm mb-4">
                            Comparte este código con las personas que quieras invitar a tu organización.
                            Lo usarán en &quot;Unirme con código&quot; al registrarse.
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
