import { useMemo, useState } from 'react';
import { CATALOGO, protocoloPara } from '../lib/catalogo.js';
import AgentePanel from '../components/AgentePanel.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { roleName } from '../lib/roles.js';

export default function ProtocolPage({ analyses, staff, user, onAgenteAccion }) {
    const latest = analyses[0];
    const [clase, setClase] = useState(latest?.clase || 'roya_amarilla');
    const seleccionado = analyses.find((row) => row.clase === clase) || latest || { clase, confianza: 80, severidad: null, hitl_status: 'pending' };
    const proto = useMemo(
        () =>
            protocoloPara({
                clase: seleccionado.clase || clase,
                confianza: seleccionado.confianza,
                severidad: seleccionado.severidad,
                hitl_status: seleccionado.hitl_status,
            }),
        [seleccionado, clase],
    );

    return (
        <section>
            <PageHeader mode="protocolo" kicker="Catálogo fitosanitario" title="Protocolo de mitigación">
                <p className="mt-2 max-w-2xl text-sm text-navy/60">
                    Prácticas culturales y umbral por severidad foliar. El CNN no vende fungicidas. El técnico valida antes de aplicar.
                </p>
            </PageHeader>

            <div className="mt-5 flex flex-wrap gap-2">
                {Object.keys(CATALOGO).map((key) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setClase(key)}
                        className={`app-chip ${clase === key ? 'is-on' : ''}`}
                    >
                        {CATALOGO[key].nombre}
                    </button>
                ))}
            </div>

            <article className="mt-6 rounded-3xl bg-white p-6">
                <p className="text-xs font-extrabold uppercase tracking-wider text-teal">{proto.ficha.codigo}</p>
                <h2 className="mt-1 text-2xl font-extrabold text-navy">{proto.ficha.nombre}</h2>
                <p className="mt-1 text-sm text-navy/55">{proto.ficha.agente_causal}</p>
                <p className="mt-4 text-sm leading-6 text-navy/70">{proto.ficha.sintomas}</p>
                {proto.ficha.condiciones ? (
                    <p className="mt-2 text-sm leading-6 text-navy/70">
                        <span className="font-extrabold text-navy">Condiciones: </span>
                        {proto.ficha.condiciones}
                    </p>
                ) : null}
                <h3 className="mt-5 text-sm font-extrabold text-navy">Practicas culturales</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-navy/70">
                    {proto.ficha.practicas.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
                {proto.ficha.fuente ? <p className="mt-3 text-xs text-navy/45">Fuente: {proto.ficha.fuente}</p> : null}
                <p className="mt-5 rounded-2xl bg-sky px-4 py-3 text-sm font-semibold text-navy">{proto.cuandoTratar}</p>
                {proto.avisoHitl ? <p className="mt-3 text-sm font-semibold text-rose-600">{proto.avisoHitl}</p> : null}
                <button
                    type="button"
                    disabled={!proto.puedeActivarProtocolo}
                    className="mt-5 min-h-11 rounded-full bg-gold px-5 py-3 text-sm font-extrabold text-navy disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {proto.puedeActivarProtocolo ? 'Protocolo validado por el tecnico' : 'Bloqueado hasta validacion HITL'}
                </button>
                {!staff ? <p className="mt-3 text-xs text-navy/45">El agricultor consulta. Solo el tecnico/admin valida.</p> : null}
            </article>

            <div className="mt-6">
                <AgentePanel
                    rol={roleName(user)}
                    diagnostico={seleccionado.uuid_local ? seleccionado : null}
                    onAccion={onAgenteAccion}
                />
            </div>
        </section>
    );
}
