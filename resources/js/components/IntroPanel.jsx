import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { BRAND_NAME, BRAND_TAGLINE, LOGO_URL } from '../lib/brand.js';

const FEATURES = [
    { title: 'Funciona sin red', text: 'Cola pending → sending → confirmed. El diagnóstico de campo no se bloquea.' },
    { title: 'Diagnóstico ONNX local', text: 'La CNN corre en el dispositivo. Confianza baja no afirma Roya.' },
    { title: 'Validación técnica HITL', text: 'El técnico valida, rechaza o pide nueva muestra antes de tratar.' },
];

const WHEAT_SRC = '/imagenes/trigo-hero.jpg';
const ease = [0.22, 1, 0.36, 1];

function useChromaCutout(src) {
    const [cutout, setCutout] = useState(src);

    useEffect(() => {
        let revoked = false;
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) {
                return;
            }
            ctx.drawImage(image, 0, 0);
            const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const px = frame.data;
            const w = canvas.width;
            const pick = (x, y) => {
                const i = (Math.floor(y) * w + Math.floor(x)) * 4;
                return [px[i], px[i + 1], px[i + 2]];
            };
            const samples = [
                pick(6, 6),
                pick(w - 7, 6),
                pick(6, canvas.height - 7),
                pick(w - 7, canvas.height - 7),
                pick(w * 0.5, 6),
            ];
            const chroma = samples
                .reduce((acc, rgb) => [acc[0] + rgb[0], acc[1] + rgb[1], acc[2] + rgb[2]], [0, 0, 0])
                .map((value) => value / samples.length);

            for (let i = 0; i < px.length; i += 4) {
                const dr = px[i] - chroma[0];
                const dg = px[i + 1] - chroma[1];
                const db = px[i + 2] - chroma[2];
                const dist = Math.sqrt(dr * dr + dg * dg + db * db);
                if (dist < 58) {
                    px[i + 3] = 0;
                } else if (dist < 92) {
                    px[i + 3] = Math.round(((dist - 58) / 34) * 255);
                }
            }
            ctx.putImageData(frame, 0, 0);
            if (!revoked) {
                setCutout(canvas.toDataURL('image/png'));
            }
        };
        image.src = src;
        return () => {
            revoked = true;
        };
    }, [src]);

    return cutout;
}

const list = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export default function IntroPanel({ shift = { x: 0, y: 0 } }) {
    const reduceMotion = useReducedMotion();
    const wheatSrc = useChromaCutout(WHEAT_SRC);
    const [offline, setOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

    useEffect(() => {
        const on = () => setOffline(false);
        const off = () => setOffline(true);
        window.addEventListener('online', on);
        window.addEventListener('offline', off);
        return () => {
            window.removeEventListener('online', on);
            window.removeEventListener('offline', off);
        };
    }, []);

    return (
        <aside className="intro-panel">
            <div className="intro-halftone" aria-hidden="true" />

            <motion.div className="intro-copy" variants={list} initial={reduceMotion ? false : 'hidden'} animate="show">
                <motion.div className="intro-panel-top" variants={fadeUp}>
                    <a href="/login" className="intro-brand">
                        <img src={LOGO_URL} alt={BRAND_NAME} className="intro-brand-logo" />
                        <span>
                            <strong>{BRAND_NAME}</strong>
                            <small>{BRAND_TAGLINE}</small>
                        </span>
                    </a>
                    <span className={`intro-status ${offline ? 'is-offline' : ''}`}>
                        <span className="intro-status-dot" />
                        {offline ? 'Modo offline' : 'Inferencia local activa'}
                    </span>
                </motion.div>

                <motion.p className="intro-kicker" variants={fadeUp}>
                    PWA Edge · Valle del Mantaro
                </motion.p>
                <motion.h1 className="intro-title" variants={fadeUp}>
                    Detección temprana
                    <span>de Roya Amarilla</span>
                </motion.h1>
                <motion.p className="intro-lead" variants={fadeUp}>
                    Captura una hoja de trigo, diagnostica con ONNX en el dispositivo y sincroniza después. Sin red,
                    el campo no se detiene.
                </motion.p>

                <motion.div className="intro-cta-row" variants={fadeUp}>
                    <motion.a
                        className="intro-pill intro-pill-lime"
                        href="#intro-form"
                        whileHover={reduceMotion ? undefined : { scale: 1.06 }}
                        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    >
                        Acceder
                    </motion.a>
                    <motion.a
                        className="intro-pill intro-pill-ghost"
                        href="#intro-features"
                        whileHover={reduceMotion ? undefined : { scale: 1.06 }}
                        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    >
                        Cómo funciona
                    </motion.a>
                </motion.div>

                <motion.ul className="intro-features" id="intro-features" variants={fadeUp}>
                    {FEATURES.map((feature) => (
                        <li key={feature.title}>
                            <span className="intro-check" aria-hidden="true">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                                    <path d="M5 12.5 9.5 17 19 7" />
                                </svg>
                            </span>
                            <div>
                                <strong>{feature.title}</strong>
                                <p>{feature.text}</p>
                            </div>
                        </li>
                    ))}
                </motion.ul>
            </motion.div>

            <div className="intro-art">
                <div className="intro-wheat-stage">
                    <motion.div className="intro-wheat-wrap" style={{ x: shift.x * 0.55, y: shift.y * 0.25 }}>
                        <motion.img
                            className="intro-wheat"
                            src={wheatSrc}
                            alt=""
                            animate={reduceMotion ? { y: 0, rotate: 0 } : { y: [0, -14, 0], rotate: [0, 0.6, 0] }}
                            transition={
                                reduceMotion ? { duration: 0 } : { duration: 5.8, repeat: Infinity, ease: 'easeInOut' }
                            }
                        />
                    </motion.div>
                    <div className="intro-scan-anchor">
                        <motion.article
                            className="intro-scan-card"
                            aria-label="Simulación de ficha de resultado en 3 capas"
                            style={{ x: shift.x * -0.28, y: shift.y * -0.18 }}
                            animate={reduceMotion ? { y: 0 } : { y: [0, -10, 0] }}
                            transition={
                                reduceMotion
                                    ? { duration: 0 }
                                    : { duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }
                            }
                            whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                        >
                            <p className="intro-scan-kicker">Simulación de ficha · no es un diagnóstico</p>
                            <div className="intro-scan-visual">
                                <img src="/imagenes/trigo-hoja.jpg" alt="" />
                                <span className="intro-scan-live">Escaneo local</span>
                            </div>
                            <dl className="intro-layers">
                                <div>
                                    <dt>Clase</dt>
                                    <dd>en Campo</dd>
                                </div>
                                <div>
                                    <dt>Confianza</dt>
                                    <dd>0–100</dd>
                                </div>
                                <div>
                                    <dt>Severidad</dt>
                                    <dd>foliar</dd>
                                </div>
                            </dl>
                            <p className="intro-scan-note">
                                El ONNX afirma solo con ≥ 75 %. Confianza y severidad no se mezclan.
                            </p>
                        </motion.article>
                    </div>
                </div>
            </div>
        </aside>
    );
}
