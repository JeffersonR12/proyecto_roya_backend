import { useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { listParcelas, mergeParcelasFromAnalyses, removeParcela, upsertParcela } from '../lib/parcelasStore.js';

export default function ParcelasPage({ analyses, onInspect }) {
    const [tick, setTick] = useState(0);
    const [form, setForm] = useState({ nombre: '', ubicacion: '', notas: '' });
    const [error, setError] = useState('');
    const [confirmId, setConfirmId] = useState('');

    const grupos = useMemo(() => mergeParcelasFromAnalyses(analyses), [analyses, tick]);

    const refresh = () => setTick((value) => value + 1);

    const submit = (event) => {
        event.preventDefault();
        try {
            upsertParcela(form);
            setForm({ nombre: '', ubicacion: '', notas: '' });
            setError('');
            refresh();
        } catch (err) {
            setError(err.message || 'No se pudo guardar el lote.');
        }
    };

    return (
        <section>
            <PageHeader mode="parcelas" kicker="Lotes" title="Parcelas">
                <p className="mt-2 max-w-2xl text-sm text-navy/60">Crea lotes del tenant y lanza una inspección sin perder el nombre.</p>
            </PageHeader>

            <form onSubmit={submit} className="mb-6 grid gap-3 rounded-3xl bg-white p-5 md:grid-cols-3">
                <div>
                    <label htmlFor="parcela-nombre" className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-navy/40">
                        Nombre
                    </label>
                    <input
                        id="parcela-nombre"
                        value={form.nombre}
                        onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))}
                        className="w-full min-h-11 rounded-2xl bg-sky px-4 text-sm text-navy outline-none focus:ring-2 focus:ring-teal/30"
                        required
                    />
                    {error ? <p className="mt-1 text-xs font-semibold text-rose-600">{error}</p> : null}
                </div>
                <div>
                    <label htmlFor="parcela-ubicacion" className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-navy/40">
                        Ubicación
                    </label>
                    <input
                        id="parcela-ubicacion"
                        value={form.ubicacion}
                        onChange={(event) => setForm((current) => ({ ...current, ubicacion: event.target.value }))}
                        className="w-full min-h-11 rounded-2xl bg-sky px-4 text-sm text-navy outline-none focus:ring-2 focus:ring-teal/30"
                    />
                </div>
                <div>
                    <label htmlFor="parcela-notas" className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-navy/40">
                        Notas
                    </label>
                    <input
                        id="parcela-notas"
                        value={form.notas}
                        onChange={(event) => setForm((current) => ({ ...current, notas: event.target.value }))}
                        className="w-full min-h-11 rounded-2xl bg-sky px-4 text-sm text-navy outline-none focus:ring-2 focus:ring-teal/30"
                    />
                </div>
                <button type="submit" className="min-h-11 rounded-full bg-teal px-5 text-sm font-extrabold text-white md:col-span-3">
                    Guardar lote
                </button>
            </form>

            <div className="grid gap-4 md:grid-cols-2">
                {grupos.length === 0 ? (
                    <div className="app-empty rounded-3xl bg-white md:col-span-2">
                        <p>Aún no hay parcelas. Crea un lote o anótalo al escanear en Campo.</p>
                    </div>
                ) : (
                    grupos.map((grupo) => {
                        const last = grupo.rows?.[0];
                        const stored = listParcelas().find((row) => row.nombre === grupo.nombre);
                        return (
                            <article key={grupo.nombre} className="rounded-3xl bg-white p-5">
                                <h2 className="text-lg font-extrabold text-navy">{grupo.nombre}</h2>
                                <p className="mt-1 text-sm text-navy/55">{stored?.ubicacion || grupo.ubicacion || 'Sin vereda'}</p>
                                <p className="mt-1 text-sm text-navy/55">
                                    GPS:{' '}
                                    {grupo.latitud != null
                                        ? `${Number(grupo.latitud).toFixed(5)}, ${Number(grupo.longitud).toFixed(5)}`
                                        : 'sin coordenada'}
                                </p>
                                <p className="mt-3 text-sm">
                                    Última inspección:{' '}
                                    {last ? (
                                        <>
                                            <strong>{last.disease_detected}</strong> · C {last.confianza}% · S{' '}
                                            {last.severidad == null ? 'N/D' : `${last.severidad}%`}
                                        </>
                                    ) : (
                                        'sin capturas'
                                    )}
                                </p>
                                <p className="mt-1 text-xs uppercase text-navy/40">sync {last?.sync_status || '—'}</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onInspect(grupo.nombre)}
                                        className="min-h-11 rounded-full bg-gold px-4 py-2 text-xs font-extrabold text-navy"
                                    >
                                        Inspeccionar este lote
                                    </button>
                                    {stored ? (
                                        confirmId === stored.id ? (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        removeParcela(stored.id);
                                                        setConfirmId('');
                                                        refresh();
                                                    }}
                                                    className="min-h-11 rounded-full bg-rose-500 px-4 py-2 text-xs font-extrabold text-white"
                                                >
                                                    Confirmar baja
                                                </button>
                                                <button type="button" onClick={() => setConfirmId('')} className="min-h-11 rounded-full bg-sky px-4 py-2 text-xs font-extrabold text-navy">
                                                    Cancelar
                                                </button>
                                            </>
                                        ) : (
                                            <button type="button" onClick={() => setConfirmId(stored.id)} className="min-h-11 rounded-full bg-sky px-4 py-2 text-xs font-extrabold text-navy">
                                                Eliminar
                                            </button>
                                        )
                                    ) : null}
                                </div>
                            </article>
                        );
                    })
                )}
            </div>
        </section>
    );
}
