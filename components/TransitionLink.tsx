"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

// Envuelve un enlace normal para que, al hacer clic, se vea un barrido de
// luz cubriendo la pantalla antes de navegar — en vez de un salto seco a
// la siguiente página. La navegación real sigue siendo una ruta normal de
// Next.js (router.push), esto solo agrega el efecto visual de por medio.
export default function TransitionLink({
    href,
    children,
    className,
    glowColor = "var(--primary)",
}: {
    href: string;
    children: ReactNode;
    className?: string;
    glowColor?: string;
}) {
    const router = useRouter();
    const [saliendo, setSaliendo] = useState(false);

    function handleClick(e: React.MouseEvent) {
        e.preventDefault();
        if (saliendo) return;
        setSaliendo(true);
        window.setTimeout(() => {
            router.push(href);
        }, 380);
    }

    return (
        <>
            <a href={href} onClick={handleClick} className={className}>
                {children}
            </a>
            {saliendo && (
                <div
                    aria-hidden
                    className="fixed inset-0 z-100 pointer-events-none flex items-center justify-center"
                >
                    <div
                        className="h-40 w-40 rounded-full blur-3xl animate-sweep-in"
                        style={{ backgroundColor: glowColor }}
                    />
                </div>
            )}
        </>
    );
}
