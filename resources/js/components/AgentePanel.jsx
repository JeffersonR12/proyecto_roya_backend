import { useEffect, useRef, useState } from 'react';
import { consultarAgente, AGENTE_VERSION } from '../lib/agente.js';
import { CLASE_LABELS } from '../lib/inference.js';

const WELCOME =
    'Soy el asistente HITL de RiwiScan. Explico clase, confianza y severidad, cito el catalogo y pido otra muestra. No diagnostico fotos (eso lo hace ONNX en Campo) ni entreno la CNN.';

const CHIPS = {
    staff: ['Explica este resultado', 'Cuando tratar segun severidad', 'Pedir otra foto', 'Citar catalogo Roya Amarilla'],
    farmer: ['Sintomas de Roya Amarilla', 'Guia de captura', 'Cuando tratar segun severidad'],
};

export default function AgentePanel({ rol = 'agricultor', diagnostico = null, onAccion }) {
    const staff = rol === 'tecnico' || rol === 'administrador';
    const chips = staff ? CHIPS.staff : CHIPS.farmer;
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([{ role: 'agente', texto: WELCOME, citas: [], acciones: [] }]);
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages]);

    const send = (pregunta) => {
        const text = String(pregunta || '').trim();

        if (!text) {
            return;
        }

        const reply = consultarAgente({ pregunta: text, diagnostico, rol });
        setMessages((current) => [...current, { role: 'user', texto: text }, { role: 'agente', ...reply }]);
        setInput('');
    };

    const label = diagnostico ? CLASE_LABELS[diagnostico.clase] || diagnostico.clase : null;

    return (
        <aside className="flex min-h-[28rem] flex-col rounded-3xl bg-white p-5">
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-teal">Asistente HITL</p>
            <h2 className="mt-1 text-lg font-extrabold text-navy">Consulta el catalogo, no la foto</h2>
            <p className="mt-1 text-xs text-navy/45">
                RAG local · {AGENTE_VERSION}
                {label ? ` · Caso: ${label} · confianza ${diagnostico.confianza}%` : ' · Sin caso seleccionado'}
            </p>
            <div className="mt-4 max-h-72 flex-1 space-y-3 overflow-y-auto pr-1">
                {messages.map((msg, index) => (
                    <div key={`${msg.role}-${index}`} className={msg.role === 'user' ? 'ml-8 rounded-2xl bg-primary px-3 py-2 text-sm text-white' : 'mr-4 rounded-2xl bg-sky px-3 py-2 text-sm leading-6 text-navy'}>
                        <p>{msg.texto}</p>
                        {msg.citas?.length ? (
                            <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-teal">
                                Citas: {msg.citas.map((cita) => `${cita.codigo} ${cita.nombre}`).join(' · ')}
                            </p>
                        ) : null}
                        {msg.acciones?.length ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {msg.acciones.map((accion) => (
                                    <button
                                        key={accion.id}
                                        type="button"
                                        onClick={() => onAccion?.(accion.id, diagnostico)}
                                        className="rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-navy"
                                    >
                                        {accion.label}
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>
                ))}
                <div ref={endRef} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
                {chips.map((chip) => (
                    <button
                        key={chip}
                        type="button"
                        onClick={() => send(chip)}
                        className="rounded-full bg-sky px-3 py-1.5 text-[11px] font-bold text-navy"
                    >
                        {chip}
                    </button>
                ))}
            </div>
            <form
                className="mt-3 flex gap-2"
                onSubmit={(event) => {
                    event.preventDefault();
                    send(input);
                }}
            >
                <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    className="flex-1 rounded-full bg-sky px-4 py-2 text-sm text-navy outline-none"
                    placeholder="Pregunta al catalogo (nunca a la foto)"
                    aria-label="Consulta al asistente"
                />
                <button type="submit" className="rounded-full bg-teal px-4 py-2 text-xs font-extrabold text-white">
                    Preguntar
                </button>
            </form>
        </aside>
    );
}
