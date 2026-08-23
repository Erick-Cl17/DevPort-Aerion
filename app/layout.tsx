import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar"; 

export const metadata: Metadata = {
    title: "AERION",
    description:
        "Gestión de revisiones, actividades y usuarios por organización, equipo, cargo y rol.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" className="dark">
            <body>
                <Navbar />
                <main className="min-h-[calc(100vh-73px)]">{children}</main>
            </body>
        </html>
    );
}
