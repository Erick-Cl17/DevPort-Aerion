"use client";

import { useMemo, useState, Fragment } from "react";
import Link from "next/link";
import { formatearEnZona } from "@/lib/fechas";

const ESTADO_COLOR: Record<string, string> = {
    "No iniciada": "text-muted-foreground",
    "En proceso": "text-cyan",
    "Finalizada · En plazo": "text-success",
    "Finalizada · Fuera de plazo": "text-warning",
    "Vencida / No realizada": "text-critical",
    Cancelada: "text-muted-foreground",
};

type Revision = {
    id: string;
    codigo: string;
    titulo: string;
    estado: string;
    fecha_fin_plazo: string;
    zona_horaria_plazo: string;
    equipos: { nombre: string } | null;
};

// Componente para los controles de filtro
export function FiltroControls({
    busqueda,
    setBusqueda,
    estado,
    setEstado,
    revisiones,
}: {
    busqueda: string;
    setBusqueda: (s: string) => void;
    estado: string;
    setEstado: (s: string) => void;
    revisiones: Revision[];
}) {
    const estadosDisponibles = useMemo(
        () => Array.from(new Set(revisiones.map((r) => r.estado))),
        [revisiones]
    );

    return (
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border">
            <input
                type="text"
                placeholder="Buscar por código, título o equipo…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="flex-1 bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border focus:outline-none focus:border-primary"
            />
            <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border focus:outline-none focus:border-primary"
            >
                <option value="todos">Todos los estados</option>
                {estadosDisponibles.map((e) => (
                    <option key={e} value={e}>
                        {e}
                    </option>
                ))}
            </select>
        </div>
    );
}

// Client Component: recibe los datos YA CARGADOS por el Server Component
// del dashboard (una sola consulta a Supabase) y filtra en el navegador
// con useState — así escribir en el buscador o cambiar el estado no
// dispara ninguna consulta nueva a la base de datos.
export default function FiltroRevisiones({ revisiones }: { revisiones: Revision[] }) {
    const [busqueda, setBusqueda] = useState("");
    const [estado, setEstado] = useState("todos");

    const filtradas = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();
        return revisiones.filter((r) => {
            const coincideTexto =
                texto === "" ||
                r.codigo.toLowerCase().includes(texto) ||
                r.titulo.toLowerCase().includes(texto) ||
                (r.equipos?.nombre ?? "").toLowerCase().includes(texto);
            const coincideEstado = estado === "todos" || r.estado === estado;
            return coincideTexto && coincideEstado;
        });
    }, [revisiones, busqueda, estado]);

    return (
        <Fragment>
            <FiltroControls
                busqueda={busqueda}
                setBusqueda={setBusqueda}
                estado={estado}
                setEstado={setEstado}
                revisiones={revisiones}
            />
            <table className="w-full text-sm">
                <thead className="bg-surface-raised text-muted-foreground text-xs uppercase tracking-wide">
                    <tr>
                        <th className="text-left px-4 py-3">Código</th>
                        <th className="text-left px-4 py-3">Título</th>
                        <th className="text-left px-4 py-3">Equipo</th>
                        <th className="text-left px-4 py-3">Plazo (fin)</th>
                        <th className="text-left px-4 py-3">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {filtradas.map((r) => (
                        <tr key={r.id} className="border-t border-border hover:bg-secondary/40">
                            <td className="px-4 py-3">
                                <Link href={`/dashboard/revisiones/${r.id}`} className="text-primary hover:underline">
                                    {r.codigo}
                                </Link>
                            </td>
                            <td className="px-4 py-3 text-foreground">{r.titulo}</td>
                            <td className="px-4 py-3 text-muted-foreground">{r.equipos?.nombre}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                                {formatearEnZona(r.fecha_fin_plazo, r.zona_horaria_plazo)}
                            </td>
                            <td className={`px-4 py-3 font-medium ${ESTADO_COLOR[r.estado] ?? ""}`}>
                                {r.estado}
                            </td>
                        </tr>
                    ))}
                    {filtradas.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                {revisiones.length === 0
                                    ? "Todavía no tienes revisiones visibles en tu alcance."
                                    : "Ninguna revisión coincide con la búsqueda/filtro."}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </Fragment>
    );
}
