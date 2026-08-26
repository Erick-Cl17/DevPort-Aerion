"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ClipboardList, FlaskConical, Gauge, LayoutDashboard, Menu, Settings, ShieldCheck, Users, Waypoints } from "lucide-react";
import { IMAGENES } from "@/lib/image-paths";

const ENLACES = [
    { href: "/", label: "Inicio", icon: LayoutDashboard },
    { href: "/dashboard", label: "Dashboard", icon: Gauge },
    { href: "/proyectos", label: "Proyectos", icon: FlaskConical },
    { href: "/dashboard/equipos", label: "Equipos", icon: Waypoints },
    { href: "/dashboard/usuarios", label: "Usuarios", icon: Users },
    { href: "/dashboard/proyecto", label: "Evaluaciones", icon: ClipboardList },
    { href: "/dashboard/security-center", label: "Centro de Seguridad", icon: ShieldCheck },
    { href: "/dashboard/administracion", label: "Administración", icon: Settings },
    { href: "/dashboard/auditoria", label: "Auditoría", icon: ClipboardList },
];

export default function AerionSidebar() {
    const pathname = usePathname();
    const [colapsada, setColapsada] = useState(false);
    const [movilAbierta, setMovilAbierta] = useState(false);

    return (
        <>
            <button
                type="button"
                aria-label="Abrir navegación"
                onClick={() => setMovilAbierta(true)}
                className="fixed left-4 top-4 z-40 grid size-10 place-items-center rounded-xl border border-border bg-surface text-muted-foreground shadow-lg lg:hidden"
            >
                <Menu className="size-5" />
            </button>
            {movilAbierta && <button aria-label="Cerrar navegación" onClick={() => setMovilAbierta(false)} className="fixed inset-0 z-40 bg-black/60 lg:hidden" />}
            <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-[#0d1521] transition-all duration-300 ${colapsada ? "w-20" : "w-64"} ${movilAbierta ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
                <div className={`flex h-28 items-center ${colapsada ? "justify-center" : "gap-3 px-5"}`}>
                    <div className="grid size-16 shrink-0 place-items-center rounded-full border border-cyan/50 bg-cyan/10 text-cyan shadow-[0_0_22px_-5px_var(--cyan)]">
                        <Image src={IMAGENES.logo} alt="AERION" width={56} height={56} className="size-14 object-contain" />
                    </div>
                    {!colapsada && <div><p className="font-display text-xl font-bold tracking-[0.2em] text-foreground">AERION</p><p className="font-mono text-[0.6rem] tracking-[0.3em] text-muted-foreground">OPS CENTER</p></div>}
                </div>
                <nav className="space-y-2 px-2" aria-label="Navegación principal">
                    {ENLACES.map(({ href, label, icon: Icon }) => {
                        const activo = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
                        return <Link key={href} href={href} onClick={() => setMovilAbierta(false)} title={colapsada ? label : undefined} className={`group flex h-12 items-center gap-4 rounded-xl px-3 text-sm transition-colors ${colapsada ? "justify-center" : ""} ${activo ? "bg-primary/20 text-cyan" : "text-muted-foreground hover:bg-surface-raised hover:text-foreground"}`}>
                            <Icon className="size-5 shrink-0" />
                            {!colapsada && <span>{label}</span>}
                        </Link>;
                    })}
                </nav>
                <button type="button" onClick={() => setColapsada((value) => !value)} className={`mt-auto mb-5 flex items-center gap-3 px-4 py-3 font-mono text-[0.65rem] tracking-[0.2em] text-muted-foreground transition-colors hover:text-cyan ${colapsada ? "justify-center" : ""}`}>
                    <ChevronLeft className={`size-4 transition-transform ${colapsada ? "rotate-180" : ""}`} />
                    {!colapsada && "COLLAPSE"}
                </button>
            </aside>
        </>
    );
}
