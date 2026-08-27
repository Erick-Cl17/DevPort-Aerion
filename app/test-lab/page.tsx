import { obtenerAstronautas, obtenerPosicionISS } from "@/lib/opennotify";

export default async function TestLabPage() {
	const [{ data: posicion, error: errorPosicion }, { data: astronautas, error: errorAstronautas }] = await Promise.all([
		obtenerPosicionISS(),
		obtenerAstronautas(),
	]);

	return (
		<section className="min-h-[calc(100vh-73px)] bg-background px-6 py-10">
			<div className="mx-auto max-w-6xl space-y-8">
				<header>
					<p className="label-mono">Laboratorio de APIs</p>
					<h1 className="mt-1 font-display text-3xl font-bold text-foreground">Datos en tiempo real con Open Notify</h1>
					<p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
						Consulta pública de la posición de la Estación Espacial Internacional y de las personas que se encuentran actualmente en el espacio.
					</p>
				</header>

				<div className="grid gap-5 lg:grid-cols-2">
					<article className="panel p-6">
						<p className="label-mono">Posición ISS</p>
						<h2 className="mt-2 font-display text-xl font-bold text-foreground">Estación Espacial Internacional</h2>
						{posicion ? (
							<dl className="mt-6 grid grid-cols-2 gap-4">
								<Dato etiqueta="Latitud" valor={`${posicion.latitud.toFixed(4)}°`} />
								<Dato etiqueta="Longitud" valor={`${posicion.longitud.toFixed(4)}°`} />
								<Dato etiqueta="Actualizado" valor={new Date(posicion.timestamp * 1000).toLocaleString("es-EC")} />
							</dl>
						) : (
							<p className="mt-6 rounded-lg border border-critical/40 bg-critical/10 px-4 py-3 text-sm text-critical">{errorPosicion}</p>
						)}
					</article>

					<article className="panel p-6">
						<p className="label-mono">Personas en el espacio</p>
						<h2 className="mt-2 font-display text-xl font-bold text-foreground">Tripulación actual</h2>
						{astronautas ? (
							<>
								<p className="mt-5 font-display text-4xl font-bold text-cyan">{astronautas.numero}</p>
								<ul className="mt-4 space-y-2 text-sm text-foreground">
									{astronautas.nombres.map((nombre) => <li key={nombre} className="border-b border-border pb-2">{nombre}</li>)}
								</ul>
							</>
						) : (
							<p className="mt-6 rounded-lg border border-critical/40 bg-critical/10 px-4 py-3 text-sm text-critical">{errorAstronautas}</p>
						)}
					</article>
				</div>

				<p className="text-xs text-muted-foreground">Fuente: Open Notify. La información puede no estar disponible si el servicio externo no responde.</p>
			</div>
		</section>
	);
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
	return <div><dt className="label-mono">{etiqueta}</dt><dd className="mt-1 text-sm text-foreground">{valor}</dd></div>;
}