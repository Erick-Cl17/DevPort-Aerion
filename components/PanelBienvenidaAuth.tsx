export default function PanelBienvenidaAuth({ registro = false }: { registro?: boolean }) {
    return (
        <div className="hidden min-h-[520px] flex-col justify-between overflow-hidden rounded-2xl border border-primary/25 bg-primary/10 p-8 md:flex">
            <div>
                <p className="label-mono">{registro ? "Nuevo operador" : "Acceso autorizado"}</p>
                <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-foreground">
                    {registro ? "Bienvenido a AERION" : "Bienvenido de nuevo"}
                </h2>
                <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
                    {registro
                        ? "Crea tu perfil para acceder a tus equipos, revisiones y simuladores asignados."
                        : "Continúa gestionando revisiones, equipos, usuarios y trazabilidad desde un solo centro de operaciones."}
                </p>
            </div>
            <div>
                <p className="label-mono">Integridad de sesión</p>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-background/60">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary to-cyan" />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Canal protegido · Auditoría activa</p>
            </div>
        </div>
    );
}