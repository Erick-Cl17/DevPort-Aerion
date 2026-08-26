"use client";

import { useRef, useState } from "react";
import { importarDesdeJson } from "./actions";

const PLANTILLA = {
    riesgos: [
        {
            codigo: "RSK-001",
            nombre: "Ejemplo de riesgo",
            descripcion: "Descripción breve",
            categoria: "Ciberataques",
            activo: "Servidor de aplicaciones",
            amenaza: "Acceso no autorizado",
            probabilidad: 3,
            impacto: 4,
            tratamiento: "Mitigar",
            estado: "Identificado",
            responsable: "Nombre del responsable",
        },
    ],
    vulnerabilidades: [
        {
            codigo: "VUL-001",
            nombre: "Ejemplo de vulnerabilidad",
            descripcion: "Descripción breve",
            categoria: "Técnica",
            severidad: "Alta",
            activo_afectado: "Servidor de aplicaciones",
        },
    ],
};

export default function ImportarJson() {
    const [texto, setTexto] = useState("");
    const [errorLocal, setErrorLocal] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const inputArchivo = useRef<HTMLInputElement>(null);

    function manejarArchivo(e: React.ChangeEvent<HTMLInputElement>) {
        const archivo = e.target.files?.[0];
        if (!archivo) return;

        const lector = new FileReader();
        lector.onload = () => setTexto(String(lector.result ?? ""));
        lector.readAsText(archivo);
    }

    function descargarPlantilla() {
        const blob = new Blob([JSON.stringify(PLANTILLA, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "plantilla-riesgos.json";
        a.click();
        URL.revokeObjectURL(url);
    }

    function manejarEnvio(e: React.FormEvent) {
        setErrorLocal(null);
        if (!texto.trim()) {
            e.preventDefault();
            setErrorLocal("Pega o sube un archivo JSON primero.");
            return;
        }
        try {
            const datos = JSON.parse(texto);
            const tieneRiesgos = Array.isArray(datos.riesgos) && datos.riesgos.length > 0;
            const tieneVulns = Array.isArray(datos.vulnerabilidades) && datos.vulnerabilidades.length > 0;
            if (!tieneRiesgos && !tieneVulns) {
                e.preventDefault();
                setErrorLocal('El JSON debe tener "riesgos" o "vulnerabilidades" con al menos un elemento.');
            }
        } catch {
            e.preventDefault();
            setErrorLocal("Ese texto no es un JSON válido — revisa comas y llaves.");
        }
    }

    return (
        <form ref={formRef} action={importarDesdeJson} onSubmit={manejarEnvio} className="space-y-4">
            <input type="hidden" name="json" value={texto} />

            <div className="flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={() => inputArchivo.current?.click()}
                    className="bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
                >
                    📁 Subir archivo .json
                </button>
                <input
                    ref={inputArchivo}
                    type="file"
                    accept=".json,application/json"
                    onChange={manejarArchivo}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={descargarPlantilla}
                    className="border border-border-strong hover:border-primary/60 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
                >
                    ⬇ Descargar plantilla de ejemplo
                </button>
            </div>

            <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder='También puedes pegar el JSON aquí, ej: {"riesgos": [...], "vulnerabilidades": [...]}'
                rows={8}
                className="w-full bg-secondary text-foreground font-mono text-xs rounded-lg px-4 py-3 border border-border focus:outline-none focus:border-primary"
            />

            {errorLocal && (
                <p className="bg-critical/10 border border-critical/40 text-critical text-sm rounded-lg px-4 py-3">
                    {errorLocal}
                </p>
            )}

            <button
                type="submit"
                className="bg-gradient-accent text-primary-foreground font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
                Importar
            </button>
        </form>
    );
}
