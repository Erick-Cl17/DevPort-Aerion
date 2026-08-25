"use client";

import { useState } from "react";

const IDIOMAS = [
    { codigo: "ES", nombre: "Español" },
    { codigo: "EN", nombre: "English" },
];

export default function SelectorIdioma() {
    const [abierto, setAbierto] = useState(false);
    const [idioma, setIdioma] = useState(IDIOMAS[0]);

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
                {idioma.codigo}
                <span aria-hidden>{abierto ? "▴" : "▾"}</span>
            </button>

            {abierto && (
                <div className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-44 rounded-2xl border border-border-strong bg-surface/95 p-2 shadow-lift backdrop-blur-xl">
                    <p className="label-mono px-3 py-2">Idioma</p>
                    {IDIOMAS.map((opcion) => (
                        <button
                            key={opcion.codigo}
                            type="button"
                            onClick={() => {
                                setIdioma(opcion);
                                setAbierto(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-surface-raised ${
                                idioma.codigo === opcion.codigo ? "text-cyan" : "text-foreground"
                            }`}
                        >
                            <span>{opcion.nombre}</span>
                            {idioma.codigo === opcion.codigo && <span aria-hidden>✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}