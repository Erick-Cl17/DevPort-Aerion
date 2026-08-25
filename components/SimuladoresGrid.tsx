"use client";

import { useState } from "react";
import ImagenConBrillo from "@/components/ImagenConBrillo";

type Simulador = { nombre: string; src: string; glow: string };

export default function SimuladoresGrid({ simuladores }: { simuladores: Simulador[] }) {
    // null = ningún modal abierto; si no, guarda el simulador clickeado.
    const [abierto, setAbierto] = useState<Simulador | null>(null);

    return (
        <>
            <h2 className="relative text-center font-display text-xl font-bold text-foreground mb-6">
                Simuladores
            </h2>
            <div className="relative max-w-4xl mx-auto px-6 pb-24 grid grid-cols-2 sm:grid-cols-5 gap-6">
                {simuladores.map((sim) => (
                    <button
                        key={sim.nombre}
                        type="button"
                        onMouseEnter={() => setAbierto(sim)}
                        onFocus={() => setAbierto(sim)}
                        onClick={() => setAbierto(sim)}
                        aria-label={`Ver simulador de ${sim.nombre}`}
                        className="flex flex-col items-center gap-3 cursor-pointer group"
                    >
                        <div className="transition-transform group-hover:scale-105">
                            <ImagenConBrillo
                                src={sim.src}
                                alt={sim.nombre}
                                glowColor={sim.glow}
                                className="h-20 w-20 sm:h-24 sm:w-24"
                            />
                        </div>
                        <span className="text-xs text-muted-foreground">{sim.nombre}</span>
                    </button>
                ))}
            </div>

            {abierto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Simulador de ${abierto.nombre}`}
                    onClick={() => setAbierto(null)}
                >
                    <div
                        className="panel w-full max-w-sm p-6 text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="font-display text-lg font-bold text-foreground mb-3">
                            Simulador de {abierto.nombre}
                        </h2>
                        <p className="text-muted-foreground text-sm mb-6">
                            Esta es una vista de ejemplo — el simulador de {abierto.nombre} todavía
                            no está implementado en esta versión de AERION.
                        </p>
                        <button
                            type="button"
                            onClick={() => setAbierto(null)}
                            className="bg-gradient-accent text-primary-foreground font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Volver a la bienvenida
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
