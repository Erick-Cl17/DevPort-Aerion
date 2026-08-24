import Link from "next/link";

const MODULOS = [
    { href: "/dashboard/cargos", nombre: "Cargos", desc: "Catálogo de cargos de la organización" },
    { href: "/dashboard/roles", nombre: "Roles", desc: "Roles y su nivel de acceso" },
    { href: "/dashboard/reportes", nombre: "Reportes", desc: "Cumplimiento de revisiones por equipo" },
    { href: "/dashboard/auditoria", nombre: "Auditoría", desc: "Registro de acciones del sistema" },
];

export default function AdministracionPage() {
    return (
        <section className="max-w-3xl mx-auto px-6 py-10">
            <h1 className="font-display text-2xl font-bold text-foreground mb-8">Administración</h1>

            <div className="grid sm:grid-cols-2 gap-4">
                {MODULOS.map((m) => (
                    <Link
                        key={m.href}
                        href={m.href}
                        className="panel p-5 hover:border-primary/50 transition-colors block"
                    >
                        <h2 className="font-display text-foreground font-semibold mb-1">{m.nombre}</h2>
                        <p className="text-muted-foreground text-sm">{m.desc}</p>
                    </Link>
                ))}
            </div>
        </section>
    );
}
