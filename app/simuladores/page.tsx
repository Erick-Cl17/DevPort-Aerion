import SimuladoresGrid from "@/components/SimuladoresGrid";
import { SIMULADORES } from "@/lib/simuladores";

export default function SimuladoresPage() {
    return <section className="min-h-[calc(100vh-73px)] bg-background px-6 py-10"><div className="mx-auto max-w-6xl"><p className="label-mono">Simuladores</p><h1 className="mt-1 mb-6 font-display text-3xl font-bold text-foreground">Centro de simulaciones</h1><SimuladoresGrid simuladores={SIMULADORES} /></div></section>;
}
