"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Botón de "eliminar cuenta" con confirmación en dos pasos. Se separó del
// Server Component de /dashboard/perfil porque este necesita useState y
// fetch al endpoint de borrado.
export default function ZonaPeligroPerfil() {
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmando, setConfirmando] = useState(false);
    const router = useRouter();

    async function handleDeleteAccount() {
        if (!confirmando) {
            setConfirmando(true);
            return;
        }

        setError(null);
        setCargando(true);

        try {
            const response = await fetch("/api/delete-account", { method: "POST" });
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "No se pudo eliminar la cuenta");
                setCargando(false);
                setConfirmando(false);
                return;
            }

            router.push("/login?deleted=true");
        } catch (err: any) {
            setError(err.message || "Error al eliminar la cuenta");
            setCargando(false);
            setConfirmando(false);
        }
    }

    return (
        <div className="panel p-6 border border-critical/20">
            <h2 className="font-display text-lg font-bold text-critical mb-3">Zona de Peligro</h2>
            <p className="text-muted-foreground text-sm mb-4">
                Una vez que elimines tu cuenta, no habrá forma de recuperarla. Todos tus datos serán eliminados permanentemente.
            </p>

            {error && (
                <p className="bg-critical/10 border border-critical/40 text-critical text-sm rounded-lg px-4 py-3 mb-4">
                    {error}
                </p>
            )}

            {!confirmando ? (
                <button
                    onClick={handleDeleteAccount}
                    className="bg-critical hover:bg-critical/80 text-primary-foreground font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                    Eliminar Cuenta
                </button>
            ) : (
                <div className="space-y-3">
                    <p className="text-warning text-sm font-semibold bg-warning/10 border border-warning/40 rounded-lg px-4 py-3">
                        ⚠️ ¿Estás completamente seguro? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={handleDeleteAccount}
                            disabled={cargando}
                            className="bg-critical hover:bg-critical/80 text-primary-foreground font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-40"
                        >
                            {cargando ? "Eliminando..." : "Sí, eliminar mi cuenta"}
                        </button>
                        <button
                            onClick={() => setConfirmando(false)}
                            disabled={cargando}
                            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-40"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
