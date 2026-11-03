import { motion, useReducedMotion } from 'framer-motion';
import { copyFor } from '../lib/fieldFlow.js';

const NIVELES = ['urgente', 'revisar', 'info'];

const ICONOS = {
    roya: '!',
    revision: '🔍',
    envio_error: '⚠️',
    envio: '☁️',
};

const list = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
};

const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

function AlertCard({ alerta, copy, onAction, reduceMotion }) {
    return (
        <motion.article variants={reduceMotion ? undefined : item} className={`alert-card is-${alerta.nivel}`}>
            <div className="alert-card-media">
                {alerta.thumb ? (
                    <>
                        <img src={alerta.thumb} alt="" className="alert-card-thumb" />
                        <span className="alert-card-icon is-mini" aria-hidden="true">
                            {ICONOS[alerta.tipo]}
                        </span>
                    </>
                ) : (
                    <span className="alert-card-icon" aria-hidden="true">
                        {ICONOS[alerta.tipo]}
                    </span>
                )}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="alert-card-title">{alerta.titulo}</h3>
                    {alerta.nuevo ? <span className="alert-new">{copy.newBadge}</span> : null}
                </div>
                {alerta.detalle ? <p className="mt-0.5 text-sm text-navy/65">{alerta.detalle}</p> : null}
                {alerta.etiqueta ? <span className="alert-tag mt-2">{alerta.etiqueta}</span> : null}
            </div>

            {alerta.accion ? (
                <button type="button" onClick={() => onAction?.(alerta)} className="alert-card-action">
                    {alerta.accionLabel}
                </button>
            ) : null}
        </motion.article>
    );
}

export default function AlertsPage({ alertas, lang = 'es', onAction, onCapture }) {
    const reduceMotion = useReducedMotion();
    const copy = copyFor(lang).alerts;
    const urgentes = alertas.filter((a) => a.nivel === 'urgente').length;
    const resumen = urgentes ? copy.needAttention(urgentes) : alertas.length ? copy.onlyInfo : copy.allGood;

    return (
        <section className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-extrabold text-navy">{copy.title}</h1>
            <p className={`mt-1 text-lg font-semibold ${urgentes ? 'text-rose-700' : 'text-teal-dark'}`}>{resumen}</p>

            {alertas.length === 0 ? (
                <div className="alert-empty">
                    <span className="text-5xl" aria-hidden="true">🌾</span>
                    <p className="mt-3 text-xl font-extrabold text-navy">{copy.emptyTitle}</p>
                    <p className="text-navy/65">{copy.emptyText}</p>
                    <button type="button" onClick={onCapture} className="field-btn-primary mt-5 !w-auto px-8">
                        {copy.emptyAction}
                    </button>
                </div>
            ) : (
                NIVELES.map((nivel) => {
                    const grupo = alertas.filter((a) => a.nivel === nivel);
                    if (!grupo.length) {
                        return null;
                    }
                    return (
                        <div key={nivel} className="mt-7">
                            <h2 className={`alert-section is-${nivel}`}>{copy.sections[nivel]}</h2>
                            <motion.div
                                className="mt-3 grid gap-3"
                                variants={reduceMotion ? undefined : list}
                                initial={reduceMotion ? false : 'hidden'}
                                animate="show"
                            >
                                {grupo.map((alerta) => (
                                    <AlertCard
                                        key={alerta.id}
                                        alerta={alerta}
                                        copy={copy}
                                        onAction={onAction}
                                        reduceMotion={reduceMotion}
                                    />
                                ))}
                            </motion.div>
                        </div>
                    );
                })
            )}
        </section>
    );
}
