import { useMemo, useState } from 'react';
import AgentePanel from '../components/AgentePanel.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { ETIQUETAS_HUMANAS } from '../lib/agente.js';
import { CLASE_LABELS } from '../lib/inference.js';

const LABELS = {
    pending: 'Pendiente',
    validated: 'Validado',
    rejected: 'Rechazado',
    resample: 'Pedir nueva muestra',
    not_required: 'No requiere HITL',
};

const INBOX = [
    { id: 'pendiente', label: 'Pendiente', match: (row) => row.hitl_status === 'pending' || row.hitl_status === 'resample' },
    { id: 'validated', label: 'Validadas', match: (row) => row.hitl_status === 'validated' },
    { id: 'rejected', label: 'Rechazadas', match: (row) => row.hitl_status === 'rejected' },
    { id: 'resample', label: 'Resample', match: (row) => row.hitl_status === 'resample' },
];

export default function HitlPage({ analyses, onHitl, onCorreccion, onAgenteAccion, rol }) {
    const [inbox, setInbox] = useState('pendiente');
    const cola = useMemo(() => analyses.filter((row) => INBOX.find((item) => item.id === inbox)?.match(row)), [analyses, inbox]);
    const [selectedUuid, setSelectedUuid] = useState(null);
    const [etiqueta, setEtiqueta] = useState('');
    const selected = analyses.find((row) => row.uuid_local === selectedUuid) || cola[0] || null;

    return (
        <section>
            <PageHeader mode="hitl" kicker="Revisión técnica" title="Bandeja HITL + asistente">
                <p className="mt-2 max-w-2xl text-sm text-navy/60">
                    El técnico explica el resultado, pide otra foto o cita el catálogo. Esto no reemplaza al ONNX ni entrena la CNN en el celular.
                </p>
            </PageHeader>
            <div className="mb-5 flex flex-wrap gap-2">
                {INBOX.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setInbox(item.id)}
                        className={`app-chip ${inbox === item.id ? 'is-on' : ''}`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
            <div className="mt-2 grid gap-5 xl:grid-cols-[1.05fr_.95fr] xl:items-start">
                <div className="grid gap-4">
                    {cola.length === 0 ? (
                        <div className="app-empty rounded-3xl bg-white">
                            <p>No hay casos en esta bandeja.</p>
                        </div>
                    ) : (
                        cola.map((row) => (
                            <article
                                key={row.uuid_local}
                                className={`rounded-3xl bg-white p-5 ${selected?.uuid_local === row.uuid_local ? 'ring-2 ring-teal' : ''}`}
                            >
                                <button type="button" className="flex w-full flex-wrap items-start gap-4 text-left" onClick={() => setSelectedUuid(row.uuid_local)}>
                                    {row.image_base64 ? (
                                        <img src={row.image_base64} alt="" className="h-20 w-20 rounded-2xl object-cover" />
                                    ) : null}
                                    <div className="min-w-0 flex-1">
                                        <p className="font-extrabold text-navy">{row.disease_detected}</p>
                                        <p className="text-sm text-navy/55">
                                            Confianza {row.confianza}% · Severidad {row.severidad == null ? 'N/D' : `${row.severidad}%`} · {row.location || 'Sin parcela'}
                                        </p>
                                        <p className="mt-1 text-xs text-navy/40">HITL: {LABELS[row.hitl_status] || row.hitl_status}</p>
                                        {row.etiqueta_humana ? (
                                            <p className="mt-1 text-xs font-semibold text-teal">
                                                Corrección humana: {CLASE_LABELS[row.etiqueta_humana] || row.etiqueta_humana} (cola laboratorio)
                                            </p>
                                        ) : null}
                                        {row.clase === 'no_concluyente' ? (
                                            <p className="mt-2 text-sm font-semibold text-navy">El sistema no afirma diagnóstico. Pide otra foto con mejor luz.</p>
                                        ) : null}
                                    </div>
                                </button>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button type="button" onClick={() => onHitl(row.uuid_local, 'validated')} className="min-h-11 rounded-full bg-teal px-4 py-2 text-xs font-extrabold text-white">
                                        Validar
                                    </button>
                                    <button type="button" onClick={() => onHitl(row.uuid_local, 'rejected')} className="min-h-11 rounded-full bg-rose-500 px-4 py-2 text-xs font-extrabold text-white">
                                        Rechazar
                                    </button>
                                    <button type="button" onClick={() => onHitl(row.uuid_local, 'resample')} className="min-h-11 rounded-full bg-gold px-4 py-2 text-xs font-extrabold text-navy">
                                        Pedir nueva muestra
                                    </button>
                                    <button type="button" onClick={() => setSelectedUuid(row.uuid_local)} className="min-h-11 rounded-full bg-sky px-4 py-2 text-xs font-extrabold text-navy">
                                        Consultar asistente
                                    </button>
                                </div>
                            </article>
                        ))
                    )}
                    {selected ? (
                        <div className="rounded-3xl bg-white p-5">
                            <p className="text-xs font-extrabold uppercase tracking-wider text-teal">Aportar corrección</p>
                            <p className="mt-1 text-sm text-navy/60">Etiqueta humana para dataset de laboratorio. No entrena la CNN aquí.</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <select
                                    value={etiqueta}
                                    onChange={(event) => setEtiqueta(event.target.value)}
                                    className="min-h-11 rounded-full bg-sky px-4 py-2 text-sm font-semibold text-navy"
                                    aria-label="Etiqueta humana"
                                >
                                    <option value="">Etiqueta humana</option>
                                    {ETIQUETAS_HUMANAS.map((key) => (
                                        <option key={key} value={key}>
                                            {CLASE_LABELS[key]}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    disabled={!etiqueta}
                                    onClick={() => {
                                        onCorreccion(selected.uuid_local, etiqueta);
                                        setEtiqueta('');
                                    }}
                                    className="min-h-11 rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-white disabled:opacity-40"
                                >
                                    Guardar en cola laboratorio
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
                <AgentePanel rol={rol} diagnostico={selected} onAccion={onAgenteAccion} />
            </div>
        </section>
    );
}
