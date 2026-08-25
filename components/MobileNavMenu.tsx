"use client";

import { useState } from "react";
import Link from "next/link";

const ENLACES = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/simuladores", label: "Simuladores" },
    { href: "/dashboard/equipos", label: "Equipos" },
    { href: "/dashboard/usuarios", label: "Usuarios" },
    { href: "/dashboard/notificaciones", label: "Notificaciones" },
    { href: "/dashboard/administracion", label: "Administración" },
];

export default function MobileNavMenu() {
    const [abierto, setAbierto] = useState(false);

    return (
        <div className="md:hidden relative">
            <button
                onClick={() => setAbierto((v) => !v)}
                aria-label="Abrir menú"
                aria-expanded={abierto}
                className="p-2 -mr-2 flex flex-col gap-1"
            >
                <span className="block h-0.5 w-5 bg-foreground" />
                <span className="block h-0.5 w-5 bg-foreground" />
                <span className="block h-0.5 w-5 bg-foreground" />
            </button>

            {abierto && (
                <div className="absolute right-0 mt-3 w-52 panel p-2 z-50">
                    {ENLACES.map((e) => (
                        <Link
                            key={e.href}
                            href={e.href}
                            onClick={() => setAbierto(false)}
                            className="block px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
                        >
                            {e.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
