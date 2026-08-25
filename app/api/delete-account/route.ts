import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        
        // Obtener el usuario actual
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        // 1. Eliminar datos asociados al usuario en cascada
        // Primero eliminar asignaciones
        await supabase
            .from("asignaciones")
            .delete()
            .eq("usuario_id", user.id);

        // Eliminar perfil
        await supabase
            .from("profiles")
            .delete()
            .eq("id", user.id);

        // 2. Eliminar la cuenta de autenticación
        const { error: deleteError } = await supabase.auth.admin.deleteUser(
            user.id
        );

        if (deleteError) {
            return NextResponse.json(
                { error: "No se pudo eliminar la cuenta: " + deleteError.message },
                { status: 400 }
            );
        }

        // 3. Cerrar sesión y redirigir
        await supabase.auth.signOut();

        return NextResponse.json({
            success: true,
            message: "Cuenta eliminada correctamente",
        });
    } catch (error: any) {
        console.error("Error al eliminar la cuenta:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
