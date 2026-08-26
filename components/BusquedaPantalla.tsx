import { Search } from "lucide-react";

export default function BusquedaPantalla({ placeholder, value = "" }: { placeholder: string; value?: string }) {
    return (
        <form method="get" className="relative mb-5">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input name="q" defaultValue={value} placeholder={placeholder} aria-label={placeholder} className="h-11 w-full rounded-xl border border-border bg-surface/70 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-cyan/60" />
        </form>
    );
}
