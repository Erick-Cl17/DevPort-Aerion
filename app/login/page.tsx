"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const errorConfirmacion = searchParams.get("error") === "confirmacion_invalida";
    const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setCargando(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        setCargando(false);

        if (error) {
            // Supabase devuelve "Email not confirmed" cuando la cuenta
            // todavía no confirmó su correo — se traduce para el usuario.
            setError(
                error.message.includes("Email not confirmed")
                    ? "Debes confirmar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada."
                    : error.message
            );
            return;
        }

        router.push(redirectTo);
        // Necesario para que el Navbar (Server Component en el layout) se
        // actualice de inmediato — mismo problema y solución de DevPort
        router.refresh();
    }

    return (
        <section className="relative min-h-[70vh] flex items-center justify-center px-4 grid-field">
            <div
                aria-hidden
                className="absolute top-1/4 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-cyan/20 blur-3xl animate-glow-pulse pointer-events-none"
            />
            <div className="relative w-full max-w-md panel p-8">
                <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                    Iniciar sesión
                </h1>
                <p className="text-muted-foreground mb-8">Accede a tu cuenta de AERION</p>

                {errorConfirmacion && (
                    <p className="bg-warning/10 border border-warning/40 text-warning text-sm rounded-lg px-4 py-3 mb-4">
                        El enlace de confirmación no es válido o ya expiró. Intenta registrarte de nuevo o pide un nuevo enlace.
                    </p>
                )}

                {error && (
                    <p className="bg-critical/10 border border-critical/40 text-critical text-sm rounded-lg px-4 py-3 mb-4">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border focus:outline-none focus:border-primary"
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border focus:outline-none focus:border-primary"
                    />
                    <button
                        type="submit"
                        disabled={cargando}
                        className="bg-gradient-accent text-primary-foreground font-semibold py-3 rounded-lg transition-all disabled:opacity-40 hover:opacity-90 hover:shadow-lift"
                    >
                        {cargando ? "Ingresando..." : "Iniciar sesión"}
                    </button>
                   
                </form>

                <p className="text-muted-foreground text-center mt-6 text-sm">
                    ¿No tienes cuenta?{" "}
                    <Link href="/register" className="text-primary hover:opacity-80 font-semibold">
                        Regístrate
                    </Link>
                </p>
            </div>
        </section>
    );
}
