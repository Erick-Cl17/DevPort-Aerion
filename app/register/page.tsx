"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { passwordCumpleTodo } from "@/lib/password-rules";
import PasswordChecklist from "@/components/PasswordChecklist";
import PanelBienvenidaAuth from "@/components/PanelBienvenidaAuth";

type Idioma = "ES" | "EN" | "ZH";

const COPY: Record<Idioma, {
    titulo: string;
    subtitulo: string;
    nombre: string;
    apellido: string;
    email: string;
    organizacion: string;
    codigo: string;
    password: string;
    confirmar: string;
    crear: string;
    crearOrg: string;
    unirseCodigo: string;
    yaTienes: string;
    iniciar: string;
    revisar: string;
    mensaje: string;
    textoPassword: string;
    crearCuenta: string;
    cargando: string;
}> = {
    ES: {
        titulo: "Crear cuenta",
        subtitulo: "Regístrate en AERION",
        nombre: "Nombre",
        apellido: "Apellido",
        email: "Correo electrónico",
        organizacion: "Nombre de tu organización",
        codigo: "Código de invitación",
        password: "Contraseña",
        confirmar: "Confirmar contraseña",
        crear: "Crear cuenta",
        crearOrg: "Crear organización",
        unirseCodigo: "Unirme con código",
        yaTienes: "¿Ya tienes cuenta?",
        iniciar: "Inicia sesión",
        revisar: "Revisa tu correo",
        mensaje: "Enviamos un enlace de confirmación a",
        textoPassword: "Debes confirmarlo antes de poder iniciar sesión.",
        crearCuenta: "Crear cuenta",
        cargando: "Creando cuenta...",
    },
    EN: {
        titulo: "Create account",
        subtitulo: "Register on AERION",
        nombre: "First name",
        apellido: "Last name",
        email: "Email",
        organizacion: "Your organization name",
        codigo: "Invitation code",
        password: "Password",
        confirmar: "Confirm password",
        crear: "Create account",
        crearOrg: "Create organization",
        unirseCodigo: "Join with code",
        yaTienes: "Already have an account?",
        iniciar: "Sign in",
        revisar: "Check your email",
        mensaje: "We sent a confirmation link to",
        textoPassword: "You must confirm it before you can sign in.",
        crearCuenta: "Create account",
        cargando: "Creating account...",
    },
    ZH: {
        titulo: "创建账户",
        subtitulo: "在 AERION 上注册",
        nombre: "名字",
        apellido: "姓氏",
        email: "电子邮件",
        organizacion: "组织名称",
        codigo: "邀请码",
        password: "密码",
        confirmar: "确认密码",
        crear: "创建账户",
        crearOrg: "创建组织",
        unirseCodigo: "使用代码加入",
        yaTienes: "已有账号？",
        iniciar: "登录",
        revisar: "检查你的邮箱",
        mensaje: "我们已发送确认链接至",
        textoPassword: "你必须先确认后才能登录。",
        crearCuenta: "创建账户",
        cargando: "创建中...",
    },
};

function leerIdiomaInicial(): Idioma {
    if (typeof window === "undefined") return "ES";
    const valor = window.localStorage.getItem("aerion-idioma");
    return valor === "EN" || valor === "ZH" ? valor : "ES";
}

export default function RegisterPage() {
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [enviado, setEnviado] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [idioma, setIdioma] = useState<Idioma>(leerIdiomaInicial);

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

    const [modo, setModo] = useState<"crear" | "unirse">("crear");
    const [nombreOrganizacion, setNombreOrganizacion] = useState("");
    const [codigoInvitacion, setCodigoInvitacion] = useState("");

    const contraseñaValida = passwordCumpleTodo(password);
    const coinciden = password.length > 0 && password === confirmPassword;
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
            <section className="min-h-[70vh] flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md panel p-8 text-center">
                    <h1 className="font-display text-2xl font-bold text-foreground mb-3">{t.revisar}</h1>
                    <p className="text-muted-foreground">
                        {t.mensaje} <strong className="text-foreground">{email}</strong>.
                        {" "}{t.textoPassword}
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-[70vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-5xl panel edge-scan p-2 sm:p-3">
                <div className="grid overflow-hidden rounded-2xl md:grid-cols-[1.2fr_1.08fr]">
                    <div className="bg-[#091827] p-6 sm:p-8">
                        <div className="mb-8">
                            <p className="label-mono text-cyan/80">REGISTER A NEW PROFILE</p>
                            <h1 className="mt-3 font-display text-4xl font-bold text-foreground">{t.titulo}</h1>
                        </div>

                        {error && (
                            <p className="mb-4 rounded-lg border border-critical/40 bg-critical/10 px-4 py-3 text-sm text-critical">{error}</p>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-3">
                                <label className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                    {t.nombre}
                                    <input
                                        type="text"
                                        placeholder={t.nombre}
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        className="mt-2 w-full rounded-xl border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-cyan/60 focus:outline-none"
                                    />
                                </label>
                                <label className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                    {t.apellido}
                                    <input
                                        type="text"
                                        placeholder={t.apellido}
                                        value={apellido}
                                        onChange={(e) => setApellido(e.target.value)}
                                        className="mt-2 w-full rounded-xl border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-cyan/60 focus:outline-none"
                                    />
                                </label>
                            </div>

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

                            <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-secondary p-1">
                                <button
                                    type="button"
                                    onClick={() => setModo("crear")}
                                    className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                                        modo === "crear" ? "bg-linear-to-r from-cyan-400 to-primary text-primary-foreground" : "text-muted-foreground"
                                    }`}
                                >
                                    {t.crearOrg}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModo("unirse")}
                                    className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                                        modo === "unirse" ? "bg-linear-to-r from-cyan-400 to-primary text-primary-foreground" : "text-muted-foreground"
                                    }`}
                                >
                                    {t.unirseCodigo}
                                </button>
                            </div>

                            {modo === "crear" ? (
                                <label className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                    {t.organizacion}
                                    <input
                                        type="text"
                                        placeholder={t.organizacion}
                                        value={nombreOrganizacion}
                                        onChange={(e) => setNombreOrganizacion(e.target.value)}
                                        className="mt-2 w-full rounded-xl border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-cyan/60 focus:outline-none"
                                    />
                                </label>
                            ) : (
                                <label className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                    {t.codigo}
                                    <input
                                        type="text"
                                        placeholder="A1B2C3D4"
                                        value={codigoInvitacion}
                                        onChange={(e) => setCodigoInvitacion(e.target.value.toUpperCase())}
                                        className="mt-2 w-full rounded-xl border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-cyan/60 focus:outline-none uppercase"
                                    />
                                </label>
                            )}

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
                            <PasswordChecklist password={password} />

                            <label className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                {t.confirmar}
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="mt-2 w-full rounded-xl border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-cyan/60 focus:outline-none"
                                />
                            </label>

                            {confirmPassword.length > 0 && (
                                <p className={`text-xs ${coinciden ? "text-success" : "text-critical"}`}>
                                    {coinciden
                                        ? idioma === "EN"
                                            ? "Passwords match"
                                            : idioma === "ZH"
                                                ? "密码匹配"
                                                : "Las contraseñas coinciden"
                                        : idioma === "EN"
                                            ? "Passwords do not match"
                                            : idioma === "ZH"
                                                ? "密码不匹配"
                                                : "Las contraseñas no coinciden"}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={!formularioValido || cargando}
                                className="mt-2 w-full rounded-xl bg-linear-to-r from-cyan-400 via-sky-400 to-primary px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-[0_15px_30px_rgba(56,189,248,0.35)] transition-all disabled:cursor-not-allowed disabled:opacity-45 hover:brightness-110"
                            >
                                {cargando ? t.cargando : t.crear}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-muted-foreground">
                            {t.yaTienes}{" "}
                            <Link href="/login" className="font-semibold text-cyan hover:text-cyan/80">
                                {t.iniciar}
                            </Link>
                        </p>
                    </div>

                    <PanelBienvenidaAuth registro />
                </div>
            </div>
        </section>
    );
}
