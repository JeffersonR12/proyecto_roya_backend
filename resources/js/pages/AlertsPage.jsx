import PageHeader from '../components/PageHeader.jsx';

export default function AlertsPage({ alertas, staff, onOpen, onCapture }) {
    return (
        <section>
            <PageHeader mode="alertas" kicker="Alertas de brote y cola" title="Alertas">
                <p className="mt-2 max-w-2xl text-sm text-navy/60">
                    Solo Roya afirmada (confianza ≥ 75 %), cola offline e HITL. Nunca se alerta “hay Roya” si el modelo no afirma.
                </p>
            </PageHeader>
            <div className="mt-2 divide-y divide-sky rounded-3xl bg-white">
                {alertas.length === 0 ? (
                    <div className="app-empty">
                        <p>No hay brotes afirmados. El modelo no inventa Roya.</p>
                        <button type="button" onClick={onCapture} className="mt-4 min-h-11 rounded-full bg-gold px-5 py-2 text-sm font-extrabold text-navy">
                            Nueva captura
                        </button>
                    </div>
                ) : (
                    alertas.map((alerta) => (
                        <button
                            key={alerta.id}
                            type="button"
                            onClick={() => onOpen?.(alerta)}
                            className="flex min-h-11 w-full flex-col items-start gap-1 px-5 py-4 text-left transition hover:bg-sky/50"
                        >
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal">{alerta.tipo}</span>
                            <span className="font-bold text-navy">{alerta.titulo}</span>
                            <span className="text-sm text-navy/55">{alerta.detalle}</span>
                            {staff && alerta.tipo === 'hitl' ? (
                                <span className="text-xs font-bold text-gold">Cola HITL</span>
                            ) : null}
                        </button>
                    ))
                )}
            </div>
        </section>
    );
}
