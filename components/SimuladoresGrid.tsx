"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

type Simulador = { nombre: string; src: string; glow: string };
const CATEGORIAS = ["Todos", "Aviación", "Helicópteros", "Espacio", "Drones", "Marino"];

export default function SimuladoresGrid({ simuladores }: { simuladores: Simulador[] }) {
    const [busqueda, setBusqueda] = useState("");
    const [categoria, setCategoria] = useState("Todos");
    const [seleccionado, setSeleccionado] = useState(0);
    const visibles = useMemo(() => simuladores.filter((simulador) => simulador.nombre.toLowerCase().includes(busqueda.toLowerCase()) && (categoria === "Todos" || simulador.nombre === categoria)), [busqueda, categoria, simuladores]);
    const activo = visibles.findIndex((simulador) => simulador === simuladores[seleccionado]) >= 0 ? simuladores[seleccionado] : visibles[0];

    return <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar simulador, versión o ID" aria-label="Buscar simulador" className="h-11 w-full rounded-xl border border-border bg-surface/70 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-cyan/60" /></label>
            <button type="button" className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface/70 px-4 text-sm text-muted-foreground hover:border-cyan/50 hover:text-cyan"><SlidersHorizontal className="size-4" /> Filtros</button>
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface/40 p-1">{CATEGORIAS.map((nombre) => <button key={nombre} type="button" onClick={() => setCategoria(nombre)} className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs transition ${categoria === nombre ? "bg-gradient-accent font-semibold text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{nombre}</button>)}</div>
        {activo && <div className="grid min-h-72 gap-3 lg:grid-cols-5">{visibles.map((simulador) => { const indice = simuladores.indexOf(simulador); const esActivo = simulador === activo; return <button key={simulador.nombre} type="button" onMouseEnter={() => setSeleccionado(indice)} onFocus={() => setSeleccionado(indice)} onClick={() => setSeleccionado(indice)} aria-label={simulador.nombre} className={`group relative min-h-56 overflow-hidden rounded-2xl border text-left transition-all duration-500 ${esActivo ? "border-cyan/70 shadow-[0_22px_55px_-25px_var(--cyan)] lg:col-span-3" : "border-border bg-surface/50 lg:col-span-1"}`}><Image src={simulador.src} alt={simulador.nombre} fill sizes="(min-width: 1024px) 50vw, 100vw" className={`object-cover transition duration-700 ${esActivo ? "opacity-85 group-hover:scale-105" : "opacity-45 group-hover:opacity-70"}`} /></button>; })}</div>}
        {!activo && <p className="rounded-xl border border-border px-4 py-10 text-center text-sm text-muted-foreground">No se encontraron imágenes.</p>}
    </div>;
}
