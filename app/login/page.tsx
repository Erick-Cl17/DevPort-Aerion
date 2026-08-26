"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PanelBienvenidaAuth from "@/components/PanelBienvenidaAuth";

type Idioma = "ES" | "EN" | "ZH";

const COPY: Record<Idioma, { titulo: string; subtitulo: string; email: string; password: string; entrar: string; recordatorio: string; crear: string; errorConfirmacion: string; errorCredenciales: string; eliminada: string; persistiendo: string; }> = {
    ES: {
        titulo: "Iniciar sesión",
        subtitulo: "Accede a tu cuenta de AERION",
        email: "Correo electrónico",
        password: "Contraseña",
        entrar: "Acceder",
        recordatorio: "¿No tienes cuenta?",
        crear: "Regístrate",
        errorConfirmacion: "El enlace de confirmación no es válido o ya expiró. Intenta registrarte de nuevo o pide un nuevo enlace.",
        errorCredenciales: "El correo o contraseña son incorrectos. Verifica que el usuario exista en la plataforma.",
        eliminada: "Tu cuenta ha sido eliminada correctamente. Si cambias de opinión, puedes crear una nueva cuenta.",
        persistiendo: "Ingresando...",
    },
    EN: {
        titulo: "Sign in",
        subtitulo: "Access your AERION account",
        email: "Email",
        password: "Password",
        entrar: "Sign in",
        recordatorio: "No account yet?",
        crear: "Create account",
        errorConfirmacion: "The confirmation link is invalid or has expired. Please sign up again or request a new link.",
        errorCredenciales: "The email or password is incorrect. Please verify the user exists in the platform.",
        eliminada: "Your account has been deleted successfully. If you change your mind, you can create a new one.",
        persistiendo: "Signing in...",
    },
    ZH: {
        titulo: "登录",
        subtitulo: "访问你的 AERION 账户",
        email: "电子邮件",
        password: "密码",
        entrar: "登录",
        recordatorio: "还没有账号？",
        crear: "注册",
        errorConfirmacion: "确认链接无效或已过期。请重新注册或申请新链接。",
        errorCredenciales: "电子邮件或密码不正确。请确认该用户已在平台中存在。",
        eliminada: "你的账户已成功删除。如果你改变主意，可以创建新账户。",
        persistiendo: "登录中...",
    },
};

function leerIdiomaInicial(): Idioma {
    if (typeof window === "undefined") return "ES";
    const valor = window.localStorage.getItem("aerion-idioma");
    return valor === "EN" || valor === "ZH" ? valor : "ES";
}

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);
    const [idioma, setIdioma] = useState<Idioma>(leerIdiomaInicial);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const actualizar = (evento: Event) => {
            const siguiente = (evento as CustomEvent<string>).detail as Idioma;
            if (siguiente === "ES" || siguiente === "EN" || siguiente === "ZH") setIdioma(siguiente);
        };
        const onStorage = () => setIdioma(leerIdiomaInicial());
        window.addEventListener("aerion:idioma", actualizar);
        window.addEventListener("storage", onStorage);
        return () => {
            window.removeEventListener("aerion:idioma", actualizar);
            window.removeEventListener("storage", onStorage);
        };
    }, []);

    const t = COPY[idioma];
    const errorParam = searchParams.get("error");
    const errorConfirmacion = errorParam === "confirmacion_invalida";
    const cuentaEliminada = searchParams.get("deleted") === "true";
    const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setCargando(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        setCargando(false);

        if (error) {
            if (error.message.includes("Email not confirmed")) {
                setError(t.errorConfirmacion);
            } else if (error.message.includes("Invalid login credentials") || error.message.includes("invalid")) {
                setError(t.errorCredenciales);
            } else {
                setError(error.message);
            }
            return;
        }

        router.push(redirectTo);
        router.refresh();
    }

    return (
        <section className="relative min-h-[70vh] flex items-center justify-center px-4 py-10 grid-field">
            <div aria-hidden className="absolute left-1/2 top-1/4 h-56 w-56 -translate-x-1/2 rounded-full bg-cyan/20 blur-3xl animate-glow-pulse pointer-events-none" />

            <div className="relative w-full max-w-5xl panel edge-scan p-2 sm:p-3">
                <div className="grid overflow-hidden rounded-2xl md:grid-cols-[1.08fr_1.2fr]">
                    <PanelBienvenidaAuth />
                    <div className="bg-[#12263a] p-6 sm:p-8">
                        <div className="mb-8">
                            <p className="label-mono text-cyan/80">ENTER YOUR CREDENTIALS</p>
                            <h1 className="mt-3 font-display text-4xl font-bold text-foreground">{t.titulo}</h1>
                        </div>

                        {errorConfirmacion && (
                            <p className="mb-4 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">{t.errorConfirmacion}</p>
                        )}

                        {errorParam && !errorConfirmacion && (
                            <p className="mb-4 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">{errorParam}</p>
                        )}

                        {cuentaEliminada && (
                            <p className="mb-4 rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">{t.eliminada}</p>
                        )}

                        {error && (
                            <p className="mb-4 rounded-lg border border-critical/40 bg-critical/10 px-4 py-3 text-sm text-critical">{error}</p>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <label className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                {t.email}
                                <input
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-2 w-full rounded-xl border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-cyan/60 focus:outline-none"
                                />
                            </label>

                            <label className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                {t.password}
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-2 w-full rounded-xl border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-cyan/60 focus:outline-none"
                                />
                            </label>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={cargando}
                                    className="w-full rounded-xl bg-linear-to-r from-cyan-400 via-sky-400 to-primary px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-[0_15px_30px_rgba(56,189,248,0.35)] transition-all disabled:opacity-45 hover:brightness-110"
                                >
                                    {cargando ? t.persistiendo : t.entrar}
                                </button>
                            </div>
                        </form>

                        <p className="mt-8 text-center text-sm text-muted-foreground">
                            {t.recordatorio}{" "}
                            <Link href="/register" className="font-semibold text-cyan hover:text-cyan/80">
                                {t.crear}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
