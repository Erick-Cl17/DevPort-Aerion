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
        return { user: null, profile: null, organizacionNombre: null, nivel: null };
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("nombre, apellido, zona_horaria, organizacion_id, organizaciones ( nombre )")
        .eq("id", user.id)
        .single();

    const { data: asignaciones } = await supabase
        .from("asignaciones")
        .select("estado, roles ( nivel )")
        .eq("usuario_id", user.id);

    const asignacionActiva = (asignaciones as any)?.find(
        (a: any) => a.estado === "activo"
    );

    return {
        user,
        profile,
        organizacionNombre: (profile as any)?.organizaciones?.nombre ?? null,
        nivel: asignacionActiva?.roles?.nivel ?? null,
    };
});
