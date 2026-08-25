/**
 * Función helper para agregar un timeout a una promesa
 * Si la promesa tarda más que el timeout, devuelve el resultado vacío
 */
export async function conTimeout<T>(
    promesa: Promise<T>,
    timeoutMs: number,
    valorPorDefecto: T
): Promise<T> {
    try {
        const resultado = await Promise.race([
            promesa,
            new Promise<T>((_, reject) =>
                setTimeout(
                    () => reject(new Error("Timeout")),
                    timeoutMs
                )
            ),
        ]);
        return resultado;
    } catch {
        // Si hay timeout o error, devolver el valor por defecto
        return valorPorDefecto;
    }
}
