import SimuladoresGrid from "@/components/SimuladoresGrid";
import { SIMULADORES } from "@/lib/simuladores";

export default function SimuladoresPage() {
    return (
        <section className="min-h-[calc(100vh-73px)] px-6 py-12 grid-field">
            <div className="max-w-5xl mx-auto">
                <h1 className="font-display text-3xl font-bold text-foreground text-center mb-3">
                    Simuladores AERION
                </h1>
                <p className="text-muted-foreground text-center mb-10">
                    Selecciona una categoría para consultar su simulador.
                </p>
                <SimuladoresGrid simuladores={SIMULADORES} />
            </div>
        </section>
    );
}