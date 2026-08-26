"use client";

import { useEffect, useState } from "react";

type Idioma = "ES" | "EN" | "ZH";

const COPY: Record<Idioma, { titulo: string; descripcion: string; etiqueta: string; estado: string; meta: string }> = {
    ES: {
        etiqueta: "Acceso autorizado",
        titulo: "Bienvenido de nuevo",
        descripcion: "Continúa gestionando revisiones, equipos, usuarios y trazabilidad desde un solo centro de operaciones.",
        estado: "Integridad de sesión",
        meta: "Canal protegido · Auditoría activa",
    },
    EN: {
        etiqueta: "Authorized access",
        titulo: "Welcome back",
        descripcion: "Resume control of your test lab, findings, risks and compliance from a single operational console.",
        estado: "Session integrity",
        meta: "Encrypted channel · Audit active",
    },
    ZH: {
        etiqueta: "授权访问",
        titulo: "欢迎回来",
        descripcion: "从单一控制台管理你的测试实验室、发现、风险和合规状态。",
        estado: "会话完整性",
        meta: "加密通道 · 审计已启用",
    },
};

const COPY_REGISTRO: Record<Idioma, { titulo: string; descripcion: string; etiqueta: string; estado: string; meta: string }> = {
    ES: {
        etiqueta: "Nuevo operador",
        titulo: "Bienvenido a AERION",
        descripcion: "Crea tu perfil para acceder a tus equipos, revisiones y simuladores asignados.",
        estado: "Integridad de sesión",
        meta: "Canal protegido · Auditoría activa",
    },
    EN: {
        etiqueta: "New operator",
        titulo: "Welcome to NEXUS",
        descripcion: "Create your profile to access your assigned teams, reviews and simulators.",
        estado: "Session integrity",
        meta: "Encrypted channel · Audit active",
    },
    ZH: {
        etiqueta: "新操作员",
        titulo: "欢迎来到 NEXUS",
        descripcion: "创建个人资料以访问分配给你的团队、评审和模拟器。",
        estado: "会话完整性",
        meta: "加密通道 · 审计已启用",
    },
};

function leerIdiomaInicial(): Idioma {
    if (typeof window === "undefined") return "ES";
    const valor = window.localStorage.getItem("aerion-idioma");
    return valor === "EN" || valor === "ZH" ? valor : "ES";
}

export default function PanelBienvenidaAuth({ registro = false }: { registro?: boolean }) {
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

    const copy = registro ? COPY_REGISTRO[idioma] : COPY[idioma];

    return (
        <div className="relative hidden min-h-140 flex-col justify-between overflow-hidden rounded-2xl border border-cyan/30 p-8 md:flex" style={{ background: "radial-gradient(circle at top, rgba(34,211,238,0.18), rgba(10,18,31,0.96) 40%, rgba(5,12,20,0.97) 100%)" }}>
            <div aria-hidden className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
            <div aria-hidden className="absolute -left-8 top-14 h-40 w-40 rounded-full bg-cyan/10 blur-3xl" />
            <div aria-hidden className="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative z-10 flex flex-1 flex-col justify-between">
                <div>
                    <p className="label-mono text-cyan/90">{copy.etiqueta}</p>
                    <h2 className="mt-4 max-w-xs font-display text-4xl font-bold leading-tight text-foreground">
                        {copy.titulo}
                    </h2>
                    <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">{copy.descripcion}</p>
                </div>

                <div className="relative mt-8 flex items-center justify-center">
                    <div className="relative h-56 w-56">
                        <div className="absolute inset-0 rounded-full border border-cyan/30 animate-orbit" />
                        <div className="absolute inset-4 rounded-full border border-cyan/20 animate-[orbit_18s_linear_infinite_reverse]" />
                        <div className="absolute inset-7 rounded-full bg-cyan/8 ring-1 ring-cyan/15" />

                        <div className="absolute left-1/2 top-1/2 z-10 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cyan/40 bg-linear-to-br from-cyan-300/20 via-sky-500/10 to-primary/20 shadow-[0_0_30px_rgba(34,211,238,0.35)]">
                            <div className="relative h-12 w-12">
                                <div className="absolute left-1/2 top-1 h-5 w-5 -translate-x-1/2 rounded-full bg-slate-200 shadow-[0_0_18px_rgba(255,255,255,0.45)]" />
                                <div className="absolute left-1/2 top-5 h-8 w-8 -translate-x-1/2 rounded-[40%_40%_50%_50%] bg-slate-200" />
                                <div className="absolute left-3 top-8 h-6 w-2.5 rounded-full bg-slate-300" />
                                <div className="absolute right-3 top-8 h-6 w-2.5 rounded-full bg-slate-300" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-8">
                    <p className="label-mono text-cyan/90">{copy.estado}</p>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-background/60">
                        <div className="h-full w-2/3 rounded-full bg-linear-to-r from-cyan-300 via-cyan-400 to-primary" />
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">{copy.meta}</p>
                </div>
            </div>
        </div>
    );
}