import TransitionLink from "@/components/TransitionLink";
import ImagenConBrillo from "@/components/ImagenConBrillo";
import { IMAGENES } from "@/lib/image-paths";

const SIMULADORES = [
    { nombre: "Aviación", src: IMAGENES.simAviacion, glow: "var(--primary)" },
    { nombre: "Helicópteros", src: IMAGENES.simHelicopteros, glow: "var(--cyan)" },
    { nombre: "Espacio", src: IMAGENES.simEspacio, glow: "var(--accent)" },
    { nombre: "Drones", src: IMAGENES.simDrones, glow: "var(--success)" },
];

export default function Home() {
    return (
        <section className="relative min-h-[calc(100vh-73px)] overflow-hidden grid-field">
            <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />

            <div className="relative max-w-2xl mx-auto px-6 pt-20 pb-10 text-center">
                <div className="flex justify-center mb-6">
                    <ImagenConBrillo
                        src={IMAGENES.logo}
                        alt="Logo AERION"
                        glowColor="var(--primary)"
                        className="h-24 w-24"
                    />
                </div>
                <span className="inline-block text-xs tracking-[0.2em] uppercase text-cyan mb-4">
                    Bienvenido a
                </span>
                <h1 className="font-display text-4xl sm:text-6xl font-bold text-foreground mb-6">
                    AERION - Gestión de revisiones multiequipo
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
                    Controla el acceso a cada módulo por organización, equipo, cargo y
                    rol. Crea revisiones con plazos, respeta la zona horaria de cada
                    equipo y mantén trazabilidad completa de cada cambio. 
                    Inicia sesión o crea tu cuenta para continuar.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <TransitionLink
                        href="/register"
                        glowColor="var(--primary)"
                        className="w-full sm:w-auto bg-gradient-accent text-primary-foreground font-semibold px-8 py-3.5 rounded-xl transition-all hover:opacity-90 hover:shadow-lift"
                    >
                        Registrarse
                    </TransitionLink>
                    <TransitionLink
                        href="/login"
                        glowColor="var(--cyan)"
                        className="w-full sm:w-auto border border-border-strong text-foreground font-semibold px-8 py-3.5 rounded-xl transition-all hover:bg-secondary hover:border-primary/60 hover:shadow-lift"
                    >
                        Acceder
                    </TransitionLink>
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

            <div className="relative max-w-4xl mx-auto px-6 pb-24 grid grid-cols-2 sm:grid-cols-4 gap-6">
                {SIMULADORES.map((sim) => (
                    <div key={sim.nombre} className="flex flex-col items-center gap-3">
                        <ImagenConBrillo
                            src={sim.src}
                            alt={sim.nombre}
                            glowColor={sim.glow}
                            className="h-20 w-20 sm:h-24 sm:w-24"
                        />
                        <span className="text-xs text-muted-foreground">{sim.nombre}</span>
                    </div>
                ))}
            </div>

        </section>
    );
}
