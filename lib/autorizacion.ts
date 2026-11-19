import { redirect } from "next/navigation";
import { obtenerContextoUsuario } from "@/lib/data";

export async function exigirAdministradorOrganizacion() {
    const contexto = await obtenerContextoUsuario();
    const { user, nivelesActivos } = contexto;

    if (
        !user ||
        !nivelesActivos.some(
            (nivel) => nivel === "superadmin" || nivel === "admin_organizacion"
        )
    ) {
        redirect("/dashboard");
    }

    return { ...contexto, user };
}

export async function exigirAdministradorUsuarios() {
    const contexto = await obtenerContextoUsuario();
    const { user, nivelesActivos, equiposAdministrados } = contexto;
    const esAdministradorOrganizacion = nivelesActivos.some(
        (nivel) => nivel === "superadmin" || nivel === "admin_organizacion"
    );

    if (!user || (!esAdministradorOrganizacion && equiposAdministrados.length === 0)) {
        redirect("/dashboard");
    }

    return { ...contexto, user, esAdministradorOrganizacion };
}
