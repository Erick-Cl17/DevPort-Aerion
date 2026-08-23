import Link from "next/link";

export default function Home() {
    return (
        <section className="relative overflow-hidden grid-field">
            <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
            <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">
                <span className="inline-block text-xs tracking-[0.2em] uppercase text-cyan mb-4">
                    Gestión de revisiones multi-equipo
                </span>
                <h1 className="font-display text-4xl sm:text-6xl font-bold text-foreground mb-6">
                    AERION
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
                    Controla el acceso a cada módulo por organización, equipo, cargo y
                    rol. Crea revisiones con plazos, respeta la zona horaria de cada
                    equipo y mantén trazabilidad completa de cada cambio.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Link
                        href="/register"
                        className="bg-gradient-accent text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
                    >
                        Crear cuenta
                    </Link>
                    <Link
                        href="/login"
                        className="border border-border-strong text-foreground font-semibold px-6 py-3 rounded-xl hover:bg-secondary transition-colors"
                    >
                        Iniciar sesión
                    </Link>
                </div>
            </div>

            <div className="relative max-w-5xl mx-auto px-6 pb-24 grid sm:grid-cols-3 gap-6">
                {[
                    {
                        titulo: "Roles por equipo",
                        texto:
                            "Una misma persona puede ser Supervisor en un equipo y Consulta en otro.",
                    },
                    {
                        titulo: "Plazos y zona horaria",
                        texto:
                            "Cada revisión guarda su plazo en UTC y se presenta convertido a la zona horaria de cada usuario.",
                    },
                    {
                        titulo: "Trazabilidad total",
                        texto:
                            "Cada creación, inicio, finalización y cambio de rol queda registrado en auditoría.",
                    },
                ].map((item) => (
                    <div key={item.titulo} className="panel p-6 text-left">
                        <h3 className="font-display text-foreground font-semibold mb-2">
                            {item.titulo}
                        </h3>
                        <p className="text-sm text-muted-foreground">{item.texto}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
