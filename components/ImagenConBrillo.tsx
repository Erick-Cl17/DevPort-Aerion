import Image from "next/image";

export default function ImagenConBrillo({
    src,
    alt,
    glowColor = "var(--primary)",
    className = "h-24 w-24",
}: {
    src: string;
    alt: string;
    glowColor?: string;
    className?: string;
}) {
    if (!src) {
        return (
            <div
                className={`relative ${className} rounded-2xl border border-dashed border-border-strong bg-secondary/40 flex items-center justify-center`}
            >
                <span className="text-[10px] text-muted-foreground px-2 text-center leading-tight">
                    {alt}
                </span>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            <div
                aria-hidden
                className="absolute inset-0 rounded-full blur-lg opacity-30 animate-glow-pulse pointer-events-none -z-10"
                style={{ backgroundColor: glowColor }}
            />
            <Image
                src={src}
                alt={alt}
                fill
                sizes="(max-width: 640px) 80px, 96px"
                className="z-10 h-full w-full object-contain rounded-xl"
            />
        </div>
    );
}
