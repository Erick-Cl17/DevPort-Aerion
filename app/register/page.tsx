"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { passwordCumpleTodo } from "@/lib/password-rules";
import PasswordChecklist from "@/components/PasswordChecklist";
import PanelBienvenidaAuth from "@/components/PanelBienvenidaAuth";

export default function RegisterPage() {
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [enviado, setEnviado] = useState(false);
    const [cargando, setCargando] = useState(false);

    // "crear": el usuario funda su propia organización y queda como su admin.
    // "unirse": el usuario entra a una organización ya existente con el
    // código de invitación que le dio su admin.
    const [modo, setModo] = useState<"crear" | "unirse">("crear");
    const [nombreOrganizacion, setNombreOrganizacion] = useState("");
    const [codigoInvitacion, setCodigoInvitacion] = useState("");

    const contraseñaValida = passwordCumpleTodo(password);
    const coinciden = password.length > 0 && password === confirmPassword;
    // trim() en los tres campos de texto: " " (solo espacios) no debe
    // contar como un valor válido, aunque no esté técnicamente "vacío".
    const formularioValido =
        nombre.trim().length > 0 &&
        apellido.trim().length > 0 &&
        email.trim().length > 0 &&
        contraseñaValida &&
        coinciden &&
        (modo === "crear" ? nombreOrganizacion.trim().length > 0 : codigoInvitacion.trim().length > 0);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!formularioValido) return;

        setCargando(true);
        const supabase = createClient();

        // Todo esto viaja en options.data (user_metadata) porque, hasta que
        // el usuario confirme el correo, no hay sesión activa — el Route
        // Handler de /auth/confirm es quien realmente crea la organización
        // (o la busca por código) y el perfil, usando estos mismos datos.
        const { error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
                data: {
                    nombre: nombre.trim(),
                    apellido: apellido.trim(),
                    modo,
                    nombre_organizacion: modo === "crear" ? nombreOrganizacion.trim() : undefined,
                    codigo_invitacion: modo === "unirse" ? codigoInvitacion.trim().toUpperCase() : undefined,
                },
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
            <div className="w-full max-w-5xl panel edge-scan p-2 sm:p-3">
                <div className="grid overflow-hidden rounded-2xl md:grid-cols-2">
                <PanelBienvenidaAuth registro />
                <div className="p-6 sm:p-8">
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

                    {/* Toggle: fundar organización nueva vs. unirse a una existente */}
                    <div className="grid grid-cols-2 gap-2 bg-secondary rounded-lg p-1 border border-border">
                        <button
                            type="button"
                            onClick={() => setModo("crear")}
                            className={`py-2 rounded-md text-sm font-semibold transition-colors ${
                                modo === "crear"
                                    ? "bg-gradient-accent text-primary-foreground"
                                    : "text-muted-foreground"
                            }`}
                        >
                            Crear organización
                        </button>
                        <button
                            type="button"
                            onClick={() => setModo("unirse")}
                            className={`py-2 rounded-md text-sm font-semibold transition-colors ${
                                modo === "unirse"
                                    ? "bg-gradient-accent text-primary-foreground"
                                    : "text-muted-foreground"
                            }`}
                        >
                            Unirme con código
                        </button>
                    </div>

                    {modo === "crear" ? (
                        <input
                            type="text"
                            placeholder="Nombre de tu organización"
                            value={nombreOrganizacion}
                            onChange={(e) => setNombreOrganizacion(e.target.value)}
                            className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border focus:outline-none focus:border-primary"
                        />
                    ) : (
                        <input
                            type="text"
                            placeholder="Código de invitación (ej: A1B2C3D4)"
                            value={codigoInvitacion}
                            onChange={(e) => setCodigoInvitacion(e.target.value.toUpperCase())}
                            className="bg-secondary text-foreground rounded-lg px-4 py-3 border border-border focus:outline-none focus:border-primary uppercase"
                        />
                    )}

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
                </div>
            </div>
        </section>
    );
}
