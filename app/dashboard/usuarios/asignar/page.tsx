import { createClient } from "@/lib/supabase-server";
import { exigirAdministradorUsuarios } from "@/lib/autorizacion";
import { registrarAuditoria } from "@/lib/auditoria";
import { redirect } from "next/navigation";

export default async function AsignarUsuarioPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error: errorParam } = await searchParams;
    const {
        profile,
        nivelesActivos,
        equiposAdministrados,
        esAdministradorOrganizacion,
    } = await exigirAdministradorUsuarios();
    const supabase = await createClient();

    let consultaEquipos = supabase
        .from("equipos")
        .select("id, nombre")
        .eq("organizacion_id", profile?.organizacion_id ?? "");
    if (!esAdministradorOrganizacion) {
        consultaEquipos = consultaEquipos.in("id", equiposAdministrados);
    }

    const [{ data: usuarios }, { data: equipos }, { data: cargos }, { data: roles }] =
        await Promise.all([
            supabase
                .from("profiles")
                .select("id, nombre, apellido")
                .eq("organizacion_id", profile?.organizacion_id ?? ""),
            consultaEquipos,
            supabase
                .from("cargos")
                .select("id, nombre")
                .eq("organizacion_id", profile?.organizacion_id ?? ""),
            supabase
                .from("roles")
                .select("id, nombre, nivel")
                .eq("organizacion_id", profile?.organizacion_id ?? ""),
        ]);

    async function crearAsignacion(formData: FormData) {
        "use server";
        const supabase = await createClient();
        const {
            profile,
            user,
            nivelesActivos,
            equiposAdministrados,
            esAdministradorOrganizacion,
        } = await exigirAdministradorUsuarios();

        const usuarioId = ((formData.get("usuario_id") as string) ?? "").trim();
        const equipoId = ((formData.get("equipo_id") as string) ?? "").trim();
        const rolId = ((formData.get("rol_id") as string) ?? "").trim();
        const cargoId = ((formData.get("cargo_id") as string) ?? "").trim();

        if (!usuarioId || !equipoId || !rolId || !profile?.organizacion_id) {
            redirect(
                "/dashboard/usuarios/asignar?error=" +
                    encodeURIComponent("Usuario, equipo y rol son obligatorios")
            );
        }

        const [{ data: equipoSeleccionado, error: errorEquipo }, { data: rolSeleccionado, error: errorRol }, { data: usuarioSeleccionado, error: errorUsuario }] =
            await Promise.all([
                supabase
                    .from("equipos")
                    .select("id")
                    .eq("id", equipoId)
                    .eq("organizacion_id", profile.organizacion_id)
                    .single(),
                supabase
                    .from("roles")
                    .select("nivel")
                    .eq("id", rolId)
                    .eq("organizacion_id", profile.organizacion_id)
                    .single(),
                supabase
                    .from("profiles")
                    .select("id")
                    .eq("id", usuarioId)
                    .eq("organizacion_id", profile.organizacion_id)
                    .single(),
            ]);

        if (
            errorEquipo ||
            !equipoSeleccionado ||
            (!esAdministradorOrganizacion && !equiposAdministrados.includes(equipoSeleccionado.id))
        ) {
            redirect(
                "/dashboard/usuarios/asignar?error=" +
                    encodeURIComponent("No tienes permiso para administrar ese equipo")
            );
        }

        if (
            errorRol ||
            !rolSeleccionado ||
            (rolSeleccionado.nivel === "superadmin" && !nivelesActivos.includes("superadmin")) ||
            (!esAdministradorOrganizacion &&
                (rolSeleccionado.nivel === "superadmin" ||
                    rolSeleccionado.nivel === "admin_organizacion"))
        ) {
            redirect(
                "/dashboard/usuarios/asignar?error=" +
                    encodeURIComponent("No tienes permiso para asignar ese rol")
            );
        }

        if (errorUsuario || !usuarioSeleccionado) {
            redirect(
                "/dashboard/usuarios/asignar?error=" +
                    encodeURIComponent("El usuario no pertenece a tu organización")
            );
        }

        const { error } = await supabase.from("asignaciones").insert({
            usuario_id: usuarioId,
            organizacion_id: profile!.organizacion_id,
            equipo_id: equipoId,
            rol_id: rolId,
            cargo_id: cargoId || null,
        });

        if (error) {
            redirect(`/dashboard/usuarios/asignar?error=${encodeURIComponent(error.message)}`);
        }

        await registrarAuditoria({
            actorId: user!.id,
            accion: "crear_asignacion",
            recurso: "asignaciones",
            contexto: { usuarioId, equipoId, rolId },
        });

        redirect("/dashboard/usuarios");
    }

    return (
        <section className="max-w-xl mx-auto px-6 py-10">
            <h1 className="font-display text-2xl font-bold text-foreground mb-6">
                Asignar usuario a equipo
            </h1>

            {errorParam && (
                <p className="bg-critical/10 border border-critical/40 text-critical text-sm rounded-lg px-4 py-3 mb-4">
                    {errorParam}
                </p>
            )}

            <form action={crearAsignacion} className="panel p-6 flex flex-col gap-4">
                <select
                    name="usuario_id"
                    required
                    className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border"
                >
                    <option value="">Usuario…</option>
                    {(usuarios ?? []).map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.nombre} {u.apellido}
                        </option>
                    ))}
                </select>

                <select
                    name="equipo_id"
                    required
                    className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border"
                >
                    <option value="">Equipo…</option>
                    {(equipos ?? []).map((e) => (
                        <option key={e.id} value={e.id}>
                            {e.nombre}
                        </option>
                    ))}
                </select>

                <select
                    name="rol_id"
                    required
                    className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border"
                >
                    <option value="">Rol…</option>
                    {(roles ?? [])
                        .filter(
                            (r) =>
                                (r.nivel !== "superadmin" || nivelesActivos.includes("superadmin")) &&
                                (esAdministradorOrganizacion ||
                                    (r.nivel !== "superadmin" && r.nivel !== "admin_organizacion"))
                        )
                        .map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.nombre} ({r.nivel})
                            </option>
                        ))}
                </select>

                <select
                    name="cargo_id"
                    className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border"
                >
                    <option value="">Cargo (opcional)…</option>
                    {(cargos ?? []).map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.nombre}
                        </option>
                    ))}
                </select>

                <button
                    type="submit"
                    className="bg-gradient-accent text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                    Asignar
                </button>
            </form>
        </section>
    );
}
