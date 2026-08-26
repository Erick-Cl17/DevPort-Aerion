import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar"; 
import LanguageRuntime from "@/components/LanguageRuntime";
import AerionSidebar from "@/components/AerionSidebar";

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
                <AerionSidebar />
                <Navbar />
                <LanguageRuntime />
                <main className="min-h-[calc(100vh-73px)] lg:ml-64">{children}</main>
            </body>
        </html>
    );
}
