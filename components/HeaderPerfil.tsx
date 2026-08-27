"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";

// Cierra el menú si se hace clic fuera de él.
function useCerrarAlClickAfuera(onClose: () => void) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const manejador = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener("mousedown", manejador);
        return () => document.removeEventListener("mousedown", manejador);
    }, [onClose]);
    return ref;
}

function iniciales(nombre: string, apellido: string) {
    return `${nombre?.[0] ?? ""}${apellido?.[0] ?? ""}`.toUpperCase() || "?";
}

export default function HeaderPerfil({
    nombre,
    apellido,
    email,
    organizacionNombre,
    nivel,
    onSignOut,
}: {
    nombre: string;
    apellido: string;
    email: string;
    organizacionNombre: string | null;
    nivel: string | null;
    onSignOut: () => void;
}) {
    const [abierto, setAbierto] = useState(false);
    const ref = useCerrarAlClickAfuera(() => setAbierto(false));

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setAbierto((v) => !v)}
                aria-label="Abrir perfil"
                className="grid size-10 place-items-center rounded-xl bg-primary/20 font-display text-sm font-bold text-cyan transition-all hover:-translate-y-0.5 hover:shadow-[0_0_20px_-4px_var(--cyan)]"
            >
                {iniciales(nombre, apellido)}
            </button>

            {abierto && (
                <div className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-border-strong bg-surface/95 p-2 shadow-panel backdrop-blur-xl">
                    <div className="relative overflow-hidden rounded-xl border border-primary/25 bg-primary/10 p-4">
                        <div className="relative flex items-center gap-3">
                            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/25 font-display text-base font-bold text-cyan glow-ring">
                                {iniciales(nombre, apellido)}
                            </span>
                            <div className="min-w-0">
                                <p className="truncate font-display text-base font-semibold text-foreground">
                                    {nombre} {apellido}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">{email}</p>
                            </div>
                        </div>
                    </div>

                    <dl className="mt-2 space-y-2 px-3 py-2 text-sm">
                        <div className="flex items-start justify-between gap-3">
                            <dt className="label-mono">Organización</dt>
                            <dd className="max-w-[60%] text-right leading-snug text-foreground">
                                {organizacionNombre ?? "Sin organización"}
                            </dd>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                            <dt className="label-mono">Rol</dt>
                            <dd className="max-w-[60%] text-right leading-snug text-foreground">{nivel ?? "—"}</dd>
                        </div>
                    </dl>

                    <div className="mt-1 grid grid-cols-2 gap-2">
                        <Link
                            href="/dashboard/perfil"
                            onClick={() => setAbierto(false)}
                            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2.5 font-mono text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:text-cyan"
                        >
                            <ShieldCheck className="size-3.5" /> Perfil
                        </Link>
                        <button
                            type="button"
                            onClick={onSignOut}
                            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2.5 font-mono text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:text-critical"
                        >
                            <LogOut className="size-3.5" /> Salir
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
