"use client";

import { useState } from "react";

type ImagenExistente = { path: string; url: string };

export default function SelectorImagenProyecto({
    imagenesExistentes,
}: {
    imagenesExistentes: ImagenExistente[];
}) {
    const [modo, setModo] = useState<"nueva" | "existente">("nueva");
    const [seleccionada, setSeleccionada] = useState<string>("");

    return (
        <div className="text-sm text-muted-foreground">
            <p className="mb-2">Imagen del proyecto</p>

            <div className="mb-3 flex gap-2">
                <button
                    type="button"
                    onClick={() => setModo("nueva")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        modo === "nueva" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}
                >
                    Subir nueva
                </button>
                <button
                    type="button"
                    onClick={() => setModo("existente")}
                    disabled={imagenesExistentes.length === 0}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-40 ${
                        modo === "existente" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}
                >
                    Elegir existente ({imagenesExistentes.length})
                </button>
            </div>

            {modo === "nueva" ? (
                <input
                    type="file"
                    name="imagen"
                    accept="image/*"
                    className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-foreground"
                />
            ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {imagenesExistentes.map((img) => (
                        <button
                            type="button"
                            key={img.path}
                            onClick={() => setSeleccionada(img.path)}
                            className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                                seleccionada === img.path ? "border-primary" : "border-transparent"
                            }`}
                        >
                            <img src={img.url} alt="" className="h-full w-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            <input type="hidden" name="imagen_existente" value={modo === "existente" ? seleccionada : ""} />
        </div>
    );
}