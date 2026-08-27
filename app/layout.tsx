import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar"; 
import LanguageRuntime from "@/components/LanguageRuntime";
import AerionSidebar from "@/components/AerionSidebar";
import AerionChatbot from "@/components/AerionChatbot";

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
                <AerionChatbot />
                <main className="min-h-[calc(100vh-73px)] lg:ml-var(--sidebar-width)">{children}</main>
            </body>
        </html>
    );
}
