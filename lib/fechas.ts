/**
 * Formatea una fecha en una zona horaria específica
 * @param fecha - La fecha a formatear (string o Date)
 * @param zonaHoraria - La zona horaria (ej: "America/Guayaquil", "UTC")
 * @returns Fecha formateada en la zona horaria especificada
 */
export function formatearEnZona(
    fecha: string | Date | null,
    zonaHoraria: string = "America/Guayaquil"
): string {
    if (!fecha) return "-";

    try {
        const fechaObj = typeof fecha === "string" ? new Date(fecha) : fecha;

        if (isNaN(fechaObj.getTime())) {
            return "-";
        }

        return new Intl.DateTimeFormat("es-EC", {
            timeZone: zonaHoraria,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }).format(fechaObj);
    } catch (error) {
        console.error("Error al formatear fecha:", error);
        return "-";
    }
}
