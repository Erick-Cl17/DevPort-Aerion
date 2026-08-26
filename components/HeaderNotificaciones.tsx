"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, ExternalLink, X } from "lucide-react";

type Notificacion = { id: string; mensaje: string; evento: string; revision_id: string | null; created_at: string; estado: string };
type AccionServidor = () => Promise<void>;

export default function HeaderNotificaciones({ noLeidas, recientes, marcarTodas }: { noLeidas: number; recientes: Notificacion[]; marcarTodas: AccionServidor }) {
    const [abierto, setAbierto] = useState(false);
    const [seleccionada, setSeleccionada] = useState<Notificacion | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cerrar = (evento: MouseEvent) => { if (ref.current && !ref.current.contains(evento.target as Node)) setAbierto(false); };
        document.addEventListener("mousedown", cerrar);
        return () => document.removeEventListener("mousedown", cerrar);
    }, []);

    return <div className="relative" ref={ref}>
        <button type="button" onClick={() => setAbierto((value) => !value)} aria-label="Abrir notificaciones" aria-expanded={abierto} className="relative grid size-10 place-items-center rounded-xl border border-border bg-surface/70 text-muted-foreground transition hover:border-cyan/50 hover:text-cyan">
            <Bell className="size-4" />
            {noLeidas > 0 && <span className="absolute right-2 top-2 size-2 animate-pulse-glow rounded-full bg-critical" />}
        </button>
        {abierto && <div className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-[min(23rem,calc(100vw-2rem))] rounded-2xl border border-border-strong bg-surface/95 p-2 shadow-panel backdrop-blur-xl">
            <div className="flex items-center justify-between px-3 py-2"><p className="label-mono">Notificaciones</p>{noLeidas > 0 && <form action={marcarTodas}><button type="submit" className="flex items-center gap-1 font-mono text-[0.6rem] tracking-wider text-cyan uppercase hover:text-foreground"><CheckCheck className="size-3" /> Marcar todas</button></form>}</div>
            <div className="max-h-80 space-y-1 overflow-y-auto">{recientes.map((notificacion) => <button key={notificacion.id} type="button" onClick={() => setSeleccionada(notificacion)} className="flex w-full gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-secondary"><span className={`mt-1.5 size-2 shrink-0 rounded-full ${notificacion.estado === "leida" ? "bg-muted-foreground/40" : "bg-cyan"}`} /><span className="min-w-0"><span className="block text-sm leading-snug text-foreground">{notificacion.mensaje}</span><span className="label-mono mt-1 block">{new Date(notificacion.created_at).toLocaleString("es-EC")}</span></span></button>)}{recientes.length === 0 && <p className="px-3 py-4 text-sm text-muted-foreground">Sin notificaciones nuevas.</p>}</div>
            <Link href="/dashboard/notificaciones" onClick={() => setAbierto(false)} className="mt-1 flex justify-center rounded-xl border border-border bg-background/60 px-3 py-2.5 font-mono text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase hover:text-cyan">Ver todas</Link>
        </div>}
        {seleccionada && <div className="fixed inset-0 z-60 flex items-center justify-center bg-background/75 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Detalle de notificación"><div className="panel corner-ticks w-full max-w-lg p-6"><div className="flex items-start justify-between gap-4"><div><p className="label-mono text-cyan">Detalle de notificación</p><h2 className="mt-2 font-display text-xl font-bold text-foreground">{seleccionada.evento}</h2></div><button type="button" onClick={() => setSeleccionada(null)} aria-label="Cerrar detalle" className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button></div><p className="mt-6 text-base leading-relaxed text-foreground">{seleccionada.mensaje}</p><p className="mt-3 text-xs text-muted-foreground">Recibida el {new Date(seleccionada.created_at).toLocaleString("es-EC")}</p>{seleccionada.revision_id && <Link href={`/dashboard/revisiones/${seleccionada.revision_id}`} onClick={() => { setSeleccionada(null); setAbierto(false); }} className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-accent px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">Abrir revisión <ExternalLink className="size-4" /></Link>}</div></div>}
    </div>;
}
