"use client";

import { useEffect, useState } from "react";

export default function RelojZonaHoraria({ zona }: { zona: string }) {
    const [ahora, setAhora] = useState<Date | null>(null);
    const [formato, setFormato] = useState<12 | 24>(() => {
        if (typeof window === "undefined") return 24;
        return window.localStorage.getItem("aerion-formato-hora") === "12" ? 12 : 24;
    });

    useEffect(() => {
        const actualizar = () => setAhora(new Date());
        actualizar();
        const intervalo = window.setInterval(actualizar, 1000);
        return () => window.clearInterval(intervalo);
    }, []);

    const fecha = ahora
        ? new Intl.DateTimeFormat("es-EC", { day: "2-digit", month: "short", year: "numeric", timeZone: zona }).format(ahora)
        : "-- --- ----";
    const hora = ahora
        ? new Intl.DateTimeFormat("es-EC", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: formato === 12, timeZone: zona }).format(ahora)
        : "--:--:--";

    return <div className="hidden items-center gap-3 border-r border-border pr-4 sm:flex" aria-label={`Fecha y hora en ${zona}`}>
        <div className="text-right leading-tight"><p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">{fecha}</p><p className="mt-1 font-mono text-sm font-semibold text-cyan">{hora}</p></div>
        <button type="button" onClick={() => { const nuevoFormato = formato === 24 ? 12 : 24; setFormato(nuevoFormato); window.localStorage.setItem("aerion-formato-hora", String(nuevoFormato)); }} className="rounded-md border border-border px-1.5 py-1 font-mono text-[0.55rem] text-muted-foreground transition hover:border-cyan/50 hover:text-cyan" aria-label={`Cambiar a formato de ${formato === 24 ? "12" : "24"} horas`}>{formato}H</button>
    </div>;
}
