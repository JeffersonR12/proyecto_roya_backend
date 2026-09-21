import { useMemo, useState } from 'react';
import { formatDateTime, getRiskLevel, getRiskMeta, percent } from '../lib/risk.js';

export default function History({ analyses }) {
    const [filter, setFilter] = useState('all');

    const rows = useMemo(() => {
        if (filter === 'all') {
            return analyses;
        }

        return analyses.filter((analysis) => getRiskLevel(analysis.confidence) === filter);
    }, [analyses, filter]);

    return (
        <section aria-labelledby="history-title" className="mt-10">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <h2 id="history-title" className="text-xl font-extrabold text-navy">Historial de inspecciones</h2>
                <select
                    id="risk-filter"
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    className="rounded-full bg-sky px-4 py-2 text-xs font-semibold text-navy outline-none"
                    aria-label="Filtrar riesgo"
                >
                    <option value="all">Todos</option>
                    <option value="critical">Critico</option>
                    <option value="medium">Alerta media</option>
                    <option value="healthy">Bajo riesgo / sano</option>
                </select>
            </div>
            <div className="divide-y divide-sky">
                {rows.length === 0 ? (
                    <p className="py-12 text-center text-sm text-navy/40">Aun no hay inspecciones registradas.</p>
                ) : (
                    rows.map((analysis) => {
                        const meta = getRiskMeta(getRiskLevel(analysis.confidence));

                        return (
                            <article key={analysis.id} className="flex flex-wrap items-center gap-4 py-4">
                                <img
                                    src={analysis.image_base64}
                                    alt={`Captura de ${analysis.disease_detected}`}
                                    className="h-12 w-12 rounded-full object-cover"
                                />
                                <div className="min-w-[10rem] flex-1">
                                    <p className="font-bold text-navy">{analysis.disease_detected}</p>
                                    <p className="text-xs text-navy/40">{analysis.location || 'Sin ubicacion'}</p>
                                </div>
                                <span className={`text-sm font-bold ${meta.textClass}`}>{meta.label}</span>
                                <span className="font-extrabold text-navy">{percent(analysis.confidence, 0)}</span>
                                <span className="text-xs text-navy/40">{formatDateTime(analysis.created_at)}</span>
                            </article>
                        );
                    })
                )}
            </div>
        </section>
    );
}
