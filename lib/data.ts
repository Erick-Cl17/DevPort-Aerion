import { cache } from "react";
import { createClient } from "@/lib/supabase-server";

// cache() de React memoriza el resultado durante UNA sola petición/renderizado,
// así el Navbar y la página que se esté mostrando no vuelven a pedir lo mismo
// (perfil, organización, rol activo) más de una vez por clic.
export const obtenerContextoUsuario = cache(async () => {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            user: null,
            profile: null,
            organizacionNombre: null,
            nivel: null,
            nivelesActivos: [],
            equiposAdministrados: [],
        };
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("nombre, apellido, zona_horaria, organizacion_id, organizaciones ( nombre )")
        .eq("id", user.id)
        .single();

    const { data: asignaciones } = profile?.organizacion_id
        ? await supabase
              .from("asignaciones")
              .select("estado, equipo_id, roles ( nivel )")
              .eq("usuario_id", user.id)
              .eq("organizacion_id", profile.organizacion_id)
        : { data: [] };

    const asignacionesActivas = (
        (asignaciones ?? []) as {
            estado: string;
            equipo_id?: string | null;
            roles: { nivel?: string | null } | { nivel?: string | null }[] | null;
        }[]
    ).filter((asignacion) => asignacion.estado === "activo");
    const nivelesActivos = asignacionesActivas
        .map((asignacion) => {
            const rol = Array.isArray(asignacion.roles)
                ? asignacion.roles[0]
                : asignacion.roles;
            return rol?.nivel;
        })
        .filter((nivel): nivel is string => typeof nivel === "string");
    const equiposAdministrados = asignacionesActivas
        .filter((asignacion) => {
            const rol = Array.isArray(asignacion.roles)
                ? asignacion.roles[0]
                : asignacion.roles;
            return rol?.nivel === "admin_equipo";
        })
        .map((asignacion) => asignacion.equipo_id)
        .filter((equipoId): equipoId is string => typeof equipoId === "string");

    return {
        user,
        profile,
        organizacionNombre:
            (profile as { organizaciones?: { nombre?: string | null } | null } | null)
                ?.organizaciones?.nombre ?? null,
        nivel: nivelesActivos[0] ?? null,
        nivelesActivos,
        equiposAdministrados,
    };
});
