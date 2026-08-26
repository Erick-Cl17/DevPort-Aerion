"use client";

import Link from "next/link";
import type { ReactNode } from "react";

// Envuelve un enlace normal para que, al hacer clic, se vea un barrido de
// luz cubriendo la pantalla antes de navegar 
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
    return (
        <Link href={href} prefetch className={className} data-glow-color={glowColor}>
            {children}
        </Link>
    );
}
