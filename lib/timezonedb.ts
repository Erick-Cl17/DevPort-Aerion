// Consumo de la API externa TimeZoneDB 

export type ZonaHorariaInfo = {
    zoneName: string;
    formatted: string; // fecha/hora actual en esa zona, ya formateada
    gmtOffset: number; // segundos respecto a UTC
    abbreviation: string;
    dst: boolean;
};

export async function obtenerHoraEnZona(
    zoneName: string
): Promise<{ data: ZonaHorariaInfo | null; error: string | null }> {
    const apiKey = process.env.TIMEZONEDB_API_KEY;

    if (!apiKey) {
        return { data: null, error: "TIMEZONEDB_API_KEY no configurada" };
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 segundos

        const res = await fetch(
            `https://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=zone&zone=${encodeURIComponent(
                zoneName
            )}`,
            // 5 minutos de caché: suficiente para mostrar una hora "actual"
            { 
                next: { revalidate: 300 },
                signal: controller.signal,
            }
        );

        clearTimeout(timeoutId);

        if (!res.ok) {
            return { data: null, error: `TimeZoneDB respondió con estado ${res.status}` };
        }

        const json = await res.json();

        if (json.status !== "OK") {
            return { data: null, error: json.message ?? "Respuesta inesperada de TimeZoneDB" };
        }

        return {
            data: {
                zoneName: json.zoneName,
                formatted: json.formatted,
                gmtOffset: json.gmtOffset,
                abbreviation: json.abbreviation,
                dst: json.dst === "1" || json.dst === 1,
            },
            error: null,
        };
    } catch (error: any) {
        // La API no respondió a tiempo o no hay conexión — no debe tumbar el dashboard.
        if (error.name === "AbortError") {
            return { data: null, error: "TimeZoneDB tardó demasiado en responder" };
        }
        return { data: null, error: "No se pudo contactar a TimeZoneDB en este momento" };
    }
}

// Conversión de un instante UTC a una zona horaria IANA usando Intl,
// para mostrar los plazos de las revisiones
export function formatearEnZona(fechaISO: string, zona: string): string {
    return new Intl.DateTimeFormat("es-EC", {
        timeZone: zona,
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(fechaISO));
}
