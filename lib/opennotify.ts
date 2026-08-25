// Segunda API externa: Open Notify (sin registro, sin API key).
// Se usa para mostrar la posición actual de la Estación Espacial
export type PosicionISS = {
    latitud: number;
    longitud: number;
    timestamp: number;
};

export async function obtenerPosicionISS(): Promise<{
    data: PosicionISS | null;
    error: string | null;
}> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 segundos

        const res = await fetch("https://api.open-notify.org/iss-now.json", {
            next: { revalidate: 30 },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            return { data: null, error: `Open Notify respondió con estado ${res.status}` };
        }

        const json = await res.json();

        if (json.message !== "success") {
            return { data: null, error: "Respuesta inesperada de Open Notify" };
        }

        return {
            data: {
                latitud: parseFloat(json.iss_position.latitude),
                longitud: parseFloat(json.iss_position.longitude),
                timestamp: json.timestamp,
            },
            error: null,
        };
    } catch (error: any) {
        // La API no respondió a tiempo o no hay conexión 
        if (error.name === "AbortError") {
            return { data: null, error: "Open Notify tardó demasiado en responder" };
        }
        return { data: null, error: "No se pudo contactar a Open Notify en este momento" };
    }
}

export async function obtenerAstronautas(): Promise<{
    data: { numero: number; nombres: string[] } | null;
    error: string | null;
}> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 segundos

        const res = await fetch("https://api.open-notify.org/astros.json", {
            next: { revalidate: 3600 },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            return { data: null, error: `Open Notify respondió con estado ${res.status}` };
        }

        const json = await res.json();

        if (json.message !== "success") {
            return { data: null, error: "Respuesta inesperada de Open Notify" };
        }

        return {
            data: {
                numero: json.number,
                nombres: json.people.map((p: { name: string }) => p.name),
            },
            error: null,
        };
    } catch (error: any) {
        if (error.name === "AbortError") {
            return { data: null, error: "Open Notify tardó demasiado en responder" };
        }
        return { data: null, error: "No se pudo contactar a Open Notify en este momento" };
    }
}
