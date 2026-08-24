import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// - matcher amplio para poder refrescar la sesión en cualquier página
// - setAll completo, para que el token refrescado sí llegue al navegador
export async function proxy(request: NextRequest) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Proteger /dashboard: sin sesión, redirige a /login
    if (!user && pathname.startsWith("/dashboard")) {
        const url = new URL("/login", request.url);
        url.searchParams.set("redirectTo", pathname);
        return NextResponse.redirect(url);
    }

    // Si ya hay sesión, no tiene sentido volver a mostrar login/registro
    if (user && (pathname === "/login" || pathname === "/register")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
}

export const config = {
    // Corre en todas las rutas menos assets estáticos y la ruta de
    // confirmación de correo (esa la maneja su propio Route Handler,
    // que necesita poder ESCRIBIR cookies de sesión sin que el proxy
    // intercepte antes la petición).
    matcher: ["/((?!_next/static|_next/image|favicon.ico|auth/confirm).*)"],
};
