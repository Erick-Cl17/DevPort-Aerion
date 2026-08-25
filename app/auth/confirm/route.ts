import { createClient } from "@/lib/supabase-server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

// Genera un código corto (8 caracteres) para invitar gente a una organización.
function generarCodigoInvitacion() {
    return Math.random().toString(36).slice(2, 10).toUpperCase();
}

// Recibe al usuario cuando hace clic en el enlace del correo de confirmación,
// verifica el token y crea su perfil — fundando una organización nueva o
// uniéndolo a una existente por código, según lo elegido en /register.
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;
    const next = searchParams.get("next") ?? "/dashboard";

    if (token_hash && type) {
        const supabase = await createClient();

        const { error, data } = await supabase.auth.verifyOtp({ type, token_hash });

        if (!error && data.user) {
            const user = data.user;

            // Si el usuario abrió el enlace dos veces, el perfil ya existe:
            // evitamos el insert duplicado y lo dejamos pasar igual.
            const { data: existente } = await supabase
                .from("profiles")
                .select("id")
                .eq("id", user.id)
                .maybeSingle();

            if (existente) {
                redirect(next);
            }

            const meta = user.user_metadata ?? {};
            const nombre = meta.nombre ?? "";
            const apellido = meta.apellido ?? "";
            const modo = meta.modo === "unirse" ? "unirse" : "crear";

            let organizacionId: string | null = null;

            if (modo === "unirse") {
                const codigo = (meta.codigo_invitacion ?? "").trim().toUpperCase();

                const { data: org } = await supabase
                    .from("organizaciones")
                    .select("id")
                    .eq("codigo_invitacion", codigo)
                    .maybeSingle();

                if (!org) {
                    console.error("Código de invitación no encontrado:", codigo);
                    redirect(
                        `/login?error=${encodeURIComponent(
                            "Tu cuenta se confirmó, pero el código de invitación no es válido. Contacta a tu administrador."
                        )}`
                    );
                }

                organizacionId = org!.id;
            } else {
                const nombreOrg = (meta.nombre_organizacion ?? "").trim() || `Organización de ${nombre}`;

                const { data: nuevaOrg, error: orgError } = await supabase
                    .from("organizaciones")
                    .insert({ nombre: nombreOrg, codigo_invitacion: generarCodigoInvitacion() })
                    .select("id")
                    .single();

                if (orgError || !nuevaOrg) {
                    console.error("Error creando organización:", orgError);
                    redirect(
                        `/login?error=${encodeURIComponent(
                            "Tu cuenta se confirmó, pero no se pudo crear tu organización. Contacta al administrador."
                        )}`
                    );
                }

                organizacionId = nuevaOrg!.id;
            }

            const { error: profileError } = await supabase.from("profiles").insert({
                id: user.id,
                nombre,
                apellido,
                zona_horaria: "America/Guayaquil",
                organizacion_id: organizacionId,
            });

            if (profileError) {
                console.error("Error creando perfil tras confirmar cuenta:", profileError);
                redirect(
                    `/login?error=${encodeURIComponent(
                        "Tu cuenta se confirmó pero no se pudo crear tu perfil. Contacta al administrador."
                    )}`
                );
            }

            // Al fundar una organización, el usuario necesita quedar con
            // permisos de admin de inmediato — para eso hace falta un
            // equipo y un rol "admin_organizacion" propios de esa org,
            // más la asignación que los conecta. Quien se une con código
            // no pasa por esto: su admin lo asigna después desde
            // /dashboard/usuarios/asignar.
            if (modo === "crear") {
                const { data: equipo, error: equipoError } = await supabase
                    .from("equipos")
                    .insert({
                        organizacion_id: organizacionId,
                        nombre: "General",
                        codigo: "GEN",
                        zona_horaria: "America/Guayaquil",
                        responsable_id: user.id,
                    })
                    .select("id")
                    .single();

                const { data: rol, error: rolError } = await supabase
                    .from("roles")
                    .insert({
                        organizacion_id: organizacionId,
                        nombre: "Admin. organización",
                        nivel: "admin_organizacion",
                    })
                    .select("id")
                    .single();

                if (equipoError || rolError || !equipo || !rol) {
                    console.error("Error preparando equipo/rol inicial:", equipoError, rolError);
                    // El perfil y la organización ya quedaron creados; el
                    // usuario puede iniciar sesión igual, solo le faltará
                    // que un superadmin le asigne equipo y rol a mano.
                } else {
                    const { error: asignacionError } = await supabase.from("asignaciones").insert({
                        usuario_id: user.id,
                        organizacion_id: organizacionId,
                        equipo_id: equipo.id,
                        rol_id: rol.id,
                    });

                    if (asignacionError) {
                        console.error("Error asignando rol de fundador:", asignacionError);
                    }
                }
            }

            redirect(next);
        }
    }

    // Si el enlace es inválido o ya expiró, se manda a login con un aviso
    redirect("/login?error=confirmacion_invalida");
}
