"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { passwordCumpleTodo } from "@/lib/password-rules";
import PasswordChecklist from "@/components/PasswordChecklist";

export default function RegisterPage() {
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [enviado, setEnviado] = useState(false);
    const [cargando, setCargando] = useState(false);

    const contraseñaValida = passwordCumpleTodo(password);
    const coinciden = password.length > 0 && password === confirmPassword;
    // trim() en los tres campos de texto: " " (solo espacios) no debe
    // contar como un valor válido, aunque no esté técnicamente "vacío".
    const formularioValido =
        nombre.trim().length > 0 &&
        apellido.trim().length > 0 &&
        email.trim().length > 0 &&
        contraseñaValida &&
        coinciden;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!formularioValido) return;

        setCargando(true);
        const supabase = createClient();

        // El nombre/apellido viajan en options.data para que el trigger
        // handle_new_user() (ver AERION_Script_SQL.sql) los copie a profiles.
        // emailRedirectTo apunta al Route Handler que confirma la cuenta.
        const { error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
                data: { nombre: nombre.trim(), apellido: apellido.trim() },
                emailRedirectTo: `${window.location.origin}/auth/confirm`,
            },
        });

        setCargando(false);

        if (error) {
            setError(error.message);
            return;
        }

        setEnviado(true);
    }

    if (enviado) {
        return (
            <section className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="w-full max-w-md panel p-8 text-center">
                    <h1 className="font-display text-2xl font-bold text-foreground mb-3">
                        Revisa tu correo
                    </h1>
                    <p className="text-muted-foreground">
                        Enviamos un enlace de confirmación a <strong className="text-foreground">{email}</strong>.
                        Debes confirmarlo antes de poder iniciar sesión.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-[70vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md panel p-8">
                <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                    Crear cuenta
                </h1>
                <p className="text-muted-foreground mb-8">Regístrate en AERION</p>

                {error && (
                    <p className="bg-critical/10 border border-critical/40 text-critical text-sm rounded-lg px-4 py-3 mb-4">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="Nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border focus:outline-none focus:border-primary"
                        />
                        <input
                            type="text"
                            placeholder="Apellido"
                            value={apellido}
                            onChange={(e) => setApellido(e.target.value)}
                            className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border focus:outline-none focus:border-primary"
                        />
                    </div>

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
                    <PasswordChecklist password={password} />

                    <input
                        type="password"
                        placeholder="Confirmar contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border focus:outline-none focus:border-primary"
                    />
                    {confirmPassword.length > 0 && (
                        <p className={`text-xs -mt-2 ${coinciden ? "text-success" : "text-critical"}`}>
                            {coinciden ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={!formularioValido || cargando}
                        className="bg-gradient-accent text-primary-foreground font-semibold py-3 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 hover:shadow-lift"
                    >
                        {cargando ? "Creando cuenta..." : "Crear cuenta"}
                    </button>
                </form>

                <p className="text-muted-foreground text-center mt-6 text-sm">
                    ¿Ya tienes cuenta?{" "}
                    <Link href="/login" className="text-primary hover:opacity-80 font-semibold">
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </section>
    );
}
