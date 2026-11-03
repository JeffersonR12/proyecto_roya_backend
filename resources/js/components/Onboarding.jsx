import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { BRAND_NAME } from '../lib/brand.js';
import { UMBRAL_CONFIANZA } from '../lib/inference.js';

const ease = [0.22, 1, 0.36, 1];

// Muestra ilustrativa de la cola offline: tres capturas avanzando de estado.
const QUEUE = [
    { lote: 'Lote Norte', hora: '09:15' },
    { lote: 'Lote Norte', hora: '09:12' },
    { lote: 'Lote Sur', hora: '08:40' },
];
const STATES = [
    { id: 'pending', label: 'Guardado en el celular' },
    { id: 'sending', label: 'Enviando' },
    { id: 'confirmed', label: 'Confirmado' },
];

function CaptureVisual() {
    return (
        <>
            <img src="/imagenes/trigo-hoja.jpg" alt="Hoja de trigo encuadrada de borde a borde" />
            <svg className="onb-frame" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" aria-hidden="true">
                <path d="M0 16V0h16M84 0h16v16M100 84v16H84M16 100H0V84" stroke="currentColor" strokeWidth="3" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="onb-chips">
                <span>Luz de día</span>
                <span>A 20–30 cm</span>
                <span>Fondo simple</span>
            </div>
        </>
    );
}

function QueueVisual() {
    const reduceMotion = useReducedMotion();
    // El primer elemento acaba de tomarse; los demás ya van más adelantados.
    const [tick, setTick] = useState(reduceMotion ? 2 : 0);

    useEffect(() => {
        if (reduceMotion || tick >= 2) {
            return undefined;
        }
        const timer = window.setTimeout(() => setTick((value) => value + 1), 1400);
        return () => window.clearTimeout(timer);
    }, [tick, reduceMotion]);

    return (
        <div className="onb-queue" data-ui>
            <p className="onb-queue-head">
                <span className="auth-status-dot" style={{ background: 'var(--wheat)' }} aria-hidden="true" />
                Sin señal en el lote · el diagnóstico sigue
            </p>
            {QUEUE.map((row, index) => {
                const state = STATES[Math.min(index + tick, 2)];
                return (
                    <div className="onb-queue-row" key={`${row.lote}-${row.hora}`}>
                        <span>
                            <strong>{row.lote}</strong>
                            <small>Captura de las {row.hora}</small>
                        </span>
                        <motion.span
                            key={state.id}
                            className={`onb-state is-${state.id}`}
                            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, ease }}
                        >
                            {state.label}
                        </motion.span>
                    </div>
                );
            })}
        </div>
    );
}

function ConfidenceVisual() {
    const reduceMotion = useReducedMotion();
    const [value, setValue] = useState(62);
    const fill = useMotionValue(value / 100);
    const scaleX = useTransform(fill, (v) => v);
    const knobX = useTransform(fill, (v) => `${v * 100}%`);
    const affirms = value >= UMBRAL_CONFIANZA;

    useEffect(() => {
        if (reduceMotion) {
            fill.set(value / 100);
            return undefined;
        }
        const controls = animate(fill, value / 100, { type: 'spring', stiffness: 380, damping: 34 });
        return () => controls.stop();
    }, [value, reduceMotion, fill]);

    return (
        <div className="onb-gauge" data-ui>
            <div className="onb-gauge-figure">
                <output htmlFor="onb-confianza" aria-live="polite">
                    {value} %
                </output>
                <span className={`onb-verdict ${affirms ? 'is-roya' : 'is-unsure'}`}>
                    {affirms ? 'Roya amarilla' : 'No concluyente · repetir foto'}
                </span>
            </div>
            <div className="onb-meter">
                <div className="onb-track" aria-hidden="true">
                    <motion.span className="onb-track-fill" style={{ scaleX }} />
                    <span className="onb-track-tick" style={{ left: `${UMBRAL_CONFIANZA}%` }} />
                    <motion.span className="onb-knob-rail" style={{ x: knobX }}>
                        <span className="onb-knob" />
                    </motion.span>
                </div>
                <label className="sr-only" htmlFor="onb-confianza">
                    Confianza del modelo
                </label>
                <input
                    id="onb-confianza"
                    className="onb-range"
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(event) => setValue(Number(event.target.value))}
                    onKeyDown={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                />
            </div>
            <div className="onb-track-labels" aria-hidden="true">
                <span className="onb-track-threshold" style={{ left: `${UMBRAL_CONFIANZA}%` }}>
                    Umbral {UMBRAL_CONFIANZA} %
                </span>
            </div>
        </div>
    );
}

const STEPS = [
    {
        title: 'Fotografía la hoja entera',
        text: 'Con luz de día, a 20–30 cm y sobre un fondo simple. Una buena foto evita resultados no concluyentes.',
        Visual: CaptureVisual,
    },
    {
        title: 'El diagnóstico corre en tu celular',
        text: 'No necesitas señal en el lote: la captura se guarda y se envía sola cuando vuelve la conexión.',
        Visual: QueueVisual,
    },
    {
        title: 'Con confianza baja, no afirma roya',
        text: `Por debajo de ${UMBRAL_CONFIANZA} % el resultado queda como no concluyente y te pide otra foto. La severidad foliar se mide aparte.`,
        Visual: ConfidenceVisual,
    },
];

export default function Onboarding({ onDone }) {
    const reduceMotion = useReducedMotion();
    const [[page, direction], setPage] = useState([0, 0]);
    const dialogRef = useRef(null);
    const step = STEPS[page];
    const last = page === STEPS.length - 1;

    const go = (next) => {
        if (next < 0 || next >= STEPS.length) {
            return;
        }
        setPage([next, next > page ? 1 : -1]);
    };

    useEffect(() => {
        dialogRef.current?.focus();
    }, []);

    const onKeyDown = (event) => {
        if (event.key === 'ArrowRight') {
            go(page + 1);
        } else if (event.key === 'ArrowLeft') {
            go(page - 1);
        } else if (event.key === 'Escape') {
            onDone();
        }
    };

    const slide = reduceMotion
        ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
        : {
              initial: { opacity: 0, x: direction * 40 },
              animate: { opacity: 1, x: 0 },
              exit: { opacity: 0, x: direction * -40 },
          };

    return (
        <div className="onb-backdrop">
            <motion.div
                ref={dialogRef}
                className="onb"
                role="dialog"
                aria-modal="true"
                aria-labelledby="onb-title"
                tabIndex={-1}
                onKeyDown={onKeyDown}
                initial={reduceMotion ? false : { opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 34 }}
            >
                <div className="onb-head">
                    <div className="onb-progress" aria-label={`Paso ${page + 1} de ${STEPS.length}`} role="img">
                        {STEPS.map((item, index) => (
                            <span key={item.title} className={index <= page ? 'is-on' : ''} />
                        ))}
                    </div>
                    <button type="button" className="onb-skip" onClick={onDone}>
                        Saltar
                    </button>
                </div>

                <AnimatePresence mode="wait" initial={false} custom={direction}>
                    <motion.div
                        key={page}
                        className="onb-stage"
                        {...slide}
                        transition={{ duration: 0.28, ease }}
                        drag={reduceMotion ? false : 'x'}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.18}
                        onDragEnd={(event, info) => {
                            if (info.offset.x < -60) {
                                go(page + 1);
                            } else if (info.offset.x > 60) {
                                go(page - 1);
                            }
                        }}
                    >
                        <div className="onb-visual">
                            <step.Visual />
                        </div>
                        <h2 id="onb-title" className="onb-title">
                            {step.title}
                        </h2>
                        <p className="onb-text">{step.text}</p>
                    </motion.div>
                </AnimatePresence>

                <div className="onb-actions">
                    {page > 0 ? (
                        <button type="button" className="onb-btn is-secondary" onClick={() => go(page - 1)}>
                            Atrás
                        </button>
                    ) : null}
                    <button type="button" className="onb-btn is-primary" onClick={() => (last ? onDone() : go(page + 1))}>
                        {last ? `Ir a campo con ${BRAND_NAME}` : 'Siguiente'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
