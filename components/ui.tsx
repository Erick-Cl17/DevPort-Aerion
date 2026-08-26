"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

/** Ventana flotante con brillo, reutilizada en toda la app para detalles,
 * edición, confirmaciones de borrado, etc. */
export function Modal({
    open,
    onClose,
    kicker,
    title,
    children,
    footer,
    wide = false,
}: {
    open: boolean;
    onClose: () => void;
    kicker?: string;
    title: string;
    children?: ReactNode;
    footer?: ReactNode;
    wide?: boolean;
}) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
            <button
                type="button"
                aria-label="Cerrar"
                onClick={onClose}
                className="fixed inset-0 bg-background/80 backdrop-blur-md"
            />
            <div
                role="dialog"
                aria-modal="true"
                className={`panel edge-scan corner-ticks animate-rise relative my-auto w-full ${wide ? "max-w-3xl" : "max-w-xl"} p-6`}
            >
                <span className="pointer-events-none absolute inset-0 grid-field rounded-[inherit] opacity-40" aria-hidden />
                <div className="relative flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        {kicker && <p className="label-mono">{kicker}</p>}
                        <h2 className="mt-1 font-display text-xl font-bold tracking-tight">{title}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar ventana"
                        className="grid size-9 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-critical/60 hover:text-critical"
                    >
                        <X className="size-4" />
                    </button>
                </div>
                <div className="relative mt-5">{children}</div>
                {footer && <div className="relative mt-6 flex flex-wrap items-center gap-2">{footer}</div>}
            </div>
        </div>
    );
}

export function Panel({
    children,
    className = "",
    scan = false,
    ticks = false,
}: {
    children: ReactNode;
    className?: string;
    scan?: boolean;
    ticks?: boolean;
}) {
    return (
        <section className={`panel ${scan ? "edge-scan" : ""} ${ticks ? "corner-ticks" : ""} ${className}`}>
            {children}
        </section>
    );
}

export function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
    return (
        <div className="mb-4 flex items-end justify-between gap-4">
            <div className="min-w-0">
                <p className="label-mono">{kicker}</p>
                <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
            </div>
            <span className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
        </div>
    );
}

const TONOS: Record<string, string> = {
    primary: "text-primary",
    cyan: "text-cyan",
    success: "text-success",
    warning: "text-warning",
    critical: "text-critical",
    muted: "text-muted-foreground",
};

export function Badge({ children, tono = "muted" }: { children: ReactNode; tono?: string }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/80 px-2.5 py-1 font-mono text-[0.65rem] tracking-[0.14em] uppercase ${TONOS[tono] ?? TONOS.muted}`}
        >
            <span className="size-1.5 rounded-full bg-current" />
            {children}
        </span>
    );
}

export function KpiCard({
    label,
    value,
    delta,
    tono = "primary",
    icon,
}: {
    label: string;
    value: string | number;
    delta?: string;
    tono?: string;
    icon?: ReactNode;
}) {
    return (
        <article className="group circuit-frame lift p-5">
            <div className="flex items-start justify-between gap-3">
                <p className="label-mono">{label}</p>
                {icon && (
                    <span className="text-muted-foreground transition-transform duration-300 group-hover:scale-90">
                        {icon}
                    </span>
                )}
            </div>
            <p className="mt-3 font-display text-4xl font-bold tracking-tight transition-colors group-hover:text-cyan">
                {value}
            </p>
            {delta && <p className={`mt-2 text-xs ${TONOS[tono] ?? TONOS.muted}`}>{delta}</p>}
            <span className="mt-4 block h-px w-full bg-gradient-to-r from-primary/60 via-cyan/40 to-transparent" />
        </article>
    );
}

export function Meter({ label, value, tono = "primary" }: { label: string; value: number; tono?: string }) {
    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-mono">{value}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                    className={`h-full rounded-full ${
                        tono === "critical"
                            ? "bg-critical"
                            : tono === "warning"
                              ? "bg-warning"
                              : tono === "success"
                                ? "bg-success"
                                : "bg-gradient-to-r from-primary to-cyan"
                    }`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}
