import { createBrowserClient } from "@supabase/ssr";

// Se centraliza aquí en vez de instanciarlo suelto en cada página para no duplicar 
// la creación del cliente en login, registro y cualquier otro componente de cliente.
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
}
