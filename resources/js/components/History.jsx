import { useEffect, useMemo, useState } from 'react';
import { formatDateTime } from '../lib/risk.js';
import { HISTORY_CHIPS } from '../lib/nav.js';
import PageHeader from './PageHeader.jsx';

export default function History({ analyses, filter: filterProp, onFilterChange, onRepeat, staff, onHitl, query }) {
    const [selected, setSelected] = useState(null);
    const [localFilter, setLocalFilter] = useState('all');
    const filter = filterProp ?? localFilter;
    const changeFilter = onFilterChange || setLocalFilter;

    const rows = useMemo(() => {
        if (filter === 'all') {
            return analyses;
        }

        if (filter === 'pending' || filter === 'error' || filter === 'confirmed') {
            return analyses.filter((analysis) => analysis.sync_status === filter);
        }

        if (filter === 'hitl') {
            return analyses.filter((analysis) => analysis.hitl_status === 'pending' || analysis.hitl_status === 'resample');
        }

        return analyses.filter((analysis) => analysis.clase === filter);
    }, [analyses, filter]);

    useEffect(() => {
        if (selected && !rows.some((row) => row.uuid_local === selected)) {
            setSelected(null);
        }
    }, [rows, selected]);

    return (
        <section aria-labelledby="history-title">
            <PageHeader mode="historial" kicker="Cola y sync" title="Historial">
                <p className="mt-2 max-w-2xl text-sm text-navy/60">
                    Cada ficha muestra clase, confianza y severidad por separado. Toca una fila para el detalle.
                </p>
            </PageHeader>

            <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Filtrar historial">
                {HISTORY_CHIPS.map((chip) => (
                    <button
                        key={chip.id}
                        type="button"
                        role="tab"
                        aria-selected={filter === chip.id}
                        onClick={() => changeFilter(chip.id)}
                        className={`app-chip ${filter === chip.id ? 'is-on' : ''}`}
                    >
                        {chip.label}
                    </button>
                ))}
            </div>

            <div className="divide-y divide-sky rounded-3xl bg-white px-4">
                {rows.length === 0 ? (
                    <div className="app-empty">
                        <p>
                            {query
                                ? 'No hay coincidencias. Prueba otro lote, clase o UUID.'
                                : filter === 'all'
                                  ? 'Aún no hay inspecciones registradas.'
                                  : 'No hay inspecciones con este filtro.'}
                        </p>
                        {onRepeat ? (
                            <button type="button" onClick={onRepeat} className="mt-4 min-h-11 rounded-full bg-gold px-5 py-2 text-sm font-extrabold text-navy">
                                Nueva captura
                            </button>
                        ) : null}
                        {query ? (
                            <button type="button" onClick={() => changeFilter('all')} className="mt-2 block w-full text-sm font-bold text-teal">
                                Limpiar búsqueda y filtro
                            </button>
                        ) : null}
                    </div>
                ) : (
                    rows.map((analysis) => {
                        const open = selected === analysis.uuid_local;
                        return (
                            <article key={analysis.uuid_local || analysis.id}>
                                <button
                                    type="button"
                                    onClick={() => setSelected(open ? null : analysis.uuid_local)}
                                    className="flex w-full flex-wrap items-center gap-4 py-4 text-left transition hover:bg-sky/40"
                                >
                                    <img
                                        src={analysis.image_base64}
                                        alt=""
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                    <div className="min-w-[10rem] flex-1">
                                        <p className="font-bold text-navy">{analysis.disease_detected}</p>
                                        <p className="text-xs text-navy/40">{analysis.location || 'Sin ubicación'}</p>
                                    </div>
                                    <span className="text-xs font-bold text-navy">C {analysis.confianza ?? '—'}%</span>
                                    <span className="text-xs font-bold text-navy">S {analysis.severidad == null ? 'N/D' : `${analysis.severidad}%`}</span>
                                    <span className="rounded-full bg-sky px-2 py-1 text-[10px] font-semibold uppercase text-navy/50">
                                        {analysis.sync_status || 'pending'}
                                    </span>
                                    <span className="text-xs text-navy/40">{formatDateTime(analysis.created_at)}</span>
                                </button>
                                {open ? (
                                    <div className="mb-4 rounded-2xl bg-sky/70 p-4">
                                        <p className="text-xs font-extrabold uppercase tracking-wider text-teal">Detalle · 3 capas</p>
                                        <p className="mt-2 text-sm text-navy/70">
                                            UUID {analysis.uuid_local} · modelo {analysis.modelo_version || '—'} · HITL {analysis.hitl_status || '—'}
                                        </p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {onRepeat ? (
                                                <button type="button" onClick={onRepeat} className="min-h-11 rounded-full bg-gold px-4 py-2 text-xs font-extrabold text-navy">
                                                    Repetir captura
                                                </button>
                                            ) : null}
                                            {staff ? (
                                                <>
                                                    <button type="button" onClick={() => onHitl(analysis.uuid_local, 'validated')} className="min-h-11 rounded-full bg-teal px-4 py-2 text-xs font-extrabold text-white">
                                                        Validar
                                                    </button>
                                                    <button type="button" onClick={() => onHitl(analysis.uuid_local, 'rejected')} className="min-h-11 rounded-full bg-rose-500 px-4 py-2 text-xs font-extrabold text-white">
                                                        Rechazar
                                                    </button>
                                                    <button type="button" onClick={() => onHitl(analysis.uuid_local, 'resample')} className="min-h-11 rounded-full bg-sky px-4 py-2 text-xs font-extrabold text-navy">
                                                        Nueva muestra
                                                    </button>
                                                </>
                                            ) : null}
                                        </div>
                                    </div>
                                ) : null}
                            </article>
                        );
                    })
                )}
            </div>
        </section>
    );
}
