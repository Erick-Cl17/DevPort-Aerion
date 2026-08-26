"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const IDIOMAS = [
    { codigo: "ES", nombre: "Español" },
    { codigo: "EN", nombre: "English" },
    { codigo: "ZH", nombre: "中文" },
];

export default function SelectorIdioma() {
    const router = useRouter();
    const [abierto, setAbierto] = useState(false);
    const [idioma, setIdioma] = useState<string>(IDIOMAS[0].codigo);

    useEffect(() => {
        const idiomaGuardado = window.localStorage.getItem("aerion-idioma");
        if (idiomaGuardado === "ES" || idiomaGuardado === "EN" || idiomaGuardado === "ZH") {
            setIdioma(idiomaGuardado);
        }

        const manejarCambioExterno = () => {
            const guardado = window.localStorage.getItem("aerion-idioma");
            if (guardado === "ES" || guardado === "EN" || guardado === "ZH") setIdioma(guardado);
        };
        window.addEventListener("storage", manejarCambioExterno);
        return () => window.removeEventListener("storage", manejarCambioExterno);
    }, []);

    function cambiarIdioma(opcion: (typeof IDIOMAS)[number]) {
        const codigo = opcion.codigo;
        setIdioma(codigo);
        window.localStorage.setItem("aerion-idioma", codigo);
        document.cookie = `aerion-idioma=${codigo}; path=/; max-age=31536000; SameSite=Lax`;
        document.documentElement.lang = codigo === "ES" ? "es" : codigo === "EN" ? "en" : "zh";
        document.documentElement.dataset.aerionIdioma = codigo;
        window.dispatchEvent(new CustomEvent("aerion:idioma", { detail: codigo }));
        setAbierto(false);
        router.refresh();
    }

    return (
        <div className="relative hidden lg:block">
            <button
                type="button"
                onClick={() => setAbierto((valor) => !valor)}
                aria-expanded={abierto}
                aria-label="Seleccionar idioma"
                className="flex items-center gap-2 rounded-xl border border-border bg-surface/70 px-3 py-2 font-mono text-xs tracking-[0.16em] text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-cyan/50 hover:text-cyan"
            >
                <span aria-hidden>◎</span>
                {idioma}
                <span aria-hidden>{abierto ? "▴" : "▾"}</span>
            </button>

            {abierto && (
                <div className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-44 rounded-2xl border border-border-strong bg-surface/95 p-2 shadow-lift backdrop-blur-xl">
                    <p className="label-mono px-3 py-2">Idioma</p>
                    {IDIOMAS.map((opcion) => (
                        <button
                            key={opcion.codigo}
                            type="button"
                            onClick={() => cambiarIdioma(opcion)}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-surface-raised ${
                                idioma === opcion.codigo ? "text-cyan" : "text-foreground"
                            }`}
                        >
                            <span>{opcion.nombre}</span>
                            {idioma === opcion.codigo && <span aria-hidden>✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}