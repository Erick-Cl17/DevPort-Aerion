import { createClient } from "@/lib/supabase-server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

// Este endpoint es el que recibe al usuario cuando hace clic en el enlace
// del correo de confirmación. 
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;
    const next = searchParams.get("next") ?? "/dashboard";

    if (token_hash && type) {
        const supabase = await createClient();

        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        });

        if (!error) {
            redirect(next);
        }
    }

    // Si el enlace es inválido o ya expiró, se manda a login con un aviso
    redirect("/login?error=confirmacion_invalida");
}